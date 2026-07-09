-- Track whether a user's pre-show interest is casual interest or confirmed intent to come.

ALTER TABLE public.concert_interests
ADD COLUMN IF NOT EXISTS intent TEXT NOT NULL DEFAULT 'interested';

DO $$
BEGIN
  ALTER TABLE public.concert_interests
  ADD CONSTRAINT concert_interests_intent_check
  CHECK (intent IN ('interested', 'coming'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DROP POLICY IF EXISTS "Users can update own concert interests" ON public.concert_interests;
CREATE POLICY "Users can update own concert interests"
ON public.concert_interests FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT UPDATE ON public.concert_interests TO authenticated;

CREATE INDEX IF NOT EXISTS idx_concert_interests_concert_intent
ON public.concert_interests(concert_id, intent);
