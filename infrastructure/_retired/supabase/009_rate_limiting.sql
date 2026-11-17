-- Migration: Rate Limiting
-- Adds server-side rate limiting to prevent spam and abuse

-- ============================================================================
-- RATE LIMIT TRACKING TABLE
-- ============================================================================

-- Track actions per user for rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_key TEXT, -- Optional: specific target (e.g., proposal_id)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_profile_action
  ON rate_limit_log(profile_id, action_type, created_at DESC);

-- Auto-cleanup old records (keep 1 hour of history)
CREATE INDEX IF NOT EXISTS idx_rate_limit_cleanup
  ON rate_limit_log(created_at);

-- ============================================================================
-- RATE LIMIT CONFIGURATION
-- ============================================================================

-- Rate limits by action type (requests per window)
CREATE TABLE IF NOT EXISTS rate_limit_config (
  action_type TEXT PRIMARY KEY,
  max_requests INTEGER NOT NULL,
  window_seconds INTEGER NOT NULL,
  description TEXT
);

-- Insert default rate limits
INSERT INTO rate_limit_config (action_type, max_requests, window_seconds, description)
VALUES
  ('vote', 10, 60, 'Max 10 votes per minute'),
  ('proposal_create', 3, 300, 'Max 3 proposals per 5 minutes'),
  ('event_create', 5, 300, 'Max 5 events per 5 minutes'),
  ('message_send', 30, 60, 'Max 30 messages per minute'),
  ('mutual_aid_post', 5, 300, 'Max 5 mutual aid posts per 5 minutes'),
  ('ban_action', 10, 60, 'Max 10 ban actions per minute'),
  ('profile_update', 10, 60, 'Max 10 profile updates per minute')
ON CONFLICT (action_type) DO NOTHING;

-- ============================================================================
-- RATE LIMIT CHECK FUNCTION
-- ============================================================================

-- Check if action is rate limited and log the attempt
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_profile_id UUID,
  p_action_type TEXT,
  p_action_key TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  config_record RECORD;
  recent_count INTEGER;
  window_start TIMESTAMPTZ;
BEGIN
  -- Get rate limit config for this action
  SELECT max_requests, window_seconds INTO config_record
  FROM rate_limit_config
  WHERE action_type = p_action_type;

  -- If no config found, allow the action (fail open for unconfigured actions)
  IF config_record IS NULL THEN
    RETURN jsonb_build_object('allowed', true, 'remaining', -1);
  END IF;

  -- Calculate window start time
  window_start := NOW() - (config_record.window_seconds || ' seconds')::INTERVAL;

  -- Count recent actions in window
  SELECT COUNT(*) INTO recent_count
  FROM rate_limit_log
  WHERE profile_id = p_profile_id
    AND action_type = p_action_type
    AND created_at > window_start;

  -- Check if rate limited
  IF recent_count >= config_record.max_requests THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'error', format('Rate limited: max %s %s per %s seconds',
                      config_record.max_requests,
                      p_action_type,
                      config_record.window_seconds),
      'remaining', 0,
      'retry_after', config_record.window_seconds
    );
  END IF;

  -- Log this action attempt
  INSERT INTO rate_limit_log (profile_id, action_type, action_key)
  VALUES (p_profile_id, p_action_type, p_action_key);

  RETURN jsonb_build_object(
    'allowed', true,
    'remaining', config_record.max_requests - recent_count - 1
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CLEANUP FUNCTION (run periodically via cron or pg_cron)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void AS $$
BEGIN
  -- Delete records older than 1 hour
  DELETE FROM rate_limit_log
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE CAST_VOTE WITH RATE LIMITING
-- ============================================================================

CREATE OR REPLACE FUNCTION cast_vote(
  p_target_type TEXT,  -- 'proposal' or 'event'
  p_target_id UUID,
  p_voter_id UUID,
  p_vote TEXT
) RETURNS JSONB AS $$
DECLARE
  voter_record RECORD;
  rate_limit_result JSONB;
BEGIN
  -- Check rate limit first
  rate_limit_result := check_rate_limit(p_voter_id, 'vote', p_target_id::TEXT);
  IF NOT (rate_limit_result->>'allowed')::BOOLEAN THEN
    RETURN rate_limit_result;
  END IF;

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

  RETURN jsonb_build_object(
    'success', true,
    'remaining_votes', (rate_limit_result->>'remaining')::INTEGER
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE BAN_USER WITH RATE LIMITING
-- ============================================================================

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
  rate_limit_result JSONB;
BEGIN
  -- Check rate limit first
  rate_limit_result := check_rate_limit(p_actor_id, 'ban_action', p_target_id::TEXT);
  IF NOT (rate_limit_result->>'allowed')::BOOLEAN THEN
    RETURN rate_limit_result;
  END IF;

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

-- ============================================================================
-- NEW: RATE-LIMITED CREATE PROPOSAL FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_proposal_rate_limited(
  p_creator_id UUID,
  p_proposal_type TEXT,
  p_group_id TEXT,
  p_reason TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  rate_limit_result JSONB;
  creator_record RECORD;
BEGIN
  -- Check rate limit first
  rate_limit_result := check_rate_limit(p_creator_id, 'proposal_create', p_group_id);
  IF NOT (rate_limit_result->>'allowed')::BOOLEAN THEN
    RETURN rate_limit_result;
  END IF;

  -- Get creator info
  SELECT role, banned INTO creator_record FROM profiles WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check not banned
  IF creator_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  -- Return success - actual proposal creation happens client-side
  -- This function validates rate limit and permissions
  RETURN jsonb_build_object(
    'success', true,
    'allowed', true,
    'remaining', (rate_limit_result->>'remaining')::INTEGER
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NEW: RATE-LIMITED CREATE EVENT FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_event_rate_limited(
  p_creator_id UUID,
  p_building_id TEXT
) RETURNS JSONB AS $$
DECLARE
  rate_limit_result JSONB;
  creator_record RECORD;
BEGIN
  -- Check rate limit first
  rate_limit_result := check_rate_limit(p_creator_id, 'event_create', p_building_id);
  IF NOT (rate_limit_result->>'allowed')::BOOLEAN THEN
    RETURN rate_limit_result;
  END IF;

  -- Get creator info
  SELECT role, banned INTO creator_record FROM profiles WHERE id = p_creator_id;

  IF creator_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check not banned
  IF creator_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'allowed', true,
    'remaining', (rate_limit_result->>'remaining')::INTEGER
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NEW: RATE-LIMITED MESSAGE SEND FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION send_message_rate_limited(
  p_sender_id UUID,
  p_channel_id TEXT
) RETURNS JSONB AS $$
DECLARE
  rate_limit_result JSONB;
  sender_record RECORD;
BEGIN
  -- Check rate limit first
  rate_limit_result := check_rate_limit(p_sender_id, 'message_send', p_channel_id);
  IF NOT (rate_limit_result->>'allowed')::BOOLEAN THEN
    RETURN rate_limit_result;
  END IF;

  -- Get sender info
  SELECT role, banned INTO sender_record FROM profiles WHERE id = p_sender_id;

  IF sender_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;

  -- Check not banned
  IF sender_record.banned THEN
    RETURN jsonb_build_object('success', false, 'error', 'Account is banned');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'allowed', true,
    'remaining', (rate_limit_result->>'remaining')::INTEGER
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS POLICIES FOR RATE LIMIT TABLES
-- ============================================================================

ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

-- Only allow functions to insert into rate_limit_log
CREATE POLICY "Rate limit log - function access only"
  ON rate_limit_log FOR ALL
  USING (false)
  WITH CHECK (false);

-- Config table is read-only for everyone, write for admins only
CREATE POLICY "Rate limit config - read all"
  ON rate_limit_config FOR SELECT
  USING (true);

CREATE POLICY "Rate limit config - admin write"
  ON rate_limit_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limit_log TO authenticated;
GRANT EXECUTE ON FUNCTION create_proposal_rate_limited TO authenticated;
GRANT EXECUTE ON FUNCTION create_event_rate_limited TO authenticated;
GRANT EXECUTE ON FUNCTION send_message_rate_limited TO authenticated;
