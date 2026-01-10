-- Migration: Secure Operations - Server-Side Authorization for C4 Fix
-- Adds RPC functions that validate permissions server-side before allowing operations
-- This prevents client-side authorization bypass via localStorage manipulation

-- ============================================================================
-- SECURE EVENT CREATION
-- Validates: user exists, not banned, trust level is verified
-- ============================================================================

CREATE OR REPLACE FUNCTION create_event_secure(
  p_creator_id UUID,
  p_building_id TEXT,
  p_building_address TEXT,
  p_title TEXT,
  p_description TEXT,
  p_event_type TEXT,
  p_date_time TIMESTAMPTZ,
  p_duration_minutes INTEGER DEFAULT 60,
  p_location_name TEXT DEFAULT NULL,
  p_location_address TEXT DEFAULT NULL,
  p_is_virtual BOOLEAN DEFAULT FALSE,
  p_virtual_link TEXT DEFAULT NULL,
  p_group_id UUID DEFAULT NULL,
  p_is_group_wide BOOLEAN DEFAULT FALSE,
  p_vote_threshold INTEGER DEFAULT 3,
  p_recurrence_type TEXT DEFAULT 'none'
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  creator_record RECORD;
  new_event_id UUID;
BEGIN
  -- Get creator info
  SELECT id, nickname, role, trust_level, banned
  INTO creator_record
  FROM public.profiles
  WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check not banned
  IF creator_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Check trust level (must be verified to create events)
  IF creator_record.trust_level != 'verified' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only verified members can create events');
  END IF;

  -- Validate event type
  IF p_event_type NOT IN ('custom', 'meeting', 'committee', 'workshop', 'action', 'intake', 'social', 'other') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid event type');
  END IF;

  -- Create the event
  INSERT INTO public.events (
    building_id, building_address, title, description, event_type,
    date_time, duration_minutes, location_name, location_address,
    is_virtual, virtual_link, group_id, is_group_wide,
    created_by, created_by_name, vote_threshold, recurrence_type, status
  ) VALUES (
    p_building_id, p_building_address, p_title, p_description, p_event_type,
    p_date_time, p_duration_minutes, p_location_name, p_location_address,
    p_is_virtual, p_virtual_link, p_group_id, p_is_group_wide,
    p_creator_id, creator_record.nickname, p_vote_threshold, p_recurrence_type, 'proposed'
  )
  RETURNING id INTO new_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'event_id', new_event_id
  );
END;
$$;

-- ============================================================================
-- SECURE EVENT DELETION
-- Validates: user is creator OR admin
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_event_secure(
  p_actor_id UUID,
  p_event_id UUID
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  actor_record RECORD;
  event_record RECORD;
BEGIN
  -- Get actor info
  SELECT id, role, banned
  INTO actor_record
  FROM public.profiles
  WHERE id = p_actor_id;

  IF actor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF actor_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Get event info
  SELECT id, created_by
  INTO event_record
  FROM public.events
  WHERE id = p_event_id;

  IF event_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Check permission: must be creator or admin
  IF event_record.created_by != p_actor_id AND actor_record.role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only event creator or admin can delete this event');
  END IF;

  -- Delete the event
  DELETE FROM public.events WHERE id = p_event_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================================
-- SECURE EVENT UPDATE
-- Validates: user is creator OR admin
-- ============================================================================

CREATE OR REPLACE FUNCTION update_event_secure(
  p_actor_id UUID,
  p_event_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_date_time TIMESTAMPTZ DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL,
  p_is_virtual BOOLEAN DEFAULT NULL,
  p_virtual_link TEXT DEFAULT NULL
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  actor_record RECORD;
  event_record RECORD;
BEGIN
  -- Get actor info
  SELECT id, role, banned
  INTO actor_record
  FROM public.profiles
  WHERE id = p_actor_id;

  IF actor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF actor_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Get event info
  SELECT id, created_by
  INTO event_record
  FROM public.events
  WHERE id = p_event_id;

  IF event_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Check permission: must be creator or admin
  IF event_record.created_by != p_actor_id AND actor_record.role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only event creator or admin can update this event');
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('proposed', 'confirmed', 'cancelled', 'completed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid status');
  END IF;

  -- Update the event (only non-null fields)
  UPDATE public.events SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    status = COALESCE(p_status, status),
    date_time = COALESCE(p_date_time, date_time),
    location_name = COALESCE(p_location_name, location_name),
    is_virtual = COALESCE(p_is_virtual, is_virtual),
    virtual_link = COALESCE(p_virtual_link, virtual_link)
  WHERE id = p_event_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- ============================================================================
-- SECURE PROPOSAL CREATION
-- Validates: user is verified, NOT admin (Bookchin principle)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_proposal_secure(
  p_creator_id UUID,
  p_building_id TEXT,
  p_building_address TEXT,
  p_title TEXT,
  p_description TEXT,
  p_proposal_type TEXT,
  p_group_id UUID DEFAULT NULL
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  creator_record RECORD;
  new_proposal_id UUID;
BEGIN
  -- Get creator info
  SELECT id, nickname, role, trust_level, banned
  INTO creator_record
  FROM public.profiles
  WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF creator_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Bookchin principle: admins cannot create governance proposals
  IF creator_record.role = 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admins facilitate but do not participate in governance (Bookchin principle)');
  END IF;

  -- Check trust level
  IF creator_record.trust_level != 'verified' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only verified members can create proposals');
  END IF;

  -- Create the proposal
  INSERT INTO public.governance_proposals (
    building_id, building_address, title, description, proposal_type,
    group_id, created_by, created_by_name, status
  ) VALUES (
    p_building_id, p_building_address, p_title, p_description, p_proposal_type,
    p_group_id, p_creator_id, creator_record.nickname, 'discussion'
  )
  RETURNING id INTO new_proposal_id;

  RETURN jsonb_build_object(
    'success', true,
    'proposal_id', new_proposal_id
  );
EXCEPTION
  WHEN undefined_table THEN
    -- governance_proposals table doesn't exist yet
    RETURN jsonb_build_object('success', false, 'error', 'Governance proposals table not configured');
END;
$$;

-- ============================================================================
-- SECURE CAMPAIGN CREATION
-- Validates: user is organizer or admin
-- ============================================================================

CREATE OR REPLACE FUNCTION create_campaign_secure(
  p_creator_id UUID,
  p_name TEXT,
  p_building_ids TEXT[],
  p_building_addresses TEXT[],
  p_landlord_name TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_target_date DATE DEFAULT NULL,
  p_estimated_units INTEGER DEFAULT NULL
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  creator_record RECORD;
  new_campaign_id UUID;
BEGIN
  -- Get creator info
  SELECT id, role, trust_level, banned
  INTO creator_record
  FROM public.profiles
  WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF creator_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Only organizers and admins can create campaigns
  IF creator_record.role NOT IN ('organizer', 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only organizers can create campaigns');
  END IF;

  -- Create the campaign
  INSERT INTO public.campaigns (
    name, building_ids, building_addresses, landlord_name,
    start_date, target_date, estimated_units, created_by
  ) VALUES (
    p_name, p_building_ids, p_building_addresses, p_landlord_name,
    p_start_date, p_target_date, p_estimated_units, p_creator_id
  )
  RETURNING id INTO new_campaign_id;

  RETURN jsonb_build_object(
    'success', true,
    'campaign_id', new_campaign_id
  );
END;
$$;

-- ============================================================================
-- SECURE MUTUAL AID POST CREATION
-- Validates: user is verified
-- ============================================================================

CREATE OR REPLACE FUNCTION create_mutual_aid_post_secure(
  p_creator_id UUID,
  p_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_details TEXT,
  p_building_id TEXT,
  p_building_address TEXT,
  p_expires_days INTEGER DEFAULT 30
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  creator_record RECORD;
  new_post_id UUID;
BEGIN
  -- Get creator info
  SELECT id, nickname, trust_level, banned
  INTO creator_record
  FROM public.profiles
  WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF creator_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  IF creator_record.trust_level != 'verified' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only verified members can create mutual aid posts');
  END IF;

  -- Validate type
  IF p_type NOT IN ('need', 'offer') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid post type');
  END IF;

  -- Create the post
  INSERT INTO public.mutual_aid_posts (
    type, category, title, details, building_id, building_address,
    author_id, author_name, expires_at
  ) VALUES (
    p_type, p_category, p_title, p_details, p_building_id, p_building_address,
    p_creator_id, creator_record.nickname, NOW() + (p_expires_days || ' days')::INTERVAL
  )
  RETURNING id INTO new_post_id;

  RETURN jsonb_build_object(
    'success', true,
    'post_id', new_post_id
  );
END;
$$;

-- ============================================================================
-- SECURE COMPLAINT DELETION
-- Validates: user is creator OR admin
-- ============================================================================

CREATE OR REPLACE FUNCTION delete_complaint_secure(
  p_actor_id UUID,
  p_complaint_id UUID
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  actor_record RECORD;
  complaint_record RECORD;
BEGIN
  -- Get actor info
  SELECT id, role, banned
  INTO actor_record
  FROM public.profiles
  WHERE id = p_actor_id;

  IF actor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  IF actor_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Get complaint info
  SELECT id, submitted_by
  INTO complaint_record
  FROM public.building_complaints
  WHERE id = p_complaint_id;

  IF complaint_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Complaint not found');
  END IF;

  -- Check permission: must be creator or admin
  IF complaint_record.submitted_by != p_actor_id AND actor_record.role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only complaint creator or admin can delete this');
  END IF;

  -- Delete the complaint
  DELETE FROM public.building_complaints WHERE id = p_complaint_id;

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN undefined_table THEN
    RETURN jsonb_build_object('success', false, 'error', 'Complaints table not configured');
END;
$$;

-- ============================================================================
-- GENERIC PERMISSION CHECK FUNCTION
-- Can be used by client to pre-check permissions before showing UI
-- ============================================================================

CREATE OR REPLACE FUNCTION check_action_permission(
  p_actor_id UUID,
  p_action TEXT
) RETURNS JSONB
SET search_path = ''
LANGUAGE plpgsql AS $$
DECLARE
  actor_record RECORD;
BEGIN
  -- Get actor info
  SELECT id, role, trust_level, banned
  INTO actor_record
  FROM public.profiles
  WHERE id = p_actor_id;

  IF actor_record IS NULL THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'User not found');
  END IF;

  IF actor_record.banned THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'Account is banned');
  END IF;

  CASE p_action
    WHEN 'create:event', 'create:proposal', 'vote:proposal', 'vote:event', 'send:message' THEN
      IF actor_record.trust_level != 'verified' THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Only verified members can perform this action');
      END IF;
      -- Bookchin: admins can't vote or create proposals
      IF p_action IN ('vote:proposal', 'create:proposal') AND actor_record.role = 'admin' THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Admins facilitate but do not participate (Bookchin)');
      END IF;
      RETURN jsonb_build_object('allowed', true);

    WHEN 'create:campaign', 'create:invite' THEN
      IF actor_record.role NOT IN ('organizer', 'admin') THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Only organizers can perform this action');
      END IF;
      RETURN jsonb_build_object('allowed', true);

    WHEN 'ban:user', 'unban:user', 'change:role' THEN
      IF actor_record.role != 'admin' THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Only admins can perform this action');
      END IF;
      RETURN jsonb_build_object('allowed', true);

    WHEN 'mute:user', 'unmute:user' THEN
      IF actor_record.role NOT IN ('organizer', 'admin') THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'Only organizers can mute/unmute');
      END IF;
      RETURN jsonb_build_object('allowed', true);

    ELSE
      RETURN jsonb_build_object('allowed', false, 'reason', 'Unknown action');
  END CASE;
END;
$$;

-- ============================================================================
-- GRANT EXECUTE TO ANON/AUTHENTICATED ROLES
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.create_event_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_event_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_event_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_proposal_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_campaign_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_mutual_aid_post_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_complaint_secure TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_action_permission TO anon, authenticated;
