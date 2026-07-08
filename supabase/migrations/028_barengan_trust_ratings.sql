-- Barengan trust ratings and admin-managed profile trust tags.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS barengan_custom_tag TEXT,
  ADD COLUMN IF NOT EXISTS barengan_trust_score INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_barengan_custom_tag_length'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_barengan_custom_tag_length
      CHECK (barengan_custom_tag IS NULL OR char_length(barengan_custom_tag) <= 24);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.barengan_user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barengan_post_id UUID NOT NULL REFERENCES public.barengan_posts(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(barengan_post_id, rater_id, target_user_id),
  CHECK (rater_id <> target_user_id)
);

CREATE INDEX IF NOT EXISTS idx_barengan_user_ratings_post
  ON public.barengan_user_ratings(barengan_post_id);

CREATE INDEX IF NOT EXISTS idx_barengan_user_ratings_target
  ON public.barengan_user_ratings(target_user_id);

ALTER TABLE public.barengan_user_ratings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barengan_user_ratings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.barengan_user_ratings TO service_role;

DROP POLICY IF EXISTS "Group members can read barengan ratings" ON public.barengan_user_ratings;
DROP POLICY IF EXISTS "Raters can read own barengan ratings" ON public.barengan_user_ratings;
CREATE POLICY "Raters can read own barengan ratings"
  ON public.barengan_user_ratings
  FOR SELECT
  TO authenticated
  USING (
    rater_id = (SELECT auth.uid())
    AND public.is_barengan_group_member(barengan_post_id, (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "Group members can rate after event" ON public.barengan_user_ratings;
CREATE POLICY "Group members can rate after event"
  ON public.barengan_user_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    rater_id = (SELECT auth.uid())
    AND rater_id <> target_user_id
    AND public.is_barengan_group_member(barengan_post_id, (SELECT auth.uid()))
    AND (
      EXISTS (
        SELECT 1
        FROM public.barengan_posts bp
        JOIN public.concerts c ON c.id = bp.concert_id
        WHERE bp.id = barengan_user_ratings.barengan_post_id
          AND COALESCE(c.end_datetime, c.start_datetime) < NOW()
      )
    )
    AND (
      EXISTS (
        SELECT 1
        FROM public.barengan_posts bp
        WHERE bp.id = barengan_user_ratings.barengan_post_id
          AND bp.user_id = barengan_user_ratings.target_user_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.barengan_members bm
        WHERE bm.barengan_post_id = barengan_user_ratings.barengan_post_id
          AND bm.user_id = barengan_user_ratings.target_user_id
          AND bm.status = 'approved'
      )
    )
  );

DROP POLICY IF EXISTS "Raters can update own barengan ratings" ON public.barengan_user_ratings;
CREATE POLICY "Raters can update own barengan ratings"
  ON public.barengan_user_ratings
  FOR UPDATE
  TO authenticated
  USING (rater_id = (SELECT auth.uid()))
  WITH CHECK (
    rater_id = (SELECT auth.uid())
    AND rater_id <> target_user_id
    AND public.is_barengan_group_member(barengan_post_id, (SELECT auth.uid()))
    AND (
      EXISTS (
        SELECT 1
        FROM public.barengan_posts bp
        JOIN public.concerts c ON c.id = bp.concert_id
        WHERE bp.id = barengan_user_ratings.barengan_post_id
          AND COALESCE(c.end_datetime, c.start_datetime) < NOW()
      )
    )
    AND (
      EXISTS (
        SELECT 1
        FROM public.barengan_posts bp
        WHERE bp.id = barengan_user_ratings.barengan_post_id
          AND bp.user_id = barengan_user_ratings.target_user_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.barengan_members bm
        WHERE bm.barengan_post_id = barengan_user_ratings.barengan_post_id
          AND bm.user_id = barengan_user_ratings.target_user_id
          AND bm.status = 'approved'
      )
    )
  );

DROP POLICY IF EXISTS "Raters can delete own barengan ratings" ON public.barengan_user_ratings;
CREATE POLICY "Raters can delete own barengan ratings"
  ON public.barengan_user_ratings
  FOR DELETE
  TO authenticated
  USING (rater_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full barengan user ratings" ON public.barengan_user_ratings;
CREATE POLICY "Service role full barengan user ratings"
  ON public.barengan_user_ratings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.refresh_barengan_trust_score(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET barengan_trust_score = COALESCE((
    SELECT SUM(rating)::INTEGER
    FROM public.barengan_user_ratings
    WHERE target_user_id = p_user_id
  ), 0)
  WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_barengan_user_rating_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_barengan_trust_score(OLD.target_user_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_barengan_trust_score(NEW.target_user_id);
  IF TG_OP = 'UPDATE' AND OLD.target_user_id <> NEW.target_user_id THEN
    PERFORM public.refresh_barengan_trust_score(OLD.target_user_id);
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_barengan_trust_score(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_barengan_user_rating_score() FROM PUBLIC;

DROP TRIGGER IF EXISTS trg_barengan_user_rating_score ON public.barengan_user_ratings;
CREATE TRIGGER trg_barengan_user_rating_score
  AFTER INSERT OR UPDATE OR DELETE ON public.barengan_user_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_barengan_user_rating_score();

UPDATE public.profiles p
SET barengan_trust_score = COALESCE(scores.score, 0)
FROM (
  SELECT
    profiles.id,
    COALESCE(SUM(r.rating), 0)::INTEGER AS score
  FROM public.profiles
  LEFT JOIN public.barengan_user_ratings r ON r.target_user_id = profiles.id
  GROUP BY profiles.id
) scores
WHERE scores.id = p.id;
