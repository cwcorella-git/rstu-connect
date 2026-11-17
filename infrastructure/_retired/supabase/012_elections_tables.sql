-- Migration: Elections Tables
-- Creates tables for officer elections with ranked choice voting
--
-- Tables:
-- - elections: Election metadata (title, dates, status)
-- - election_positions: Positions within an election (President, VP, etc.)
-- - nominations: Candidate nominations
-- - election_votes: Legacy simple votes
-- - ranked_votes: Ranked choice voting ballots

-- ============================================================================
-- ELECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                           -- e.g., "2026 Officer Elections"
  nomination_start TIMESTAMPTZ NOT NULL,
  nomination_end TIMESTAMPTZ NOT NULL,
  voting_start TIMESTAMPTZ NOT NULL,
  voting_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'           -- draft, nominations, voting, closed
    CHECK (status IN ('draft', 'nominations', 'voting', 'closed')),
  quorum_percent INTEGER NOT NULL DEFAULT 15     -- Required participation %
    CHECK (quorum_percent >= 0 AND quorum_percent <= 100),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding active elections
CREATE INDEX IF NOT EXISTS elections_status_idx ON public.elections(status);
CREATE INDEX IF NOT EXISTS elections_voting_end_idx ON public.elections(voting_end);

-- ============================================================================
-- ELECTION_POSITIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.election_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                           -- "President", "Vice President", etc.
  description TEXT,
  term_length INTEGER NOT NULL DEFAULT 12,       -- months
  max_terms INTEGER NOT NULL DEFAULT 2,          -- 0 = unlimited
  sort_order INTEGER NOT NULL DEFAULT 0,         -- Display order
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for election lookups
CREATE INDEX IF NOT EXISTS election_positions_election_idx ON public.election_positions(election_id);

-- ============================================================================
-- NOMINATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.nominations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.election_positions(id) ON DELETE CASCADE,
  nominee_id UUID NOT NULL REFERENCES public.profiles(id),
  nominee_name TEXT NOT NULL,                    -- Denormalized for display
  nominator_id UUID NOT NULL REFERENCES public.profiles(id),
  nominator_name TEXT NOT NULL,                  -- Denormalized for display
  statement TEXT,                                -- Candidate statement
  accepted BOOLEAN,                              -- NULL = pending, TRUE/FALSE = responded
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate nominations for same person/position
  UNIQUE(election_id, position_id, nominee_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS nominations_election_idx ON public.nominations(election_id);
CREATE INDEX IF NOT EXISTS nominations_position_idx ON public.nominations(position_id);
CREATE INDEX IF NOT EXISTS nominations_nominee_idx ON public.nominations(nominee_id);
CREATE INDEX IF NOT EXISTS nominations_accepted_idx ON public.nominations(accepted) WHERE accepted = TRUE;

-- ============================================================================
-- ELECTION_VOTES TABLE (Legacy simple voting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.election_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.election_positions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id),
  candidate_id UUID NOT NULL REFERENCES public.nominations(id),  -- The nomination they voted for
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One vote per position per voter
  UNIQUE(election_id, position_id, voter_id)
);

-- Indexes for vote counting
CREATE INDEX IF NOT EXISTS election_votes_election_idx ON public.election_votes(election_id);
CREATE INDEX IF NOT EXISTS election_votes_position_idx ON public.election_votes(position_id);
CREATE INDEX IF NOT EXISTS election_votes_candidate_idx ON public.election_votes(candidate_id);

-- ============================================================================
-- RANKED_VOTES TABLE (Ranked Choice Voting)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ranked_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.election_positions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id),
  rankings UUID[] NOT NULL,                      -- Array of nomination IDs in preference order
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One ranked vote per position per voter
  UNIQUE(election_id, position_id, voter_id)
);

-- Indexes for vote counting
CREATE INDEX IF NOT EXISTS ranked_votes_election_idx ON public.ranked_votes(election_id);
CREATE INDEX IF NOT EXISTS ranked_votes_position_idx ON public.ranked_votes(position_id);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_elections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to elections table
DROP TRIGGER IF EXISTS elections_updated_at ON public.elections;
CREATE TRIGGER elections_updated_at
  BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION update_elections_updated_at();

-- Apply to nominations table
DROP TRIGGER IF EXISTS nominations_updated_at ON public.nominations;
CREATE TRIGGER nominations_updated_at
  BEFORE UPDATE ON public.nominations
  FOR EACH ROW EXECUTE FUNCTION update_elections_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranked_votes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- ELECTIONS: Read all, admin/organizer+ create/update
-- -----------------------------------------------------------------------------

CREATE POLICY elections_select_all ON public.elections
  FOR SELECT USING (true);

CREATE POLICY elections_insert_organizer ON public.elections
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY elections_update_organizer ON public.elections
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- No delete - elections are permanent records

-- -----------------------------------------------------------------------------
-- ELECTION_POSITIONS: Read all, admin/organizer+ create/update
-- -----------------------------------------------------------------------------

CREATE POLICY election_positions_select_all ON public.election_positions
  FOR SELECT USING (true);

CREATE POLICY election_positions_insert_organizer ON public.election_positions
  FOR INSERT WITH CHECK (is_current_user_organizer_or_higher());

CREATE POLICY election_positions_update_organizer ON public.election_positions
  FOR UPDATE USING (is_current_user_organizer_or_higher());

-- -----------------------------------------------------------------------------
-- NOMINATIONS: Read all, users create own nominations, nominee can accept/decline
-- -----------------------------------------------------------------------------

CREATE POLICY nominations_select_all ON public.nominations
  FOR SELECT USING (true);

-- Users can nominate (including self-nomination)
CREATE POLICY nominations_insert_own ON public.nominations
  FOR INSERT WITH CHECK (nominator_id = get_current_user_id());

-- Nominee can update their own nomination (to accept/decline)
-- Organizer+ can also update (for moderation)
CREATE POLICY nominations_update_nominee_or_organizer ON public.nominations
  FOR UPDATE USING (
    nominee_id = get_current_user_id() OR is_current_user_organizer_or_higher()
  );

-- -----------------------------------------------------------------------------
-- ELECTION_VOTES: Read all (transparency), users vote only for themselves
-- -----------------------------------------------------------------------------

CREATE POLICY election_votes_select_all ON public.election_votes
  FOR SELECT USING (true);

-- Can only insert votes with your own voter_id
CREATE POLICY election_votes_insert_own ON public.election_votes
  FOR INSERT WITH CHECK (voter_id = get_current_user_id());

-- No updates to votes (immutable once cast)
CREATE POLICY election_votes_no_update ON public.election_votes
  FOR UPDATE USING (false);

-- No deletes (votes are permanent)
CREATE POLICY election_votes_no_delete ON public.election_votes
  FOR DELETE USING (false);

-- -----------------------------------------------------------------------------
-- RANKED_VOTES: Read all (transparency), users vote only for themselves
-- -----------------------------------------------------------------------------

CREATE POLICY ranked_votes_select_all ON public.ranked_votes
  FOR SELECT USING (true);

-- Can only insert ranked votes with your own voter_id
CREATE POLICY ranked_votes_insert_own ON public.ranked_votes
  FOR INSERT WITH CHECK (voter_id = get_current_user_id());

-- No updates to ranked votes (immutable once cast)
CREATE POLICY ranked_votes_no_update ON public.ranked_votes
  FOR UPDATE USING (false);

-- No deletes (votes are permanent)
CREATE POLICY ranked_votes_no_delete ON public.ranked_votes
  FOR DELETE USING (false);

-- ============================================================================
-- SERVER FUNCTIONS FOR VOTE INTEGRITY
-- ============================================================================

-- Function to cast a ranked vote with validation
CREATE OR REPLACE FUNCTION cast_ranked_vote(
  p_election_id UUID,
  p_position_id UUID,
  p_rankings UUID[]
)
RETURNS UUID AS $$
DECLARE
  v_voter_id UUID;
  v_election_status TEXT;
  v_vote_id UUID;
  v_now TIMESTAMPTZ;
BEGIN
  v_voter_id := get_current_user_id();
  v_now := NOW();

  IF v_voter_id IS NULL THEN
    RAISE EXCEPTION 'User context not set';
  END IF;

  -- Check election is in voting phase
  SELECT status INTO v_election_status
  FROM public.elections
  WHERE id = p_election_id
    AND voting_start <= v_now
    AND voting_end > v_now;

  IF v_election_status IS NULL OR v_election_status != 'voting' THEN
    RAISE EXCEPTION 'Election is not in voting phase';
  END IF;

  -- Check user hasn't already voted for this position
  IF EXISTS (
    SELECT 1 FROM public.ranked_votes
    WHERE election_id = p_election_id
      AND position_id = p_position_id
      AND voter_id = v_voter_id
  ) THEN
    RAISE EXCEPTION 'Already voted for this position';
  END IF;

  -- Validate rankings reference valid accepted nominations
  IF NOT (
    SELECT bool_and(n.id IS NOT NULL AND n.accepted = TRUE)
    FROM unnest(p_rankings) AS r(nomination_id)
    LEFT JOIN public.nominations n ON n.id = r.nomination_id
      AND n.election_id = p_election_id
      AND n.position_id = p_position_id
  ) THEN
    RAISE EXCEPTION 'Invalid candidate in rankings';
  END IF;

  -- Insert the vote
  INSERT INTO public.ranked_votes (election_id, position_id, voter_id, rankings)
  VALUES (p_election_id, p_position_id, v_voter_id, p_rankings)
  RETURNING id INTO v_vote_id;

  RETURN v_vote_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to create a nomination
CREATE OR REPLACE FUNCTION create_nomination(
  p_election_id UUID,
  p_position_id UUID,
  p_nominee_id UUID,
  p_nominee_name TEXT,
  p_statement TEXT,
  p_self_nomination BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_nominator_id UUID;
  v_nominator_name TEXT;
  v_election_status TEXT;
  v_nomination_id UUID;
  v_now TIMESTAMPTZ;
BEGIN
  v_nominator_id := get_current_user_id();
  v_now := NOW();

  IF v_nominator_id IS NULL THEN
    RAISE EXCEPTION 'User context not set';
  END IF;

  -- Get nominator name
  SELECT name INTO v_nominator_name
  FROM public.profiles
  WHERE id = v_nominator_id;

  -- Check election is in nominations phase
  SELECT status INTO v_election_status
  FROM public.elections
  WHERE id = p_election_id
    AND nomination_start <= v_now
    AND nomination_end > v_now;

  IF v_election_status IS NULL OR v_election_status != 'nominations' THEN
    RAISE EXCEPTION 'Election is not in nomination phase';
  END IF;

  -- Check nominee not already nominated for this position
  IF EXISTS (
    SELECT 1 FROM public.nominations
    WHERE election_id = p_election_id
      AND position_id = p_position_id
      AND nominee_id = p_nominee_id
  ) THEN
    RAISE EXCEPTION 'Already nominated for this position';
  END IF;

  -- Insert the nomination
  INSERT INTO public.nominations (
    election_id, position_id, nominee_id, nominee_name,
    nominator_id, nominator_name, statement, accepted
  )
  VALUES (
    p_election_id, p_position_id, p_nominee_id, p_nominee_name,
    v_nominator_id, v_nominator_name, p_statement,
    CASE WHEN p_self_nomination THEN TRUE ELSE NULL END
  )
  RETURNING id INTO v_nomination_id;

  RETURN v_nomination_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Function to respond to a nomination
CREATE OR REPLACE FUNCTION respond_to_nomination(
  p_nomination_id UUID,
  p_accepted BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_nominee_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User context not set';
  END IF;

  -- Verify user is the nominee
  SELECT nominee_id INTO v_nominee_id
  FROM public.nominations
  WHERE id = p_nomination_id;

  IF v_nominee_id IS NULL THEN
    RAISE EXCEPTION 'Nomination not found';
  END IF;

  IF v_nominee_id != v_user_id THEN
    RAISE EXCEPTION 'Only the nominee can respond to their nomination';
  END IF;

  -- Update the nomination
  UPDATE public.nominations
  SET accepted = p_accepted, updated_at = NOW()
  WHERE id = p_nomination_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.elections TO anon, authenticated;
GRANT SELECT ON public.election_positions TO anon, authenticated;
GRANT SELECT ON public.nominations TO anon, authenticated;
GRANT SELECT ON public.election_votes TO anon, authenticated;
GRANT SELECT ON public.ranked_votes TO anon, authenticated;

GRANT INSERT, UPDATE ON public.elections TO authenticated;
GRANT INSERT, UPDATE ON public.election_positions TO authenticated;
GRANT INSERT, UPDATE ON public.nominations TO authenticated;
GRANT INSERT ON public.election_votes TO authenticated;
GRANT INSERT ON public.ranked_votes TO authenticated;

GRANT EXECUTE ON FUNCTION cast_ranked_vote TO authenticated;
GRANT EXECUTE ON FUNCTION create_nomination TO authenticated;
GRANT EXECUTE ON FUNCTION respond_to_nomination TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.elections IS 'Officer elections with dates and status';
COMMENT ON TABLE public.election_positions IS 'Positions within an election (President, VP, etc.)';
COMMENT ON TABLE public.nominations IS 'Candidate nominations for election positions';
COMMENT ON TABLE public.election_votes IS 'Legacy simple votes (one candidate per position)';
COMMENT ON TABLE public.ranked_votes IS 'Ranked choice voting ballots';

COMMENT ON FUNCTION cast_ranked_vote IS 'Server-validated ranked choice vote submission';
COMMENT ON FUNCTION create_nomination IS 'Server-validated nomination creation';
COMMENT ON FUNCTION respond_to_nomination IS 'Accept or decline a nomination';
