-- Keep brand normalization functions independent of caller-controlled schemas.
ALTER FUNCTION public.normalize_brand_name(TEXT) SET search_path = '';
ALTER FUNCTION public.set_featured_brand_normalized_name() SET search_path = '';
