-- Add Public Voice to the editorial taxonomy and publish its first article.
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_category_check;
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_taxonomy_check;

ALTER TABLE public.articles ADD CONSTRAINT articles_category_check CHECK (
  category IN ('public-voice', 'music', 'lifestyle', 'sports', 'hobbies')
);

ALTER TABLE public.articles ADD CONSTRAINT articles_taxonomy_check CHECK (
  (category = 'public-voice' AND subcategory = 'opinion')
  OR (category = 'music' AND subcategory IN ('review', 'news', 'merch'))
  OR (category = 'lifestyle' AND subcategory IN ('fashion', 'sneaker', 'health'))
  OR (category = 'sports' AND subcategory IN ('football', 'basketball', 'esports'))
  OR (category = 'hobbies' AND subcategory IN ('gaming', 'anime', 'jkt48'))
);

INSERT INTO public.articles (
  slug, title, category, subcategory, cover_image, excerpt, body_html,
  published_at, author, status, seo_title, seo_description, tags, linked_concert_ids,
  created_at, updated_at
)
VALUES (
  'mahasiswa-gelar-aksi-menuju-indonesia-bangkrut',
  'Mahasiswa Gelar Aksi “Menuju Indonesia Bangkrut” Kritik Kebijakan Prabowo',
  'public-voice',
  'opinion',
  '/images/articles/mahasiswa-menuju-indonesia-bangkrut.svg',
  'Ratusan mahasiswa turun ke jalan di Jakarta untuk memprotes kenaikan harga bensin, prioritas anggaran, dan meluasnya peran militer di ranah sipil.',
  $$<p>Ratusan mahasiswa menggelar aksi bertajuk “Menuju Indonesia Bangkrut” di Jakarta pada 12 Juni 2026. Mereka bergerak menuju Bundaran HI untuk menyuarakan penolakan terhadap kenaikan harga bensin serta mengkritik prioritas belanja pemerintahan Presiden Prabowo Subianto. Sejumlah peserta aksi disebut tertahan oleh barisan polisi dan personel militer sebelum mencapai lokasi yang ditentukan.</p>

  <p>Mahasiswa membawa lima tuntutan, antara lain menghentikan program makan gratis dan koperasi desa yang dinilai membebani anggaran, menurunkan harga bahan bakar dan kebutuhan pokok, serta menghentikan belanja yang dianggap boros. Mereka menilai tekanan fiskal membuat subsidi untuk masyarakat berkurang, sementara program besar pemerintah masih menghadapi persoalan pengawasan dan efektivitas.</p>

  <p>Aksi tersebut juga menyoroti meluasnya peran militer dalam urusan sipil yang dikhawatirkan dapat membawa Indonesia kembali ke pola pemerintahan otoriter. Ketegangan sempat terjadi ketika massa mencoba melewati barikade. Para mahasiswa menegaskan aksi ini bukan harapan agar Indonesia benar-benar bangkrut, melainkan peringatan bahwa kondisi ekonomi, demokrasi, dan moral negara perlu segera dibenahi. <strong>Sumber: Reuters.</strong></p>$$,
  '2026-06-12T17:47:00+07:00',
  'Mamen Public Voice',
  'published',
  'Aksi Mahasiswa Menuju Indonesia Bangkrut Kritik Kebijakan Prabowo',
  'Ringkasan aksi mahasiswa di Jakarta yang mengkritik kenaikan harga bensin, prioritas anggaran, dan peran militer di ranah sipil.',
  ARRAY['public voice', 'mahasiswa', 'demonstrasi', 'jakarta', 'kebijakan pemerintah'],
  ARRAY[]::uuid[],
  NOW(),
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  cover_image = EXCLUDED.cover_image,
  excerpt = EXCLUDED.excerpt,
  body_html = EXCLUDED.body_html,
  published_at = EXCLUDED.published_at,
  author = EXCLUDED.author,
  status = EXCLUDED.status,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  tags = EXCLUDED.tags,
  linked_concert_ids = EXCLUDED.linked_concert_ids,
  updated_at = NOW();
