-- Editorial coverage belongs to /news; concert records stay under /concerts.
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN ('news', 'music', 'concerts', 'lifestyle', 'sports', 'hobbies')
);

UPDATE public.articles
SET
  category = 'news',
  subcategory = CASE
    WHEN slug = 'starter-pack-nonton-konser-jakarta-2026' THEN 'merch'
    WHEN slug = 'kalender-konser-jakarta-2026-juni-desember' THEN 'guide'
    ELSE 'concert'
  END,
  updated_at = NOW();
