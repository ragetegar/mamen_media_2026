-- Articles use a required main-category/subcategory hierarchy.
UPDATE public.articles
SET
  category = 'music',
  subcategory = 'news',
  updated_at = NOW()
WHERE category = 'news';

UPDATE public.articles
SET subcategory = CASE category
  WHEN 'music' THEN 'news'
  WHEN 'lifestyle' THEN 'fashion'
  WHEN 'sports' THEN 'football'
  WHEN 'hobbies' THEN 'gaming'
END
WHERE subcategory IS NULL OR subcategory = '';

ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_taxonomy_check;
ALTER TABLE public.articles ALTER COLUMN subcategory SET NOT NULL;

ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN ('music', 'lifestyle', 'sports', 'hobbies')
);

ALTER TABLE public.articles ADD CONSTRAINT articles_taxonomy_check CHECK (
  (category = 'music' AND subcategory IN ('review', 'news', 'merch'))
  OR (category = 'lifestyle' AND subcategory IN ('fashion', 'sneaker', 'health'))
  OR (category = 'sports' AND subcategory IN ('football', 'basketball', 'esports'))
  OR (category = 'hobbies' AND subcategory IN ('gaming', 'anime', 'jkt48'))
);

UPDATE public.featured_brands
SET link = CASE name
  WHEN 'Nike' THEN '/lifestyle/fashion'
  WHEN 'JBL' THEN '/music/merch'
  WHEN 'Audio Technica' THEN '/music/review'
  WHEN 'PlayStation' THEN '/hobbies/gaming'
  WHEN 'Adidas' THEN '/lifestyle/fashion'
  ELSE link
END
WHERE name IN ('Nike', 'JBL', 'Audio Technica', 'PlayStation', 'Adidas');
