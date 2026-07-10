CREATE TABLE IF NOT EXISTS public.homepage_sponsors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT NOT NULL DEFAULT '/',
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.homepage_sponsors ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.homepage_sponsors TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.homepage_sponsors TO service_role;

DROP POLICY IF EXISTS "Public read active homepage sponsors" ON public.homepage_sponsors;
CREATE POLICY "Public read active homepage sponsors"
  ON public.homepage_sponsors
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);
