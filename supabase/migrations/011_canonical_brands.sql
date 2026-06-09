-- ═══════════════════════════════════════════════
-- CANONICAL BRANDS FOR TOP BRANDS + AFFILIATE PRODUCTS
-- ═══════════════════════════════════════════════

ALTER TABLE public.featured_brands
  ADD COLUMN IF NOT EXISTS normalized_name TEXT;

CREATE OR REPLACE FUNCTION public.normalize_brand_name(value TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
STRICT
AS $$
  SELECT lower(regexp_replace(btrim(value), '\s+', ' ', 'g'));
$$;

UPDATE public.featured_brands
SET normalized_name = public.normalize_brand_name(name)
WHERE normalized_name IS NULL;

-- Keep the oldest record when brands only differ by case or spacing.
WITH ranked_brands AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY normalized_name
      ORDER BY created_at ASC NULLS LAST, id ASC
    ) AS duplicate_rank
  FROM public.featured_brands
)
DELETE FROM public.featured_brands
WHERE id IN (
  SELECT id FROM ranked_brands WHERE duplicate_rank > 1
);

ALTER TABLE public.featured_brands
  ALTER COLUMN normalized_name SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS featured_brands_normalized_name_key
  ON public.featured_brands (normalized_name);

CREATE OR REPLACE FUNCTION public.set_featured_brand_normalized_name()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.name := regexp_replace(btrim(NEW.name), '\s+', ' ', 'g');
  NEW.normalized_name := public.normalize_brand_name(NEW.name);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_featured_brand_normalized_name ON public.featured_brands;
CREATE TRIGGER set_featured_brand_normalized_name
  BEFORE INSERT OR UPDATE OF name ON public.featured_brands
  FOR EACH ROW EXECUTE FUNCTION public.set_featured_brand_normalized_name();

ALTER TABLE public.article_products
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.featured_brands(id) ON DELETE RESTRICT;

-- Existing products predate brand capture, so attach them to an inactive placeholder.
INSERT INTO public.featured_brands (name, normalized_name, image, link, tag, sort_order, is_active)
VALUES ('Unbranded', 'unbranded', '', '/', NULL, 0, false)
ON CONFLICT (normalized_name) DO NOTHING;

UPDATE public.article_products
SET brand_id = (
  SELECT id FROM public.featured_brands WHERE normalized_name = 'unbranded'
)
WHERE brand_id IS NULL;

ALTER TABLE public.article_products
  ALTER COLUMN brand_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_article_products_brand
  ON public.article_products (brand_id);
