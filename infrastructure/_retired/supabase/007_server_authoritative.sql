-- Migration: Server-Authoritative Architecture
-- This migration creates tables and functions for server-side validation
-- of security-critical and collaborative data.

-- ============================================================================
-- PROFILES TABLE: Add ban columns (required for server-authoritative bans)
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_profiles_banned ON profiles(banned) WHERE banned = true;

-- ============================================================================
-- VOTE RECORDS (replaces localStorage arrays)
-- ============================================================================

-- Proposal votes - individual vote records for governance proposals
CREATE TABLE IF NOT EXISTS proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL,
  voter_id UUID REFERENCES profiles(id) NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal ON proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_voter ON proposal_votes(voter_id);

-- Event votes - for voting on proposed events
CREATE TABLE IF NOT EXISTS event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  voter_id UUID REFERENCES profiles(id) NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, voter_id)
);

CREATE INDEX IF NOT EXISTS idx_event_votes_event ON event_votes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_votes_voter ON event_votes(voter_id);

-- ============================================================================
-- BAN/MUTE RECORDS (server authoritative)
-- ============================================================================

-- Ban records - cannot be bypassed via localStorage
CREATE TABLE IF NOT EXISTS ban_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('global', 'group', 'building')),
  scope_id TEXT, -- group_id or building_id (null for global bans)
  reason TEXT,
  banned_by UUID REFERENCES profiles(id) NOT NULL,
  banned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_bans_profile ON ban_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_bans_active ON ban_records(profile_id) WHERE lifted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bans_scope ON ban_records(scope_type, scope_id);

-- Mute records - for chat muting
CREATE TABLE IF NOT EXISTS mute_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  scope_type TEXT NOT NULL CHECK (scope_type IN ('group', 'building')),
  scope_id TEXT NOT NULL,
  reason TEXT,
  muted_by UUID REFERENCES profiles(id) NOT NULL,
  muted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  lifted_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_mutes_profile ON mute_records(profile_id);
CREATE INDEX IF NOT EXISTS idx_mutes_active ON mute_records(profile_id) WHERE lifted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mutes_scope ON mute_records(scope_type, scope_id);

-- ============================================================================
-- EVENTS TABLE (collaborative data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id TEXT NOT NULL,
  building_address TEXT NOT NULL,
  group_id UUID,
  is_group_wide BOOLEAN DEFAULT FALSE,
  campaign_id UUID,

  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('custom', 'meeting', 'committee', 'workshop', 'action', 'intake', 'social', 'other')),
  status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'confirmed', 'cancelled', 'completed')),

  date_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,

  location_name TEXT,
  location_address TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  virtual_link TEXT,

  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  vote_threshold INTEGER DEFAULT 3,

  -- Recurrence support
  recurrence_type TEXT CHECK (recurrence_type IN ('none', 'weekly', 'biweekly', 'monthly')),
  series_id UUID,
  occurrence_number INTEGER,

  -- Meeting notes
  notes JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_events_building ON events(building_id);
CREATE INDEX IF NOT EXISTS idx_events_group ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_datetime ON events(date_time);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  profile_nickname TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_profile ON event_rsvps(profile_id);

-- ============================================================================
-- CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  building_ids TEXT[] NOT NULL,
  building_addresses TEXT[],
  landlord_name TEXT,

  stage TEXT NOT NULL DEFAULT 'intelligence' CHECK (stage IN ('intelligence', 'organizing', 'commitment', 'preparation', 'active', 'resolved')),
  outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'won', 'lost', 'partial')),

  start_date DATE NOT NULL,
  target_date DATE,
  resolved_date DATE,

  demands JSONB DEFAULT '[]',
  stage_changes JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',

  estimated_units INTEGER,
  participating_units INTEGER,
  monthly_rent_at_risk INTEGER,

  next_action TEXT,
  next_action_date DATE,
  next_action_assignee TEXT,

  outcome_details TEXT,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_stage ON campaigns(stage);
CREATE INDEX IF NOT EXISTS idx_campaigns_outcome ON campaigns(outcome);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);

-- ============================================================================
-- MUTUAL AID TABLES
-- ============================================================================

-- Mutual aid posts (needs/offers)
CREATE TABLE IF NOT EXISTS mutual_aid_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('need', 'offer')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  building_id TEXT NOT NULL,
  building_address TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'fulfilled', 'expired')),
  fulfilled_by UUID REFERENCES profiles(id),
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_posts_building ON mutual_aid_posts(building_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON mutual_aid_posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON mutual_aid_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON mutual_aid_posts(author_id);

-- Mutual aid resources (tool/equipment library)
CREATE TABLE IF NOT EXISTS mutual_aid_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('tool', 'book', 'equipment', 'other')),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  owner_name TEXT NOT NULL,
  building_id TEXT NOT NULL,
  building_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
  checked_out_by UUID REFERENCES profiles(id),
  checked_out_by_name TEXT,
  checked_out_at TIMESTAMPTZ,
  return_by TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_building ON mutual_aid_resources(building_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON mutual_aid_resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_owner ON mutual_aid_resources(owner_id);

-- Skill profiles
CREATE TABLE IF NOT EXISTS skill_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  member_name TEXT NOT NULL,
  building_id TEXT,
  building_address TEXT,
  skills JSONB NOT NULL DEFAULT '[]',
  availability TEXT,
  contact_preference TEXT CHECK (contact_preference IN ('chat', 'profile')),
  languages TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_member ON skill_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_skills_building ON skill_profiles(building_id);

-- ============================================================================
-- SERVER-SIDE VALIDATION FUNCTIONS
-- ============================================================================

-- Cast a vote with server-side validation
CREATE OR REPLACE FUNCTION cast_vote(
  p_target_type TEXT,  -- 'proposal' or 'event'
  p_target_id UUID,
  p_voter_id UUID,
  p_vote TEXT
) RETURNS JSONB AS $$
DECLARE
  voter_record RECORD;
BEGIN
  -- Validate vote value
  IF p_vote NOT IN ('up', 'down') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid vote value');
  END IF;

  -- Get voter info
  SELECT role, banned INTO voter_record FROM profiles WHERE id = p_voter_id;

  IF voter_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Voter not found');
  END IF;

  -- Check not banned
  IF voter_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Bookchin principle: admins cannot vote on governance
  IF voter_record.role = 'admin' AND p_target_type = 'proposal' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Admins cannot vote on governance proposals');
  END IF;

  -- Insert/update vote
  IF p_target_type = 'proposal' THEN
    INSERT INTO proposal_votes (proposal_id, voter_id, vote)
    VALUES (p_target_id, p_voter_id, p_vote)
    ON CONFLICT (proposal_id, voter_id) DO UPDATE SET vote = p_vote, voted_at = NOW();
  ELSIF p_target_type = 'event' THEN
    INSERT INTO event_votes (event_id, voter_id, vote)
    VALUES (p_target_id, p_voter_id, p_vote)
    ON CONFLICT (event_id, voter_id) DO UPDATE SET vote = p_vote, voted_at = NOW();
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid target type');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Get vote counts for a proposal
CREATE OR REPLACE FUNCTION get_proposal_votes(p_proposal_id UUID)
RETURNS JSONB AS $$
DECLARE
  up_count INTEGER;
  down_count INTEGER;
  up_voters UUID[];
  down_voters UUID[];
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE vote = 'up'),
    COUNT(*) FILTER (WHERE vote = 'down'),
    array_agg(voter_id) FILTER (WHERE vote = 'up'),
    array_agg(voter_id) FILTER (WHERE vote = 'down')
  INTO up_count, down_count, up_voters, down_voters
  FROM proposal_votes
  WHERE proposal_id = p_proposal_id;

  RETURN jsonb_build_object(
    'upvotes', COALESCE(up_count, 0),
    'downvotes', COALESCE(down_count, 0),
    'upvoters', COALESCE(up_voters, ARRAY[]::UUID[]),
    'downvoters', COALESCE(down_voters, ARRAY[]::UUID[])
  );
END;
$$ LANGUAGE plpgsql;

-- Check if a user is banned (with scope)
CREATE OR REPLACE FUNCTION check_ban_status(
  p_profile_id UUID,
  p_scope_type TEXT DEFAULT NULL,
  p_scope_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  ban_record RECORD;
BEGIN
  -- Check global ban first
  SELECT * INTO ban_record
  FROM ban_records
  WHERE profile_id = p_profile_id
    AND scope_type = 'global'
    AND lifted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;

  IF ban_record IS NOT NULL THEN
    RETURN jsonb_build_object(
      'banned', true,
      'scope', 'global',
      'reason', ban_record.reason,
      'expires_at', ban_record.expires_at
    );
  END IF;

  -- Check scoped ban if scope provided
  IF p_scope_type IS NOT NULL AND p_scope_id IS NOT NULL THEN
    SELECT * INTO ban_record
    FROM ban_records
    WHERE profile_id = p_profile_id
      AND scope_type = p_scope_type
      AND scope_id = p_scope_id
      AND lifted_at IS NULL
      AND (expires_at IS NULL OR expires_at > NOW())
    LIMIT 1;

    IF ban_record IS NOT NULL THEN
      RETURN jsonb_build_object(
        'banned', true,
        'scope', p_scope_type,
        'scope_id', p_scope_id,
        'reason', ban_record.reason,
        'expires_at', ban_record.expires_at
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('banned', false);
END;
$$ LANGUAGE plpgsql;

-- Validate role change (only admins can change roles)
CREATE OR REPLACE FUNCTION validate_role_change(
  p_actor_id UUID,
  p_target_id UUID,
  p_new_role TEXT
) RETURNS JSONB AS $$
DECLARE
  actor_role TEXT;
  target_role TEXT;
BEGIN
  -- Get roles
  SELECT role INTO actor_role FROM profiles WHERE id = p_actor_id;
  SELECT role INTO target_role FROM profiles WHERE id = p_target_id;

  -- Only admins can change roles
  IF actor_role != 'admin' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Only admins can change roles');
  END IF;

  -- Cannot demote other admins (unless self)
  IF target_role = 'admin' AND p_new_role != 'admin' AND p_actor_id != p_target_id THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Cannot demote other admins');
  END IF;

  -- Valid role values
  IF p_new_role NOT IN ('tenant', 'organizer', 'admin') THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid role');
  END IF;

  RETURN jsonb_build_object('valid', true);
END;
$$ LANGUAGE plpgsql;

-- Ban a user (with validation)
CREATE OR REPLACE FUNCTION ban_user(
  p_actor_id UUID,
  p_target_id UUID,
  p_scope_type TEXT,
  p_scope_id TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  actor_role TEXT;
  target_role TEXT;
BEGIN
  SELECT role INTO actor_role FROM profiles WHERE id = p_actor_id;
  SELECT role INTO target_role FROM profiles WHERE id = p_target_id;

  -- Only admins can ban
  IF actor_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can ban users');
  END IF;

  -- Cannot ban other admins
  IF target_role = 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot ban admin users');
  END IF;

  -- Cannot ban self
  IF p_actor_id = p_target_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot ban yourself');
  END IF;

  -- Create ban record
  INSERT INTO ban_records (profile_id, scope_type, scope_id, reason, banned_by, expires_at)
  VALUES (p_target_id, p_scope_type, p_scope_id, p_reason, p_actor_id, p_expires_at)
  ON CONFLICT DO NOTHING;

  -- Update profile banned flag for global bans
  IF p_scope_type = 'global' THEN
    UPDATE profiles SET banned = true, banned_at = NOW(), banned_by = p_actor_id
    WHERE id = p_target_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Unban a user
CREATE OR REPLACE FUNCTION unban_user(
  p_actor_id UUID,
  p_target_id UUID,
  p_scope_type TEXT DEFAULT 'global',
  p_scope_id TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  actor_role TEXT;
BEGIN
  SELECT role INTO actor_role FROM profiles WHERE id = p_actor_id;

  IF actor_role != 'admin' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can unban users');
  END IF;

  -- Lift the ban
  UPDATE ban_records
  SET lifted_at = NOW(), lifted_by = p_actor_id
  WHERE profile_id = p_target_id
    AND scope_type = p_scope_type
    AND (scope_id = p_scope_id OR (scope_id IS NULL AND p_scope_id IS NULL))
    AND lifted_at IS NULL;

  -- Update profile for global unbans
  IF p_scope_type = 'global' THEN
    UPDATE profiles SET banned = false, banned_at = NULL, banned_by = NULL
    WHERE id = p_target_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql;
