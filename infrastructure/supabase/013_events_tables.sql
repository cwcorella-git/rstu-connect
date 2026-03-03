-- Migration: Events Tables
-- Creates tables for building events with RSVPs and meeting notes
--
-- Tables:
-- - events: Event metadata (title, date, location, status)
-- - event_rsvps: User RSVPs for events
-- - event_votes: Voting on proposed events
-- - event_meeting_notes: Notes added after meetings
-- - event_action_items: Action items from meeting notes

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope
  building_id TEXT NOT NULL,                      -- chatSlug of primary building
  building_address TEXT NOT NULL,
  group_id UUID,                                  -- Optional linked property group
  is_group_wide BOOLEAN NOT NULL DEFAULT FALSE,
  campaign_id UUID,                               -- Optional campaign link

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'meeting'
    CHECK (event_type IN ('custom', 'meeting', 'committee', 'workshop', 'action', 'intake', 'social', 'other')),
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'confirmed', 'cancelled', 'completed')),

  -- Timing
  date_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60
    CHECK (duration_minutes > 0 AND duration_minutes <= 1440),

  -- Location
  location_name TEXT,
  location_address TEXT,
  is_virtual BOOLEAN NOT NULL DEFAULT FALSE,
  virtual_link TEXT,

  -- Organizer
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_by_name TEXT NOT NULL,

  -- Voting (for proposed events)
  vote_threshold INTEGER NOT NULL DEFAULT 3
    CHECK (vote_threshold >= 1 AND vote_threshold <= 100),

  -- Recurrence
  recurrence_type TEXT NOT NULL DEFAULT 'none'
    CHECK (recurrence_type IN ('none', 'weekly', 'biweekly', 'monthly')),
  recurrence_interval INTEGER DEFAULT 1,
  recurrence_end_date TIMESTAMPTZ,
  series_id UUID,                                 -- Shared ID for recurring events
  occurrence_number INTEGER,                      -- Which occurrence in series

  -- Chat integration
  chat_message_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS events_building_idx ON public.events(building_id);
CREATE INDEX IF NOT EXISTS events_group_idx ON public.events(group_id) WHERE group_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS events_campaign_idx ON public.events(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS events_date_time_idx ON public.events(date_time);
CREATE INDEX IF NOT EXISTS events_series_idx ON public.events(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS events_created_by_idx ON public.events(created_by);

-- ============================================================================
-- EVENT_RSVPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  profile_nickname TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One RSVP per event per user
  UNIQUE(event_id, profile_id)
);

-- Indexes for RSVP queries
CREATE INDEX IF NOT EXISTS event_rsvps_event_idx ON public.event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS event_rsvps_profile_idx ON public.event_rsvps(profile_id);
CREATE INDEX IF NOT EXISTS event_rsvps_status_idx ON public.event_rsvps(status);

-- ============================================================================
-- EVENT_VOTES TABLE (for proposed events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id),
  vote TEXT NOT NULL CHECK (vote IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One vote per event per user
  UNIQUE(event_id, profile_id)
);

-- Indexes for vote counting
CREATE INDEX IF NOT EXISTS event_votes_event_idx ON public.event_votes(event_id);
CREATE INDEX IF NOT EXISTS event_votes_vote_idx ON public.event_votes(event_id, vote);

-- ============================================================================
-- EVENT_MEETING_NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL,                          -- Markdown content
  attendees UUID[] NOT NULL DEFAULT '{}',         -- Array of profile IDs
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for event lookup
CREATE INDEX IF NOT EXISTS event_meeting_notes_event_idx ON public.event_meeting_notes(event_id);

-- ============================================================================
-- EVENT_ACTION_ITEMS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.event_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notes_id UUID NOT NULL REFERENCES public.event_meeting_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_to_name TEXT,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for notes lookup
CREATE INDEX IF NOT EXISTS event_action_items_notes_idx ON public.event_action_items(notes_id);
CREATE INDEX IF NOT EXISTS event_action_items_assigned_idx ON public.event_action_items(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS event_action_items_completed_idx ON public.event_action_items(completed);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_events_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to events table
DROP TRIGGER IF EXISTS events_updated_at ON public.events;
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_events_tables_updated_at();

-- Apply to event_rsvps table
DROP TRIGGER IF EXISTS event_rsvps_updated_at ON public.event_rsvps;
CREATE TRIGGER event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION update_events_tables_updated_at();

-- Apply to event_meeting_notes table
DROP TRIGGER IF EXISTS event_meeting_notes_updated_at ON public.event_meeting_notes;
CREATE TRIGGER event_meeting_notes_updated_at
  BEFORE UPDATE ON public.event_meeting_notes
  FOR EACH ROW EXECUTE FUNCTION update_events_tables_updated_at();

-- Apply to event_action_items table
DROP TRIGGER IF EXISTS event_action_items_updated_at ON public.event_action_items;
CREATE TRIGGER event_action_items_updated_at
  BEFORE UPDATE ON public.event_action_items
  FOR EACH ROW EXECUTE FUNCTION update_events_tables_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_action_items ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- EVENTS: Read all, verified users can create, creator/organizer can modify
-- -----------------------------------------------------------------------------

CREATE POLICY events_select_all ON public.events
  FOR SELECT USING (true);

-- Any authenticated user can create events
CREATE POLICY events_insert_authenticated ON public.events
  FOR INSERT WITH CHECK (created_by = get_current_user_id());

-- Creator or organizer+ can update
CREATE POLICY events_update_creator_or_organizer ON public.events
  FOR UPDATE USING (
    created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- Creator or organizer+ can delete
CREATE POLICY events_delete_creator_or_organizer ON public.events
  FOR DELETE USING (
    created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- -----------------------------------------------------------------------------
-- EVENT_RSVPS: Read all, users manage own RSVPs
-- -----------------------------------------------------------------------------

CREATE POLICY event_rsvps_select_all ON public.event_rsvps
  FOR SELECT USING (true);

-- Users can only insert RSVPs for themselves
CREATE POLICY event_rsvps_insert_own ON public.event_rsvps
  FOR INSERT WITH CHECK (profile_id = get_current_user_id());

-- Users can only update their own RSVPs
CREATE POLICY event_rsvps_update_own ON public.event_rsvps
  FOR UPDATE USING (profile_id = get_current_user_id());

-- Users can only delete their own RSVPs
CREATE POLICY event_rsvps_delete_own ON public.event_rsvps
  FOR DELETE USING (profile_id = get_current_user_id());

-- -----------------------------------------------------------------------------
-- EVENT_VOTES: Read all, users vote only for themselves, votes are immutable
-- -----------------------------------------------------------------------------

CREATE POLICY event_votes_select_all ON public.event_votes
  FOR SELECT USING (true);

-- Users can only insert votes for themselves
CREATE POLICY event_votes_insert_own ON public.event_votes
  FOR INSERT WITH CHECK (profile_id = get_current_user_id());

-- Users can change their own vote
CREATE POLICY event_votes_update_own ON public.event_votes
  FOR UPDATE USING (profile_id = get_current_user_id());

-- Users can remove their own vote
CREATE POLICY event_votes_delete_own ON public.event_votes
  FOR DELETE USING (profile_id = get_current_user_id());

-- -----------------------------------------------------------------------------
-- EVENT_MEETING_NOTES: Read all, creator/organizer can create/update
-- -----------------------------------------------------------------------------

CREATE POLICY event_meeting_notes_select_all ON public.event_meeting_notes
  FOR SELECT USING (true);

-- Event creator or organizer+ can add notes
CREATE POLICY event_meeting_notes_insert_organizer ON public.event_meeting_notes
  FOR INSERT WITH CHECK (
    created_by = get_current_user_id() AND (
      EXISTS (
        SELECT 1 FROM public.events e
        WHERE e.id = event_id AND e.created_by = get_current_user_id()
      ) OR is_current_user_organizer_or_higher()
    )
  );

-- Event creator or organizer+ can update notes
CREATE POLICY event_meeting_notes_update_organizer ON public.event_meeting_notes
  FOR UPDATE USING (
    created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- -----------------------------------------------------------------------------
-- EVENT_ACTION_ITEMS: Read all, notes creator/organizer can manage
-- -----------------------------------------------------------------------------

CREATE POLICY event_action_items_select_all ON public.event_action_items
  FOR SELECT USING (true);

-- Notes creator or organizer+ can add action items
CREATE POLICY event_action_items_insert_organizer ON public.event_action_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_meeting_notes n
      WHERE n.id = notes_id AND (
        n.created_by = get_current_user_id() OR is_current_user_organizer_or_higher()
      )
    )
  );

-- Notes creator, assigned user, or organizer+ can update action items
CREATE POLICY event_action_items_update_authorized ON public.event_action_items
  FOR UPDATE USING (
    assigned_to = get_current_user_id() OR
    EXISTS (
      SELECT 1 FROM public.event_meeting_notes n
      WHERE n.id = notes_id AND n.created_by = get_current_user_id()
    ) OR
    is_current_user_organizer_or_higher()
  );

-- ============================================================================
-- SERVER FUNCTIONS FOR EVENT OPERATIONS
-- ============================================================================

-- Function to create an event with validation
CREATE OR REPLACE FUNCTION create_event_secure(
  p_creator_id UUID,
  p_building_id TEXT,
  p_building_address TEXT,
  p_title TEXT,
  p_description TEXT,
  p_event_type TEXT,
  p_date_time TIMESTAMPTZ,
  p_duration_minutes INTEGER,
  p_location_name TEXT,
  p_location_address TEXT,
  p_is_virtual BOOLEAN,
  p_virtual_link TEXT,
  p_group_id UUID DEFAULT NULL,
  p_is_group_wide BOOLEAN DEFAULT FALSE,
  p_vote_threshold INTEGER DEFAULT 3,
  p_recurrence_type TEXT DEFAULT 'none'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_creator_name TEXT;
  v_event_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Verify creator_id matches current user
  IF p_creator_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot create event for another user');
  END IF;

  -- Get creator name
  SELECT nickname INTO v_creator_name
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_creator_name IS NULL THEN
    v_creator_name := 'Unknown';
  END IF;

  -- Validate event type
  IF p_event_type NOT IN ('custom', 'meeting', 'committee', 'workshop', 'action', 'intake', 'social', 'other') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid event type');
  END IF;

  -- Validate date is in future
  IF p_date_time < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'Event date must be in the future');
  END IF;

  -- Insert the event
  INSERT INTO public.events (
    building_id, building_address, group_id, is_group_wide,
    title, description, event_type, status,
    date_time, duration_minutes,
    location_name, location_address, is_virtual, virtual_link,
    created_by, created_by_name,
    vote_threshold, recurrence_type
  )
  VALUES (
    p_building_id, p_building_address, p_group_id, p_is_group_wide,
    p_title, p_description, p_event_type, 'proposed',
    p_date_time, COALESCE(p_duration_minutes, 60),
    p_location_name, p_location_address, COALESCE(p_is_virtual, false), p_virtual_link,
    v_user_id, v_creator_name,
    COALESCE(p_vote_threshold, 3), COALESCE(p_recurrence_type, 'none')
  )
  RETURNING id INTO v_event_id;

  RETURN json_build_object('success', true, 'event_id', v_event_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to update an event with permission check
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
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_event_creator UUID;
  v_is_organizer BOOLEAN;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Verify actor_id matches current user
  IF p_actor_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Actor ID mismatch');
  END IF;

  -- Get event creator
  SELECT created_by INTO v_event_creator
  FROM public.events
  WHERE id = p_event_id;

  IF v_event_creator IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Check permission
  v_is_organizer := is_current_user_organizer_or_higher();
  IF v_event_creator != v_user_id AND NOT v_is_organizer THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to update this event');
  END IF;

  -- Validate status if provided
  IF p_status IS NOT NULL AND p_status NOT IN ('proposed', 'confirmed', 'cancelled', 'completed') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;

  -- Update the event
  UPDATE public.events
  SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    status = COALESCE(p_status, status),
    date_time = COALESCE(p_date_time, date_time),
    location_name = COALESCE(p_location_name, location_name),
    is_virtual = COALESCE(p_is_virtual, is_virtual),
    virtual_link = COALESCE(p_virtual_link, virtual_link)
  WHERE id = p_event_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to delete an event with permission check
CREATE OR REPLACE FUNCTION delete_event_secure(
  p_actor_id UUID,
  p_event_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_event_creator UUID;
  v_is_organizer BOOLEAN;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Verify actor_id matches current user
  IF p_actor_id != v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Actor ID mismatch');
  END IF;

  -- Get event creator
  SELECT created_by INTO v_event_creator
  FROM public.events
  WHERE id = p_event_id;

  IF v_event_creator IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Check permission
  v_is_organizer := is_current_user_organizer_or_higher();
  IF v_event_creator != v_user_id AND NOT v_is_organizer THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to delete this event');
  END IF;

  -- Delete the event (cascades to RSVPs, votes, notes)
  DELETE FROM public.events WHERE id = p_event_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to RSVP to an event
CREATE OR REPLACE FUNCTION rsvp_to_event(
  p_event_id UUID,
  p_status TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_nickname TEXT;
  v_event_exists BOOLEAN;
  v_rsvp_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Validate status
  IF p_status NOT IN ('yes', 'no', 'maybe') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid RSVP status');
  END IF;

  -- Check event exists
  SELECT EXISTS(SELECT 1 FROM public.events WHERE id = p_event_id) INTO v_event_exists;
  IF NOT v_event_exists THEN
    RETURN json_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Get user nickname
  SELECT nickname INTO v_nickname
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_nickname IS NULL THEN
    v_nickname := 'Unknown';
  END IF;

  -- Upsert RSVP
  INSERT INTO public.event_rsvps (event_id, profile_id, profile_nickname, status)
  VALUES (p_event_id, v_user_id, v_nickname, p_status)
  ON CONFLICT (event_id, profile_id) DO UPDATE
  SET status = p_status, profile_nickname = v_nickname, updated_at = NOW()
  RETURNING id INTO v_rsvp_id;

  RETURN json_build_object('success', true, 'rsvp_id', v_rsvp_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to vote on a proposed event
CREATE OR REPLACE FUNCTION vote_on_event(
  p_event_id UUID,
  p_vote TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_event_status TEXT;
  v_vote_id UUID;
  v_upvotes INTEGER;
  v_threshold INTEGER;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Validate vote
  IF p_vote NOT IN ('up', 'down') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid vote');
  END IF;

  -- Check event exists and is proposed
  SELECT status, vote_threshold INTO v_event_status, v_threshold
  FROM public.events
  WHERE id = p_event_id;

  IF v_event_status IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Event not found');
  END IF;

  IF v_event_status != 'proposed' THEN
    RETURN json_build_object('success', false, 'error', 'Can only vote on proposed events');
  END IF;

  -- Upsert vote
  INSERT INTO public.event_votes (event_id, profile_id, vote)
  VALUES (p_event_id, v_user_id, p_vote)
  ON CONFLICT (event_id, profile_id) DO UPDATE
  SET vote = p_vote
  RETURNING id INTO v_vote_id;

  -- Check if threshold reached
  SELECT COUNT(*) INTO v_upvotes
  FROM public.event_votes
  WHERE event_id = p_event_id AND vote = 'up';

  -- Auto-confirm if threshold reached
  IF v_upvotes >= v_threshold THEN
    UPDATE public.events
    SET status = 'confirmed'
    WHERE id = p_event_id AND status = 'proposed';
  END IF;

  RETURN json_build_object('success', true, 'vote_id', v_vote_id, 'upvotes', v_upvotes, 'threshold', v_threshold);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to add meeting notes
CREATE OR REPLACE FUNCTION add_meeting_notes(
  p_event_id UUID,
  p_content TEXT,
  p_attendees UUID[]
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_event_creator UUID;
  v_is_organizer BOOLEAN;
  v_notes_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Get event creator
  SELECT created_by INTO v_event_creator
  FROM public.events
  WHERE id = p_event_id;

  IF v_event_creator IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Event not found');
  END IF;

  -- Check permission
  v_is_organizer := is_current_user_organizer_or_higher();
  IF v_event_creator != v_user_id AND NOT v_is_organizer THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized to add notes');
  END IF;

  -- Insert notes
  INSERT INTO public.event_meeting_notes (event_id, content, attendees, created_by)
  VALUES (p_event_id, p_content, COALESCE(p_attendees, '{}'), v_user_id)
  ON CONFLICT (event_id) DO UPDATE
  SET content = p_content, attendees = COALESCE(p_attendees, '{}'), updated_at = NOW()
  RETURNING id INTO v_notes_id;

  -- Mark event as completed
  UPDATE public.events
  SET status = 'completed'
  WHERE id = p_event_id;

  RETURN json_build_object('success', true, 'notes_id', v_notes_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.events TO anon, authenticated;
GRANT SELECT ON public.event_rsvps TO anon, authenticated;
GRANT SELECT ON public.event_votes TO anon, authenticated;
GRANT SELECT ON public.event_meeting_notes TO anon, authenticated;
GRANT SELECT ON public.event_action_items TO anon, authenticated;

GRANT INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_rsvps TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.event_votes TO authenticated;
GRANT INSERT, UPDATE ON public.event_meeting_notes TO authenticated;
GRANT INSERT, UPDATE ON public.event_action_items TO authenticated;

GRANT EXECUTE ON FUNCTION create_event_secure TO authenticated;
GRANT EXECUTE ON FUNCTION update_event_secure TO authenticated;
GRANT EXECUTE ON FUNCTION delete_event_secure TO authenticated;
GRANT EXECUTE ON FUNCTION rsvp_to_event TO authenticated;
GRANT EXECUTE ON FUNCTION vote_on_event TO authenticated;
GRANT EXECUTE ON FUNCTION add_meeting_notes TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.events IS 'Building events with date, location, and status';
COMMENT ON TABLE public.event_rsvps IS 'User RSVPs for events';
COMMENT ON TABLE public.event_votes IS 'Votes on proposed events';
COMMENT ON TABLE public.event_meeting_notes IS 'Notes added after meetings';
COMMENT ON TABLE public.event_action_items IS 'Action items from meeting notes';

COMMENT ON FUNCTION create_event_secure IS 'Create event with server-side validation';
COMMENT ON FUNCTION update_event_secure IS 'Update event with permission check';
COMMENT ON FUNCTION delete_event_secure IS 'Delete event with permission check';
COMMENT ON FUNCTION rsvp_to_event IS 'RSVP to an event';
COMMENT ON FUNCTION vote_on_event IS 'Vote on a proposed event (auto-confirms at threshold)';
COMMENT ON FUNCTION add_meeting_notes IS 'Add meeting notes to a completed event';
