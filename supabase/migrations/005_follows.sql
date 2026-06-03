-- ═══════════════════════════════════════════════
-- FOLLOWS — Social follow system
-- ═══════════════════════════════════════════════

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT follows_no_self CHECK (follower_id != following_id),
  UNIQUE(follower_id, following_id)
);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Auth users follow" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Auth users unfollow" ON public.follows FOR DELETE USING (auth.uid() = follower_id);
CREATE POLICY "Service role full follows" ON public.follows FOR ALL USING (auth.role() = 'service_role');

-- Helper function: check mutual follow
CREATE OR REPLACE FUNCTION public.are_mutual_follows(user1 UUID, user2 UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = user1 AND following_id = user2
  ) AND EXISTS (
    SELECT 1 FROM public.follows WHERE follower_id = user2 AND following_id = user1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
