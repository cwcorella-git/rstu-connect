-- Migration: Identity-Based RLS Policies
-- Replaces permissive 'true' policies with actual security checks
--
-- Strategy:
-- 1. Use app.current_user_id session variable (set by application)
-- 2. Users can only modify their own records
-- 3. Role/trust_level changes require admin privileges
-- 4. Voting/moderation goes through server functions (not direct table access)

-- ============================================================================
-- RPC FUNCTIONS: Set/Clear User Context
-- Called by application before Supabase operations
-- ============================================================================

-- Set the current user ID in session context
CREATE OR REPLACE FUNCTION set_user_context(user_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Clear the current user context
CREATE OR REPLACE FUNCTION clear_user_context()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- HELPER FUNCTION: Get current user ID from session context
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_user_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- HELPER FUNCTION: Check if current user is admin
-- ============================================================================

CREATE OR REPLACE FUNCTION is_current_user_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = get_current_user_id();

  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- HELPER FUNCTION: Check if current user is organizer or higher
-- ============================================================================

CREATE OR REPLACE FUNCTION is_current_user_organizer_or_higher()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = get_current_user_id();

  RETURN user_role IN ('organizer', 'admin');
EXCEPTION
  WHEN OTHERS THEN RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- PROFILES TABLE: Secure policies
-- ============================================================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS profiles_select ON public.profiles;
DROP POLICY IF EXISTS profiles_insert ON public.profiles;
DROP POLICY IF EXISTS profiles_update ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;

-- Everyone can read profiles (for display purposes)
CREATE POLICY profiles_select_all ON public.profiles
  FOR SELECT USING (true);

-- Users can insert their own profile (during registration)
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (
    -- Either no current user (initial registration) or inserting own profile
    get_current_user_id() IS NULL OR id = get_current_user_id()
  );

-- Users can update their own profile, but NOT role or trust_level
-- This uses a trigger to enforce the restriction (see below)
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (id = get_current_user_id());

-- Admins can update any profile (including role changes)
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE USING (is_current_user_admin());

-- ============================================================================
-- TRIGGER: Prevent non-admin role/trust_level changes
-- ============================================================================

CREATE OR REPLACE FUNCTION check_profile_update_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- If role or trust_level is changing, must be admin
  IF (OLD.role IS DISTINCT FROM NEW.role OR OLD.trust_level IS DISTINCT FROM NEW.trust_level) THEN
    IF NOT is_current_user_admin() THEN
      RAISE EXCEPTION 'Only admins can change role or trust_level';
    END IF;
  END IF;

  -- If banned status is changing, must be admin
  IF (OLD.banned IS DISTINCT FROM NEW.banned) THEN
    IF NOT is_current_user_admin() THEN
      RAISE EXCEPTION 'Only admins can change ban status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS check_profile_update_permissions_trigger ON public.profiles;

-- Create trigger
CREATE TRIGGER check_profile_update_permissions_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_profile_update_permissions();

-- ============================================================================
-- PROPOSAL_VOTES TABLE: Only vote for yourself
-- ============================================================================

DROP POLICY IF EXISTS proposal_votes_select ON public.proposal_votes;
DROP POLICY IF EXISTS proposal_votes_insert ON public.proposal_votes;
DROP POLICY IF EXISTS proposal_votes_update ON public.proposal_votes;
DROP POLICY IF EXISTS proposal_votes_insert_own ON public.proposal_votes;

-- Everyone can see votes (transparency)
CREATE POLICY proposal_votes_select_all ON public.proposal_votes
  FOR SELECT USING (true);

-- Can only insert votes with your own voter_id
CREATE POLICY proposal_votes_insert_own ON public.proposal_votes
  FOR INSERT WITH CHECK (voter_id = get_current_user_id());

-- Can only update your own votes
CREATE POLICY proposal_votes_update_own ON public.proposal_votes
  FOR UPDATE USING (voter_id = get_current_user_id());

-- No direct deletes (votes are permanent, can only change direction)
CREATE POLICY proposal_votes_no_delete ON public.proposal_votes
  FOR DELETE USING (false);

-- ============================================================================
-- EVENT_VOTES TABLE: Only vote for yourself
-- ============================================================================

DROP POLICY IF EXISTS event_votes_select ON public.event_votes;
DROP POLICY IF EXISTS event_votes_insert ON public.event_votes;
DROP POLICY IF EXISTS event_votes_update ON public.event_votes;

-- Everyone can see votes
CREATE POLICY event_votes_select_all ON public.event_votes
  FOR SELECT USING (true);

-- Can only insert votes with your own voter_id
CREATE POLICY event_votes_insert_own ON public.event_votes
  FOR INSERT WITH CHECK (voter_id = get_current_user_id());

-- Can only update your own votes
CREATE POLICY event_votes_update_own ON public.event_votes
  FOR UPDATE USING (voter_id = get_current_user_id());

-- No direct deletes
CREATE POLICY event_votes_no_delete ON public.event_votes
  FOR DELETE USING (false);

-- ============================================================================
-- BAN_RECORDS TABLE: Admin only
-- ============================================================================

DROP POLICY IF EXISTS ban_records_select ON public.ban_records;
DROP POLICY IF EXISTS ban_records_insert ON public.ban_records;
DROP POLICY IF EXISTS ban_records_update ON public.ban_records;

-- Everyone can see bans (for transparency and client-side checks)
CREATE POLICY ban_records_select_all ON public.ban_records
  FOR SELECT USING (true);

-- Only admins can create bans
CREATE POLICY ban_records_insert_admin ON public.ban_records
  FOR INSERT WITH CHECK (is_current_user_admin());

-- Only admins can update bans (e.g., lift them)
CREATE POLICY ban_records_update_admin ON public.ban_records
  FOR UPDATE USING (is_current_user_admin());

-- Only admins can delete bans
CREATE POLICY ban_records_delete_admin ON public.ban_records
  FOR DELETE USING (is_current_user_admin());

-- ============================================================================
-- MUTE_RECORDS TABLE: Organizer+ only
-- ============================================================================

DROP POLICY IF EXISTS mute_records_select ON public.mute_records;
DROP POLICY IF EXISTS mute_records_insert ON public.mute_records;
DROP POLICY IF EXISTS mute_records_update ON public.mute_records;

-- Everyone can see mutes
CREATE POLICY mute_records_select_all ON public.mute_records
  FOR SELECT USING (true);

-- Organizers+ can create mutes
CREATE POLICY mute_records_insert_organizer ON public.mute_records
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

-- Organizers+ can update mutes
CREATE POLICY mute_records_update_organizer ON public.mute_records
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- Organizers+ can delete mutes
CREATE POLICY mute_records_delete_organizer ON public.mute_records
  FOR DELETE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- INVITE_CODES TABLE: Organizer+ only for creation
-- ============================================================================

DROP POLICY IF EXISTS invite_codes_select ON public.invite_codes;
DROP POLICY IF EXISTS invite_codes_insert ON public.invite_codes;
DROP POLICY IF EXISTS invite_codes_update ON public.invite_codes;

-- Everyone can read invite codes (to validate during registration)
CREATE POLICY invite_codes_select_all ON public.invite_codes
  FOR SELECT USING (true);

-- Organizers+ can create invite codes
CREATE POLICY invite_codes_insert_organizer ON public.invite_codes
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

-- Creator or organizer+ can update (revoke, increment used_count)
CREATE POLICY invite_codes_update_owner_or_organizer ON public.invite_codes
  FOR UPDATE USING (
    created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- ============================================================================
-- EVENTS TABLE: Creator or organizer+ for modifications
-- ============================================================================

DROP POLICY IF EXISTS events_select ON public.events;
DROP POLICY IF EXISTS events_insert ON public.events;
DROP POLICY IF EXISTS events_update ON public.events;
DROP POLICY IF EXISTS events_delete ON public.events;

-- Everyone can read events
CREATE POLICY events_select_all ON public.events
  FOR SELECT USING (true);

-- Verified users can create events (trust check done in application)
CREATE POLICY events_insert_verified ON public.events
  FOR INSERT WITH CHECK (created_by = get_current_user_id());

-- Creator or organizer+ can update
CREATE POLICY events_update_owner_or_organizer ON public.events
  FOR UPDATE USING (
    created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- Creator or admin can delete
CREATE POLICY events_delete_owner_or_admin ON public.events
  FOR DELETE USING (
    created_by = get_current_user_id() OR is_current_user_admin()
  );

-- ============================================================================
-- EVENT_RSVPS TABLE: Own RSVPs only
-- ============================================================================

DROP POLICY IF EXISTS event_rsvps_select ON public.event_rsvps;
DROP POLICY IF EXISTS event_rsvps_insert ON public.event_rsvps;
DROP POLICY IF EXISTS event_rsvps_update ON public.event_rsvps;
DROP POLICY IF EXISTS event_rsvps_delete ON public.event_rsvps;

-- Everyone can see RSVPs
CREATE POLICY event_rsvps_select_all ON public.event_rsvps
  FOR SELECT USING (true);

-- Can only RSVP for yourself
CREATE POLICY event_rsvps_insert_own ON public.event_rsvps
  FOR INSERT WITH CHECK (profile_id = get_current_user_id());

-- Can only update your own RSVP
CREATE POLICY event_rsvps_update_own ON public.event_rsvps
  FOR UPDATE USING (profile_id = get_current_user_id());

-- Can only delete your own RSVP
CREATE POLICY event_rsvps_delete_own ON public.event_rsvps
  FOR DELETE USING (profile_id = get_current_user_id());

-- ============================================================================
-- MUTUAL_AID_POSTS TABLE: Author or organizer+ for modifications
-- ============================================================================

DROP POLICY IF EXISTS mutual_aid_posts_select ON public.mutual_aid_posts;
DROP POLICY IF EXISTS mutual_aid_posts_insert ON public.mutual_aid_posts;
DROP POLICY IF EXISTS mutual_aid_posts_update ON public.mutual_aid_posts;
DROP POLICY IF EXISTS mutual_aid_posts_delete ON public.mutual_aid_posts;

-- Everyone can read posts
CREATE POLICY mutual_aid_posts_select_all ON public.mutual_aid_posts
  FOR SELECT USING (true);

-- Users can create their own posts
CREATE POLICY mutual_aid_posts_insert_own ON public.mutual_aid_posts
  FOR INSERT WITH CHECK (author_id = get_current_user_id());

-- Author or organizer+ can update
CREATE POLICY mutual_aid_posts_update_owner_or_organizer ON public.mutual_aid_posts
  FOR UPDATE USING (
    author_id = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- Author or organizer+ can delete
CREATE POLICY mutual_aid_posts_delete_owner_or_organizer ON public.mutual_aid_posts
  FOR DELETE USING (
    author_id = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- ============================================================================
-- MUTUAL_AID_RESOURCES TABLE: Owner or organizer+ for modifications
-- ============================================================================

DROP POLICY IF EXISTS mutual_aid_resources_select ON public.mutual_aid_resources;
DROP POLICY IF EXISTS mutual_aid_resources_insert ON public.mutual_aid_resources;
DROP POLICY IF EXISTS mutual_aid_resources_update ON public.mutual_aid_resources;
DROP POLICY IF EXISTS mutual_aid_resources_delete ON public.mutual_aid_resources;

-- Everyone can read resources
CREATE POLICY mutual_aid_resources_select_all ON public.mutual_aid_resources
  FOR SELECT USING (true);

-- Users can add their own resources
CREATE POLICY mutual_aid_resources_insert_own ON public.mutual_aid_resources
  FOR INSERT WITH CHECK (owner_id = get_current_user_id());

-- Owner or organizer+ can update
CREATE POLICY mutual_aid_resources_update_owner_or_organizer ON public.mutual_aid_resources
  FOR UPDATE USING (
    owner_id = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- Owner or admin can delete
CREATE POLICY mutual_aid_resources_delete_owner_or_admin ON public.mutual_aid_resources
  FOR DELETE USING (
    owner_id = get_current_user_id() OR is_current_user_admin()
  );

-- ============================================================================
-- SKILL_PROFILES TABLE: Own profile only
-- ============================================================================

DROP POLICY IF EXISTS skill_profiles_select ON public.skill_profiles;
DROP POLICY IF EXISTS skill_profiles_insert ON public.skill_profiles;
DROP POLICY IF EXISTS skill_profiles_update ON public.skill_profiles;

-- Everyone can read (for matching)
CREATE POLICY skill_profiles_select_all ON public.skill_profiles
  FOR SELECT USING (true);

-- Can only create your own skill profile
CREATE POLICY skill_profiles_insert_own ON public.skill_profiles
  FOR INSERT WITH CHECK (member_id = get_current_user_id());

-- Can only update your own skill profile
CREATE POLICY skill_profiles_update_own ON public.skill_profiles
  FOR UPDATE USING (member_id = get_current_user_id());

-- ============================================================================
-- CAMPAIGNS TABLE: Creator or organizer+ for modifications
-- ============================================================================

DROP POLICY IF EXISTS campaigns_select ON public.campaigns;
DROP POLICY IF EXISTS campaigns_insert ON public.campaigns;
DROP POLICY IF EXISTS campaigns_update ON public.campaigns;

-- Everyone can read campaigns
CREATE POLICY campaigns_select_all ON public.campaigns
  FOR SELECT USING (true);

-- Organizers+ can create campaigns
CREATE POLICY campaigns_insert_organizer ON public.campaigns
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

-- Creator or organizer+ can update
CREATE POLICY campaigns_update_owner_or_organizer ON public.campaigns
  FOR UPDATE USING (
    created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- ============================================================================
-- CANVASS_UNITS TABLE: Organizer+ only
-- ============================================================================

DROP POLICY IF EXISTS canvass_units_select ON public.canvass_units;
DROP POLICY IF EXISTS canvass_units_insert ON public.canvass_units;
DROP POLICY IF EXISTS canvass_units_update ON public.canvass_units;

-- Organizers+ can read canvass data (contains contact info)
CREATE POLICY canvass_units_select_organizer ON public.canvass_units
  FOR SELECT USING (is_current_user_organizer_or_higher());

-- Organizers+ can create canvass records
CREATE POLICY canvass_units_insert_organizer ON public.canvass_units
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

-- Organizers+ can update canvass records
CREATE POLICY canvass_units_update_organizer ON public.canvass_units
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- DOCUMENT ADMIN TABLES: Admin only for modifications
-- ============================================================================

-- document_admin_state
DROP POLICY IF EXISTS document_admin_state_select ON public.document_admin_state;
DROP POLICY IF EXISTS document_admin_state_insert ON public.document_admin_state;
DROP POLICY IF EXISTS document_admin_state_update ON public.document_admin_state;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_admin_state') THEN
    EXECUTE 'CREATE POLICY document_admin_state_select_all ON public.document_admin_state FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY document_admin_state_insert_admin ON public.document_admin_state FOR INSERT WITH CHECK (is_current_user_admin())';
    EXECUTE 'CREATE POLICY document_admin_state_update_admin ON public.document_admin_state FOR UPDATE USING (is_current_user_admin())';
  END IF;
END $$;

-- document_edits
DROP POLICY IF EXISTS document_edits_select ON public.document_edits;
DROP POLICY IF EXISTS document_edits_insert ON public.document_edits;
DROP POLICY IF EXISTS document_edits_update ON public.document_edits;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'document_edits') THEN
    EXECUTE 'CREATE POLICY document_edits_select_all ON public.document_edits FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY document_edits_insert_admin ON public.document_edits FOR INSERT WITH CHECK (is_current_user_admin())';
    EXECUTE 'CREATE POLICY document_edits_update_admin ON public.document_edits FOR UPDATE USING (is_current_user_admin())';
  END IF;
END $$;

-- ============================================================================
-- BUILDING COMPLAINTS/DEMANDS: User for own, organizer+ for all
-- ============================================================================

DROP POLICY IF EXISTS building_complaints_select ON public.building_complaints;
DROP POLICY IF EXISTS building_complaints_insert ON public.building_complaints;
DROP POLICY IF EXISTS building_complaints_update ON public.building_complaints;

-- Everyone can read complaints
CREATE POLICY building_complaints_select_all ON public.building_complaints
  FOR SELECT USING (true);

-- Users can submit their own complaints
CREATE POLICY building_complaints_insert_own ON public.building_complaints
  FOR INSERT WITH CHECK (submitted_by = get_current_user_id());

-- Submitter or organizer+ can update
CREATE POLICY building_complaints_update_owner_or_organizer ON public.building_complaints
  FOR UPDATE USING (
    submitted_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

DROP POLICY IF EXISTS building_demands_select ON public.building_demands;
DROP POLICY IF EXISTS building_demands_insert ON public.building_demands;
DROP POLICY IF EXISTS building_demands_update ON public.building_demands;

-- Everyone can read demands
CREATE POLICY building_demands_select_all ON public.building_demands
  FOR SELECT USING (true);

-- Verified users can create demands
CREATE POLICY building_demands_insert_verified ON public.building_demands
  FOR INSERT WITH CHECK (true); -- Trust level check in application

-- Organizer+ can update demands
CREATE POLICY building_demands_update_organizer ON public.building_demands
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- LINKED_PROPERTY_GROUPS TABLE: Creator or member can read, organizer+ for mods
-- ============================================================================

DROP POLICY IF EXISTS linked_property_groups_select ON public.linked_property_groups;
DROP POLICY IF EXISTS linked_property_groups_insert ON public.linked_property_groups;
DROP POLICY IF EXISTS linked_property_groups_update ON public.linked_property_groups;

-- Everyone can read groups
CREATE POLICY linked_property_groups_select_all ON public.linked_property_groups
  FOR SELECT USING (true);

-- Verified users can create groups
CREATE POLICY linked_property_groups_insert_verified ON public.linked_property_groups
  FOR INSERT WITH CHECK (true); -- Trust level check in application

-- Organizer+ can update groups
CREATE POLICY linked_property_groups_update_organizer ON public.linked_property_groups
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- GOVERNANCE_PROPOSALS TABLE: Similar to linked_property_groups
-- ============================================================================

DROP POLICY IF EXISTS governance_proposals_select ON public.governance_proposals;
DROP POLICY IF EXISTS governance_proposals_insert ON public.governance_proposals;
DROP POLICY IF EXISTS governance_proposals_update ON public.governance_proposals;

-- Everyone can read proposals
CREATE POLICY governance_proposals_select_all ON public.governance_proposals
  FOR SELECT USING (true);

-- Verified users can create proposals (trust check in application)
CREATE POLICY governance_proposals_insert_verified ON public.governance_proposals
  FOR INSERT WITH CHECK (true);

-- Organizer+ can update proposals (for status changes)
CREATE POLICY governance_proposals_update_organizer ON public.governance_proposals
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- ============================================================================
-- DONE
-- ============================================================================

-- Summary of policies created:
-- - profiles: Read all, insert own, update own (except role/trust), admin can update any
-- - proposal_votes: Read all, insert/update own voter_id only, no deletes
-- - event_votes: Same as proposal_votes
-- - ban_records: Read all, admin only for modifications
-- - mute_records: Read all, organizer+ for modifications
-- - invite_codes: Read all, organizer+ create, owner/organizer+ update
-- - events: Read all, own insert, owner/organizer+ update, owner/admin delete
-- - event_rsvps: Read all, own only for modifications
-- - mutual_aid_posts: Read all, own insert, owner/organizer+ modify
-- - mutual_aid_resources: Read all, own insert, owner/organizer+ modify
-- - skill_profiles: Read all, own only for modifications
-- - campaigns: Read all, organizer+ create, owner/organizer+ update
-- - canvass_units: Organizer+ only (contains contact info)
-- - document_admin_state: Read all, admin only for modifications
-- - document_edits: Read all, admin only for modifications
-- - building_complaints: Read all, own insert, owner/organizer+ update
-- - building_demands: Read all, verified insert, organizer+ update
-- - linked_property_groups: Read all, verified insert, organizer+ update
-- - governance_proposals: Read all, verified insert, organizer+ update
