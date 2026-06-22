-- Add profile badges for verified accounts and official partners.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS official_partner_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS official_partner_logo TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS official_partner_url TEXT;

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
    p.role AS user_role,
    p.is_verified AS user_is_verified
FROM
    public.comments c
JOIN
    public.profiles p ON c.user_id = p.id;
