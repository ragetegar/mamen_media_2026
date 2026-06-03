-- ═══════════════════════════════════════════════
-- DIRECT MESSAGES — Mutual-follow gated DMs
-- ═══════════════════════════════════════════════

-- Conversations between two users
CREATE TABLE public.dm_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT dm_no_self CHECK (participant_1 != participant_2),
  CONSTRAINT dm_ordered CHECK (participant_1 < participant_2),
  UNIQUE(participant_1, participant_2)
);

-- Messages within a conversation
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_dm_conversations_p1 ON dm_conversations(participant_1);
CREATE INDEX idx_dm_conversations_p2 ON dm_conversations(participant_2);
CREATE INDEX idx_dm_conversations_last ON dm_conversations(last_message_at DESC);
CREATE INDEX idx_direct_messages_conversation ON direct_messages(conversation_id, created_at DESC);
CREATE INDEX idx_direct_messages_unread ON direct_messages(conversation_id, sender_id) WHERE read_at IS NULL;

-- RLS
ALTER TABLE public.dm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies: only participants can see
CREATE POLICY "Read own conversations" ON public.dm_conversations
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Create conversation only if mutual follow
CREATE POLICY "Create conversation if mutual follow" ON public.dm_conversations
  FOR INSERT WITH CHECK (
    (auth.uid() = participant_1 OR auth.uid() = participant_2)
    AND public.are_mutual_follows(participant_1, participant_2)
  );

CREATE POLICY "Service role full dm_conversations" ON public.dm_conversations
  FOR ALL USING (auth.role() = 'service_role');

-- Message policies: only conversation participants can read/write
CREATE POLICY "Read own messages" ON public.direct_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dm_conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Send messages in own conversations" ON public.direct_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM dm_conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Allow marking messages as read
CREATE POLICY "Mark messages read" ON public.direct_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dm_conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM dm_conversations c
      WHERE c.id = conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Service role full direct_messages" ON public.direct_messages
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update last_message_at on new message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dm_conversations SET last_message_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_direct_message
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE PROCEDURE public.update_conversation_last_message();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
