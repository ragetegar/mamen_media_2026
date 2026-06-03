-- ── Comments ──
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- NULL means top-level comment
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ──
-- Public can read all comments
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Admins and contributors can delete any comment
CREATE POLICY "Service role and admins can delete comments" ON public.comments FOR DELETE USING (
    auth.role() = 'service_role' OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'contributor')
    )
);

-- ── View: comments_with_profiles ──
-- This view joins the comments table with the public.profiles table so we can 
-- easily fetch comment bodies along with their author's name, handle, avatar, and role.
CREATE OR REPLACE VIEW public.comments_with_profiles AS
SELECT 
    c.id,
    c.article_id,
    c.parent_id,
    c.user_id,
    c.body,
    c.created_at,
    p.name AS user_name,
    p.handle AS user_handle,
    p.avatar AS user_avatar,
    p.role AS user_role
FROM 
    public.comments c
JOIN 
    public.profiles p ON c.user_id = p.id;
