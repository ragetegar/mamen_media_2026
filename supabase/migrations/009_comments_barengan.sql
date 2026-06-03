-- ═══════════════════════════════════════════════
-- COMMENTS — Extend to support barengan posts
-- ═══════════════════════════════════════════════

-- Make article_id nullable (comments can belong to either article or barengan)
ALTER TABLE public.comments ALTER COLUMN article_id DROP NOT NULL;

-- Add barengan_post_id column
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS barengan_post_id UUID REFERENCES barengan_posts(id) ON DELETE CASCADE;

-- Ensure comment belongs to exactly one parent (article OR barengan)
ALTER TABLE public.comments ADD CONSTRAINT comments_one_parent CHECK (
  (article_id IS NOT NULL AND barengan_post_id IS NULL)
  OR (article_id IS NULL AND barengan_post_id IS NOT NULL)
);

-- Index for barengan comments
CREATE INDEX idx_comments_barengan_post_id ON comments(barengan_post_id);

-- Update RLS: barengan comments only visible to authenticated users
DROP POLICY IF EXISTS "Public read comments" ON public.comments;
CREATE POLICY "Read comments" ON public.comments FOR SELECT USING (
  -- Article comments: public
  (article_id IS NOT NULL)
  -- Barengan comments: authenticated only
  OR (barengan_post_id IS NOT NULL AND auth.uid() IS NOT NULL)
);

-- Update the view to include barengan_post_id
CREATE OR REPLACE VIEW public.comments_with_profiles AS
SELECT
    c.id,
    c.article_id,
    c.barengan_post_id,
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
