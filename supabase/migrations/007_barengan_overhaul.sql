-- ═══════════════════════════════════════════════
-- BARENGAN OVERHAUL — Approval-based groups + group chat
-- ═══════════════════════════════════════════════

-- ── Add max_members to barengan_posts if not exists ──
ALTER TABLE barengan_posts ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 5;

-- ── Barengan Members (replaces simple responses with approval system) ──
CREATE TABLE public.barengan_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES barengan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barengan_post_id, user_id)
);

-- ── Barengan Messages (group chat) ──
CREATE TABLE public.barengan_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES barengan_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_barengan_members_post ON barengan_members(barengan_post_id);
CREATE INDEX idx_barengan_members_user ON barengan_members(user_id);
CREATE INDEX idx_barengan_members_status ON barengan_members(barengan_post_id, status);
CREATE INDEX idx_barengan_messages_post ON barengan_messages(barengan_post_id, created_at);

-- ── Helper functions ──

-- Check if user is approved member or post creator
CREATE OR REPLACE FUNCTION public.is_barengan_group_member(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM barengan_posts WHERE id = p_post_id AND user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM barengan_members WHERE barengan_post_id = p_post_id AND user_id = p_user_id AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if barengan group chat is still active (concert not ended + 24h)
CREATE OR REPLACE FUNCTION public.is_barengan_group_active(p_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_end TIMESTAMPTZ;
  v_start TIMESTAMPTZ;
BEGIN
  SELECT c.end_datetime, c.start_datetime INTO v_end, v_start
  FROM barengan_posts bp
  JOIN concerts c ON c.id = bp.concert_id
  WHERE bp.id = p_post_id;

  -- Use end_datetime if available, otherwise start_datetime
  v_end := COALESCE(v_end, v_start);
  IF v_end IS NULL THEN RETURN true; END IF;

  -- Active if concert end + 24 hours hasn't passed
  RETURN NOW() < (v_end + INTERVAL '24 hours');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── RLS ──
ALTER TABLE public.barengan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barengan_messages ENABLE ROW LEVEL SECURITY;

-- Members: post creator and the member themselves can see all members of a post
CREATE POLICY "Read members of posts" ON public.barengan_members
  FOR SELECT USING (
    -- Post creator can see all
    EXISTS (SELECT 1 FROM barengan_posts WHERE id = barengan_post_id AND user_id = auth.uid())
    -- Or you can see your own membership
    OR user_id = auth.uid()
    -- Or you're an approved member (can see other approved members)
    OR (
      status = 'approved'
      AND public.is_barengan_group_member(barengan_post_id, auth.uid())
    )
  );

CREATE POLICY "Request to join" ON public.barengan_members
  FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Post creator can approve/reject
CREATE POLICY "Creator manages members" ON public.barengan_members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM barengan_posts WHERE id = barengan_post_id AND user_id = auth.uid())
  );

CREATE POLICY "Own member delete" ON public.barengan_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full barengan_members" ON public.barengan_members
  FOR ALL USING (auth.role() = 'service_role');

-- Messages: only approved group members can read and write, only when active
CREATE POLICY "Read group messages" ON public.barengan_messages
  FOR SELECT USING (public.is_barengan_group_member(barengan_post_id, auth.uid()));

CREATE POLICY "Send group messages" ON public.barengan_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND public.is_barengan_group_member(barengan_post_id, auth.uid())
    AND public.is_barengan_group_active(barengan_post_id)
  );

CREATE POLICY "Service role full barengan_messages" ON public.barengan_messages
  FOR ALL USING (auth.role() = 'service_role');

-- ── Migrate existing responses to members (approved) ──
INSERT INTO barengan_members (barengan_post_id, user_id, message, status, created_at)
SELECT barengan_post_id, user_id, COALESCE(message, ''), 'approved', created_at
FROM barengan_responses
ON CONFLICT (barengan_post_id, user_id) DO NOTHING;

-- Keep barengan_responses for backward compatibility but rename
ALTER TABLE barengan_responses RENAME TO barengan_responses_deprecated;

-- Enable Realtime for group chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.barengan_messages;
