-- Baseline moderation and server-side content limits for launch.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'comments_body_length'
      AND conrelid = 'public.comments'::regclass
  ) THEN
    ALTER TABLE public.comments
      ADD CONSTRAINT comments_body_length
      CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('comment', 'barengan_post', 'message', 'profile')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL DEFAULT 'user_report',
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(reporter_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_reports_status_created_at
  ON public.reports(status, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can read their own reports" ON public.reports;
CREATE POLICY "Users can read their own reports"
  ON public.reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role full reports" ON public.reports;
CREATE POLICY "Service role full reports"
  ON public.reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
