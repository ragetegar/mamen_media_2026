-- Move the original hardcoded Top Brands cards into the canonical brand catalog.
INSERT INTO public.featured_brands (name, normalized_name, image, link, tag, sort_order, is_active)
VALUES
  ('Nike', 'nike', 'https://picsum.photos/seed/nikebrand/400/400', '/media/nike-dunk-low-jakarta-colorway-release', 'New Drop', 1, true),
  ('JBL', 'jbl', 'https://picsum.photos/seed/jblbrand/400/400', '/media/best-audio-gear-concert-goers-2026', 'Hot', 2, true),
  ('Audio T.', 'audio t.', 'https://picsum.photos/seed/atbrand/400/400', '/media/hindia-menari-dengan-bayangan-album-review', 'Featured', 3, true),
  ('PlayStation', 'playstation', 'https://picsum.photos/seed/psbrand/400/400', '/media/elden-ring-dlc-shadow-erdtree-review', 'Gaming', 4, true),
  ('Adidas', 'adidas', 'https://picsum.photos/seed/adidasbrand/400/400', '/media?cat=lifestyle', 'Style', 5, true)
ON CONFLICT (normalized_name) DO UPDATE SET
  image = EXCLUDED.image,
  link = EXCLUDED.link,
  tag = EXCLUDED.tag,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;
