-- Migration: Chat Messages Tables
-- Stores building chat messages and direct messages.
-- Can be used alongside Socket.io for persistence and search,
-- or with Supabase Realtime for full real-time functionality.

-- ============================================================================
-- CHAT MESSAGES TABLE (building/room chat)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL,  -- chatSlug for buildings, group_id for blocs
  sender_id UUID REFERENCES public.profiles(id),
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement')),

  -- Metadata
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.profiles(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);

-- ============================================================================
-- DIRECT MESSAGES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  text TEXT NOT NULL,

  -- Status
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT FALSE,
  deleted_by_recipient BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_recipient ON public.direct_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_dm_conversation ON public.direct_messages(
  LEAST(sender_id, recipient_id),
  GREATEST(sender_id, recipient_id),
  created_at DESC
);

-- ============================================================================
-- CONVERSATION THREADS TABLE (for tracking DM conversations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.dm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES public.profiles(id),
  participant_2 UUID NOT NULL REFERENCES public.profiles(id),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_preview TEXT,

  -- Unread tracking
  unread_count_1 INTEGER DEFAULT 0,  -- unread for participant_1
  unread_count_2 INTEGER DEFAULT 0,  -- unread for participant_2

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure unique conversation per pair (use index since UNIQUE can't use functions)
CREATE UNIQUE INDEX IF NOT EXISTS idx_dm_conv_unique_pair ON public.dm_conversations (
  LEAST(participant_1, participant_2),
  GREATEST(participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_dm_conv_participant1 ON public.dm_conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_dm_conv_participant2 ON public.dm_conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_dm_conv_last_message ON public.dm_conversations(last_message_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;

-- Chat messages: anyone can read, authenticated users can send
DROP POLICY IF EXISTS chat_messages_select ON public.chat_messages;
CREATE POLICY chat_messages_select ON public.chat_messages
  FOR SELECT USING (deleted = FALSE OR sender_id = get_current_user_id() OR is_current_user_admin());

DROP POLICY IF EXISTS chat_messages_insert ON public.chat_messages;
CREATE POLICY chat_messages_insert ON public.chat_messages
  FOR INSERT WITH CHECK (sender_id = get_current_user_id() OR sender_id IS NULL);

DROP POLICY IF EXISTS chat_messages_update ON public.chat_messages;
CREATE POLICY chat_messages_update ON public.chat_messages
  FOR UPDATE USING (sender_id = get_current_user_id() OR is_current_user_organizer_or_higher());

DROP POLICY IF EXISTS chat_messages_delete ON public.chat_messages;
CREATE POLICY chat_messages_delete ON public.chat_messages
  FOR DELETE USING (sender_id = get_current_user_id() OR is_current_user_admin());

-- Direct messages: only participants can access
DROP POLICY IF EXISTS dm_select ON public.direct_messages;
CREATE POLICY dm_select ON public.direct_messages
  FOR SELECT USING (
    sender_id = get_current_user_id() OR recipient_id = get_current_user_id()
  );

DROP POLICY IF EXISTS dm_insert ON public.direct_messages;
CREATE POLICY dm_insert ON public.direct_messages
  FOR INSERT WITH CHECK (sender_id = get_current_user_id());

DROP POLICY IF EXISTS dm_update ON public.direct_messages;
CREATE POLICY dm_update ON public.direct_messages
  FOR UPDATE USING (sender_id = get_current_user_id() OR recipient_id = get_current_user_id());

-- DM conversations: only participants can access
DROP POLICY IF EXISTS dm_conv_select ON public.dm_conversations;
CREATE POLICY dm_conv_select ON public.dm_conversations
  FOR SELECT USING (
    participant_1 = get_current_user_id() OR participant_2 = get_current_user_id()
  );

DROP POLICY IF EXISTS dm_conv_insert ON public.dm_conversations;
CREATE POLICY dm_conv_insert ON public.dm_conversations
  FOR INSERT WITH CHECK (
    participant_1 = get_current_user_id() OR participant_2 = get_current_user_id()
  );

DROP POLICY IF EXISTS dm_conv_update ON public.dm_conversations;
CREATE POLICY dm_conv_update ON public.dm_conversations
  FOR UPDATE USING (
    participant_1 = get_current_user_id() OR participant_2 = get_current_user_id()
  );

-- ============================================================================
-- SERVER FUNCTIONS
-- ============================================================================

-- Send chat message
CREATE OR REPLACE FUNCTION send_chat_message_secure(
  p_room_id TEXT,
  p_text TEXT,
  p_message_type TEXT DEFAULT 'text'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_user_name TEXT;
  v_message_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  SELECT nickname INTO v_user_name FROM public.profiles WHERE id = v_user_id;
  IF v_user_name IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Profile not found');
  END IF;

  IF p_text IS NULL OR length(trim(p_text)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Message text is required');
  END IF;

  INSERT INTO public.chat_messages (room_id, sender_id, sender_name, text, message_type)
  VALUES (p_room_id, v_user_id, v_user_name, trim(p_text), p_message_type)
  RETURNING id INTO v_message_id;

  RETURN json_build_object('success', true, 'message_id', v_message_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Delete chat message (soft delete)
CREATE OR REPLACE FUNCTION delete_chat_message_secure(p_message_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_sender_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  SELECT sender_id INTO v_sender_id FROM public.chat_messages WHERE id = p_message_id;
  IF v_sender_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Message not found');
  END IF;

  -- Only sender or admin can delete
  IF v_sender_id != v_user_id AND NOT is_current_user_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Not authorized');
  END IF;

  UPDATE public.chat_messages
  SET deleted = TRUE, deleted_at = NOW(), deleted_by = v_user_id
  WHERE id = p_message_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Get chat messages for room (with pagination)
CREATE OR REPLACE FUNCTION get_chat_messages(
  p_room_id TEXT,
  p_limit INTEGER DEFAULT 50,
  p_before TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  sender_name TEXT,
  text TEXT,
  message_type TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.sender_id,
    m.sender_name,
    m.text,
    m.message_type,
    m.created_at
  FROM public.chat_messages m
  WHERE m.room_id = p_room_id
    AND m.deleted = FALSE
    AND (p_before IS NULL OR m.created_at < p_before)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Send direct message
CREATE OR REPLACE FUNCTION send_direct_message_secure(
  p_recipient_id UUID,
  p_text TEXT
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_message_id UUID;
  v_conv_id UUID;
  v_preview TEXT;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  IF p_text IS NULL OR length(trim(p_text)) = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Message text is required');
  END IF;

  IF p_recipient_id = v_user_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot send message to yourself');
  END IF;

  -- Create message
  INSERT INTO public.direct_messages (sender_id, recipient_id, text)
  VALUES (v_user_id, p_recipient_id, trim(p_text))
  RETURNING id INTO v_message_id;

  -- Create preview (first 50 chars)
  v_preview := LEFT(trim(p_text), 50);
  IF length(trim(p_text)) > 50 THEN
    v_preview := v_preview || '...';
  END IF;

  -- Upsert conversation (manual check since unique index doesn't support ON CONFLICT with expressions)
  IF EXISTS (
    SELECT 1 FROM public.dm_conversations
    WHERE participant_1 = LEAST(v_user_id, p_recipient_id)
      AND participant_2 = GREATEST(v_user_id, p_recipient_id)
  ) THEN
    -- Update existing conversation
    UPDATE public.dm_conversations
    SET
      last_message_at = NOW(),
      last_message_preview = v_preview,
      unread_count_1 = CASE WHEN participant_1 = v_user_id THEN unread_count_1 ELSE unread_count_1 + 1 END,
      unread_count_2 = CASE WHEN participant_2 = v_user_id THEN unread_count_2 ELSE unread_count_2 + 1 END
    WHERE participant_1 = LEAST(v_user_id, p_recipient_id)
      AND participant_2 = GREATEST(v_user_id, p_recipient_id);
  ELSE
    -- Create new conversation
    INSERT INTO public.dm_conversations (
      participant_1, participant_2, last_message_at, last_message_preview,
      unread_count_1, unread_count_2
    ) VALUES (
      LEAST(v_user_id, p_recipient_id),
      GREATEST(v_user_id, p_recipient_id),
      NOW(),
      v_preview,
      CASE WHEN v_user_id < p_recipient_id THEN 0 ELSE 1 END,
      CASE WHEN v_user_id < p_recipient_id THEN 1 ELSE 0 END
    );
  END IF;

  RETURN json_build_object('success', true, 'message_id', v_message_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Mark conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read_secure(p_other_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User context not set');
  END IF;

  -- Mark messages as read
  UPDATE public.direct_messages
  SET read_at = NOW()
  WHERE recipient_id = v_user_id
    AND sender_id = p_other_user_id
    AND read_at IS NULL;

  -- Update conversation unread count
  UPDATE public.dm_conversations
  SET
    unread_count_1 = CASE WHEN participant_1 = v_user_id THEN 0 ELSE unread_count_1 END,
    unread_count_2 = CASE WHEN participant_2 = v_user_id THEN 0 ELSE unread_count_2 END
  WHERE (participant_1 = v_user_id AND participant_2 = p_other_user_id)
     OR (participant_1 = p_other_user_id AND participant_2 = v_user_id);

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Get user's conversations
CREATE OR REPLACE FUNCTION get_my_conversations()
RETURNS TABLE (
  conversation_id UUID,
  other_user_id UUID,
  other_user_name TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count INTEGER
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    c.id AS conversation_id,
    CASE WHEN c.participant_1 = v_user_id THEN c.participant_2 ELSE c.participant_1 END AS other_user_id,
    p.nickname AS other_user_name,
    c.last_message_at,
    c.last_message_preview,
    CASE WHEN c.participant_1 = v_user_id THEN c.unread_count_1 ELSE c.unread_count_2 END AS unread_count
  FROM public.dm_conversations c
  JOIN public.profiles p ON p.id = (
    CASE WHEN c.participant_1 = v_user_id THEN c.participant_2 ELSE c.participant_1 END
  )
  WHERE c.participant_1 = v_user_id OR c.participant_2 = v_user_id
  ORDER BY c.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Get direct messages with a user (with pagination)
CREATE OR REPLACE FUNCTION get_direct_messages(
  p_other_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_before TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  sender_id UUID,
  text TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    m.id,
    m.sender_id,
    m.text,
    m.read_at,
    m.created_at
  FROM public.direct_messages m
  WHERE (
    (m.sender_id = v_user_id AND m.recipient_id = p_other_user_id AND m.deleted_by_sender = FALSE)
    OR
    (m.sender_id = p_other_user_id AND m.recipient_id = v_user_id AND m.deleted_by_recipient = FALSE)
  )
  AND (p_before IS NULL OR m.created_at < p_before)
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Get total unread DM count
CREATE OR REPLACE FUNCTION get_unread_dm_count()
RETURNS INTEGER AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  v_user_id := get_current_user_id();

  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(
    CASE
      WHEN participant_1 = v_user_id THEN unread_count_1
      ELSE unread_count_2
    END
  ), 0) INTO v_count
  FROM public.dm_conversations
  WHERE participant_1 = v_user_id OR participant_2 = v_user_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for chat messages (for Supabase Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON public.chat_messages TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;

GRANT SELECT ON public.direct_messages TO authenticated;
GRANT INSERT, UPDATE ON public.direct_messages TO authenticated;

GRANT SELECT ON public.dm_conversations TO authenticated;
GRANT INSERT, UPDATE ON public.dm_conversations TO authenticated;

GRANT EXECUTE ON FUNCTION send_chat_message_secure TO authenticated;
GRANT EXECUTE ON FUNCTION delete_chat_message_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION send_direct_message_secure TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_read_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_conversations TO authenticated;
GRANT EXECUTE ON FUNCTION get_direct_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_dm_count TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.chat_messages IS 'Building/room chat messages (can be used with Socket.io or Supabase Realtime)';
COMMENT ON TABLE public.direct_messages IS 'Private direct messages between users';
COMMENT ON TABLE public.dm_conversations IS 'DM conversation threads with unread tracking';

COMMENT ON FUNCTION send_chat_message_secure IS 'Send a message to a chat room';
COMMENT ON FUNCTION delete_chat_message_secure IS 'Soft delete a chat message';
COMMENT ON FUNCTION get_chat_messages IS 'Get messages for a room with pagination';
COMMENT ON FUNCTION send_direct_message_secure IS 'Send a direct message to another user';
COMMENT ON FUNCTION mark_conversation_read_secure IS 'Mark all messages from a user as read';
COMMENT ON FUNCTION get_my_conversations IS 'Get all conversations for current user';
COMMENT ON FUNCTION get_direct_messages IS 'Get messages with a specific user';
COMMENT ON FUNCTION get_unread_dm_count IS 'Get total unread DM count for current user';
