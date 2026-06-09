-- Featured brands should link to live category pages, not removed mock articles.
UPDATE public.featured_brands
SET link = CASE name
  WHEN 'Nike' THEN '/lifestyle?sub=fashion'
  WHEN 'JBL' THEN '/music?sub=merch'
  WHEN 'Audio Technica' THEN '/music?sub=review'
  WHEN 'PlayStation' THEN '/hobbies?sub=gaming'
  WHEN 'Adidas' THEN '/lifestyle?sub=fashion'
  ELSE link
END
WHERE name IN ('Nike', 'JBL', 'Audio Technica', 'PlayStation', 'Adidas');
