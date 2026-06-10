-- Separate lightweight concert interest reactions from confirmed attendance.

CREATE TABLE IF NOT EXISTS public.concert_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    concert_id UUID NOT NULL REFERENCES public.concerts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, concert_id)
);

ALTER TABLE public.concert_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own concert interests"
ON public.concert_interests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add own concert interests"
ON public.concert_interests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own concert interests"
ON public.concert_interests FOR DELETE
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.concert_interests TO authenticated;

CREATE INDEX IF NOT EXISTS idx_concert_interests_user
ON public.concert_interests(user_id);

CREATE INDEX IF NOT EXISTS idx_concert_interests_concert
ON public.concert_interests(concert_id);

-- The old main "I'm Interested" button stored rows with the default manual source.
INSERT INTO public.concert_interests (user_id, concert_id, created_at)
SELECT user_id, concert_id, created_at
FROM public.concert_attendees
WHERE COALESCE(source, 'manual') = 'manual'
ON CONFLICT (user_id, concert_id) DO NOTHING;

DELETE FROM public.concert_attendees
WHERE COALESCE(source, 'manual') = 'manual';

UPDATE public.concerts AS concert
SET interested_count = (
    SELECT COUNT(*)::INTEGER
    FROM public.concert_interests AS interest
    WHERE interest.concert_id = concert.id
);

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.sync_concert_interested_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    target_concert_id UUID;
BEGIN
    target_concert_id := COALESCE(NEW.concert_id, OLD.concert_id);

    UPDATE public.concerts
    SET
        interested_count = (
            SELECT COUNT(*)::INTEGER
            FROM public.concert_interests
            WHERE concert_id = target_concert_id
        ),
        updated_at = NOW()
    WHERE id = target_concert_id;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_concert_interested_count ON public.concert_interests;
CREATE TRIGGER sync_concert_interested_count
AFTER INSERT OR DELETE ON public.concert_interests
FOR EACH ROW
EXECUTE FUNCTION private.sync_concert_interested_count();
