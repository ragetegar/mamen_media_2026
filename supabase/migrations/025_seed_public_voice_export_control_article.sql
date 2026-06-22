-- Publish a Public Voice politics article using a remote news image.
INSERT INTO public.articles (
  slug, title, category, subcategory, cover_image, excerpt, body_html,
  published_at, author, status, seo_title, seo_description, tags, linked_concert_ids,
  created_at, updated_at
)
VALUES (
  'prabowo-ambil-alih-jalur-ekspor-komoditas-kunci',
  'Prabowo Ambil Alih Jalur Ekspor Komoditas Kunci, Publik Perlu Awasi Danantara',
  'public-voice',
  'opinion',
  'https://cdn.setneg.go.id/_multimedia/photo/20250815/4658WhatsApp_Image_2025-08-15_at_6.44.21_PM.jpeg',
  'Pemerintah berencana membuat ekspor sawit, batu bara, dan ferroalloy lewat kanal negara. Tujuannya menutup kebocoran, tapi pengawasan publik jadi kunci.',
  $$<p>Pemerintahan Presiden Prabowo Subianto menyiapkan langkah besar dalam tata kelola ekspor komoditas strategis. Sawit, batu bara, dan ferroalloy disebut akan menjadi tahap awal komoditas yang penjualannya diarahkan melalui badan usaha milik negara yang ditunjuk pemerintah sebagai eksportir tunggal. Pemerintah membingkai kebijakan ini sebagai upaya menutup kebocoran penerimaan, memperkuat pengawasan, dan mencegah praktik seperti under-invoicing, transfer pricing, serta parkir devisa ekspor di luar negeri.</p>

  <p>Secara politik, kebijakan ini menunjukkan arah negara yang makin aktif mengendalikan sektor sumber daya alam. Di satu sisi, argumennya masuk akal: komoditas besar selama ini sering menjadi ruang abu-abu antara data ekspor, penerimaan negara, dan keuntungan korporasi. Jika negara bisa membaca volume, harga, dan arus uang dengan lebih jernih, publik berhak berharap penerimaan pajak, royalti, dan devisa benar-benar kembali untuk layanan masyarakat.</p>

  <p>Namun risiko besarnya juga jelas. Jalur ekspor yang terlalu terpusat bisa berubah menjadi ruang kuasa baru bila tata kelolanya tidak transparan. Apalagi mekanisme ini disebut akan berada di bawah ekosistem Danantara, lembaga investasi negara yang sejak awal memegang aset dan mandat besar. Di titik ini, pertanyaan publik bukan hanya apakah kebijakan ini bisa menambah penerimaan, tetapi siapa yang mengawasi keputusan harga, akses eksportir, dan potensi konflik kepentingan di dalamnya.</p>

  <p>Public Voice melihat isu ini sebagai ujian awal antara nasionalisme ekonomi dan akuntabilitas. Negara boleh lebih tegas terhadap kebocoran sumber daya alam, tetapi ketegasan itu harus ditemani data terbuka, audit independen, dan laporan berkala yang mudah dibaca publik. Tanpa itu, agenda anti-kebocoran bisa kehilangan legitimasi karena publik hanya diminta percaya, bukan diberi alat untuk memeriksa.</p>

  <p><strong>Sumber:</strong> <a href="https://www.theaustralian.com.au/world/indonesian-government-takes-over-export-of-key-commodities/news-story/6adde0e26e23774710e93bcded44e872" target="_blank" rel="noopener noreferrer">The Australian</a> dan <a href="https://setneg.go.id/baca/index/presiden_prabowo_paparkan_arsitektur_apbn_2026_perkuat_pangan_energi_ekonomi_dan_pertahanan" target="_blank" rel="noopener noreferrer">Kementerian Sekretariat Negara RI</a>.</p>$$,
  '2026-06-22T12:00:00+07:00',
  'Mamen Public Voice',
  'published',
  'Prabowo Ambil Alih Ekspor Komoditas Kunci Lewat Danantara',
  'Ringkasan politik Public Voice tentang rencana pemerintah mengatur ekspor sawit, batu bara, dan ferroalloy melalui kanal negara di bawah ekosistem Danantara.',
  ARRAY['public voice', 'politik', 'prabowo', 'danantara', 'ekspor', 'komoditas'],
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
