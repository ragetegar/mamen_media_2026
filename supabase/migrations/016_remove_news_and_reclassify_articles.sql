-- Keep editorial articles inside the five top-level navigation categories.
UPDATE public.articles
SET
  category = CASE
    WHEN slug = 'starter-pack-nonton-konser-jakarta-2026' THEN 'lifestyle'
    ELSE 'concerts'
  END,
  subcategory = CASE
    WHEN slug = 'starter-pack-nonton-konser-jakarta-2026' THEN 'fashion'
    WHEN slug IN (
      'kalender-konser-jakarta-2026-juni-desember',
      'jakarta-fair-2026-konser-musik-guide',
      'pesta-warna-nada-2026-guide',
      'allo-bank-festival-2026-cortis',
      'the-sounds-project-vol-9-guide',
      'lalala-festival-2026-jiexpo-guide'
    ) THEN 'festival'
    WHEN slug IN (
      'bts-world-tour-jakarta-2026-tanggal-venue',
      'kard-drift-jakarta-2026-guide',
      'leehi-only-jakarta-2026-guide',
      'ikon-live-jakarta-2026-guide'
    ) THEN 'kpop'
    ELSE 'international'
  END,
  updated_at = NOW()
WHERE category = 'news';

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN ('music', 'concerts', 'lifestyle', 'sports', 'hobbies')
);
