-- News is an editorial namespace. Concerts is reserved for event records/layouts.
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN ('news', 'music', 'concerts', 'lifestyle', 'sports', 'hobbies')
);

UPDATE public.articles
SET
  category = 'news',
  subcategory = CASE
    WHEN slug IN (
      'kalender-konser-jakarta-2026-juni-desember',
      'jakarta-fair-2026-konser-musik-guide',
      'pesta-warna-nada-2026-guide',
      'kard-drift-jakarta-2026-guide',
      'the-sounds-project-vol-9-guide',
      'leehi-only-jakarta-2026-guide',
      'ikon-live-jakarta-2026-guide',
      'lalala-festival-2026-jiexpo-guide'
    ) THEN 'guide'
    ELSE 'concert'
  END,
  updated_at = NOW()
WHERE category = 'concerts';
