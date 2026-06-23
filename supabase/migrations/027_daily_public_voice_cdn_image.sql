-- Keep Public Voice cover images raster/CDN-based for a consistent lane style.
UPDATE public.articles
SET
  cover_image = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
  updated_at = NOW()
WHERE slug = 'mahasiswa-gelar-aksi-menuju-indonesia-bangkrut'
  AND cover_image = '/images/articles/mahasiswa-menuju-indonesia-bangkrut.svg';
