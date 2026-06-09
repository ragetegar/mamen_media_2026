-- Replace demo editorial content with a sourced 2026 Jakarta concert calendar.
-- User accounts, profiles, newsletter subscribers, and the brand catalog are preserved.

DELETE FROM public.affiliate_clicks;
DELETE FROM public.articles;
DELETE FROM public.concerts;

INSERT INTO public.concerts (
  slug, title, concert_type, start_datetime, end_datetime, venue, city,
  poster_image, ticket_url, genre_tags, description, interested_count, created_at, updated_at
)
VALUES
  (
    'jakarta-fair-music-concert-2026',
    'Jakarta Fair Music Concert 2026',
    'festival',
    '2026-06-11T19:00:00+07:00',
    '2026-07-12T23:00:00+07:00',
    'JIExpo Kemayoran',
    'Jakarta',
    'https://picsum.photos/seed/jakarta-fair-2026/600/800',
    'https://www.jakartafair.co.id/page/music-concert',
    ARRAY['Festival', 'Indonesian Music', 'Multi-genre'],
    'Rangkaian konser musik Jakarta Fair Kemayoran 2026 berlangsung 11 Juni-12 Juli di JIExpo. Jadwal artis harian mengikuti situs resmi Jakarta Fair.',
    0,
    NOW(),
    NOW()
  ),
  (
    'pesta-warna-nada-2026',
    'Pesta Warna Nada 2026',
    'festival',
    '2026-06-13T15:00:00+07:00',
    '2026-06-14T23:00:00+07:00',
    'Ex Hanggar Teras Pancoran',
    'Jakarta',
    'https://picsum.photos/seed/pesta-warna-nada-2026/600/800',
    'https://pestawarnanada.com/',
    ARRAY['Festival', 'Pop', 'Indie'],
    'Festival musik dua hari pada 13-14 Juni 2026 di Ex Hanggar Teras Pancoran. Tanggal dan venue terverifikasi; waktu tampil final mengikuti kanal resmi acara.',
    0,
    NOW(),
    NOW()
  ),
  (
    'allo-bank-festival-2026',
    'Allo Bank Festival 2026',
    'festival',
    '2026-06-20T19:00:00+07:00',
    NULL,
    'Indonesia Arena',
    'Jakarta',
    'https://picsum.photos/seed/allo-bank-festival-2026/600/800',
    'https://event.detik.com/779/allo-bank-festival-2026',
    ARRAY['Festival', 'K-Pop', 'Pop'],
    'Allo Bank Festival 2026 berlangsung pada 20 Juni 2026 di Indonesia Arena, menampilkan CORTIS dan deretan musisi Indonesia. Showtime final mengikuti penyelenggara.',
    0,
    NOW(),
    NOW()
  ),
  (
    'kard-drift-world-tour-jakarta-2026',
    'KARD 2026 WORLD TOUR DRIFT in Jakarta',
    'kpop',
    '2026-06-27T19:30:00+07:00',
    NULL,
    'Basket Hall GBK Senayan',
    'Jakarta',
    'https://picsum.photos/seed/kard-drift-jakarta-2026/600/800',
    'https://kard2026jakarta.com/',
    ARRAY['K-Pop', 'KARD'],
    'KARD membawa tur dunia DRIFT ke Basket Hall GBK Senayan pada 27 Juni 2026 pukul 19.30 WIB.',
    0,
    NOW(),
    NOW()
  ),
  (
    'win-metawin-fancon-jakarta-2026',
    'Win Metawin FANCON IN JAKARTA 2026',
    'international',
    '2026-08-01T19:00:00+07:00',
    NULL,
    'Balai Kartini',
    'Jakarta',
    'https://winmetawinjakarta2026.com/images/banner/banner-desktop.png',
    'https://winmetawinjakarta2026.com/',
    ARRAY['Fancon', 'Thai Pop'],
    'Win Metawin kembali ke Jakarta untuk fan concert pada 1 Agustus 2026 pukul 19.00 WIB di Balai Kartini.',
    0,
    NOW(),
    NOW()
  ),
  (
    'the-sounds-project-vol-9-2026',
    'The Sounds Project Vol. 9',
    'festival',
    '2026-08-07T13:00:00+07:00',
    '2026-08-09T23:00:00+07:00',
    'Ecopark Ancol',
    'Jakarta',
    'https://picsum.photos/seed/the-sounds-project-vol-9/600/800',
    'https://thesoundsproject.com/',
    ARRAY['Festival', 'Indie', 'Pop', 'Rock'],
    'The Sounds Project Vol. 9 kembali selama tiga hari, 7-9 Agustus 2026, di Ecopark Ancol. Waktu panggung final mengikuti rundown resmi.',
    0,
    NOW(),
    NOW()
  ),
  (
    'leehi-only-jakarta-2026',
    'LEEHI - ONLY Jakarta 2026',
    'kpop',
    '2026-08-09T20:00:00+07:00',
    NULL,
    'The Bengkel Space SCBD',
    'Jakarta',
    'https://picsum.photos/seed/leehi-only-jakarta-2026/600/800',
    'https://leehi-jakarta.com/',
    ARRAY['K-Pop', 'R&B', 'LEEHI'],
    'LEEHI tampil di The Bengkel Space SCBD pada Minggu, 9 Agustus 2026 pukul 20.00 WIB.',
    0,
    NOW(),
    NOW()
  ),
  (
    'ikon-live-jakarta-2026',
    'iKON LIVE in Jakarta 2026',
    'kpop',
    '2026-08-21T20:00:00+07:00',
    NULL,
    'Istora Senayan',
    'Jakarta',
    'https://picsum.photos/seed/ikon-jakarta-2026/600/800',
    'https://ikonjakarta2026.vercel.app/',
    ARRAY['K-Pop', 'iKON'],
    'iKON dijadwalkan tampil pada Jumat, 21 Agustus 2026 pukul 20.00 WIB di Istora Senayan.',
    0,
    NOW(),
    NOW()
  ),
  (
    'lalala-festival-2026',
    'LaLaLa Festival 2026',
    'festival',
    '2026-08-22T13:00:00+07:00',
    '2026-08-23T23:00:00+07:00',
    'JIExpo Kemayoran',
    'Jakarta',
    'https://picsum.photos/seed/lalala-festival-2026/600/800',
    'https://lalalafest.com/',
    ARRAY['Festival', 'International', 'Pop', 'Indie'],
    'LaLaLa Festival 2026 berlangsung 22-23 Agustus di Jakarta International Expo. Rundown dan jam tampil final mengikuti kanal resmi.',
    0,
    NOW(),
    NOW()
  ),
  (
    'avenged-sevenfold-jakarta-2026',
    'Avenged Sevenfold Live in Jakarta 2026',
    'international',
    '2026-10-10T19:00:00+07:00',
    NULL,
    'Jakarta International Stadium',
    'Jakarta',
    'https://a7xindonesia.com/wp-content/uploads/2026/05/G4eZkBkaEAAVn0y.jpg',
    'https://a7xindonesia.com/',
    ARRAY['Metal', 'Rock', 'Avenged Sevenfold'],
    'Avenged Sevenfold kembali ke Jakarta pada 10 Oktober 2026 di Jakarta International Stadium. Showtime final mengikuti promotor.',
    0,
    NOW(),
    NOW()
  ),
  (
    'lany-soft-world-tour-jakarta-2026',
    'LANY Soft World Tour Jakarta 2026',
    'international',
    '2026-10-29T19:00:00+07:00',
    '2026-10-30T23:00:00+07:00',
    'Indonesia Arena',
    'Jakarta',
    'https://lanyinjakarta.com/image/banner-lany.jpg',
    'https://lanyinjakarta.com/',
    ARRAY['Pop', 'Alternative', 'LANY'],
    'LANY membawa Soft World Tour ke Indonesia Arena pada 29-30 Oktober 2026. Situs resmi menandai pertunjukan hari kedua sold out.',
    0,
    NOW(),
    NOW()
  ),
  (
    'bts-world-tour-jakarta-2026',
    'BTS WORLD TOUR Jakarta 2026',
    'kpop',
    '2026-12-26T19:00:00+07:00',
    '2026-12-27T23:00:00+07:00',
    'Gelora Bung Karno Stadium',
    'Jakarta',
    'https://concerts.weverse.io/events/bts_tour/img/poster-CcxS4ZKk.webp',
    'https://concerts.weverse.io/events/bts_tour',
    ARRAY['K-Pop', 'BTS'],
    'Jadwal resmi BTS WORLD TOUR mencantumkan Jakarta pada 26-27 Desember 2026 di Gelora Bung Karno Stadium. Showtime final mengikuti Weverse.',
    0,
    NOW(),
    NOW()
  );

INSERT INTO public.articles (
  slug, title, category, subcategory, cover_image, excerpt, body_html,
  published_at, author, status, seo_title, seo_description, tags, created_at, updated_at
)
VALUES
  (
    'kalender-konser-jakarta-2026-juni-desember',
    'Kalender Konser Jakarta 2026: Dari Jakarta Fair sampai BTS',
    'concerts',
    'news',
    'https://picsum.photos/seed/kalender-konser-jakarta-2026/1200/675',
    'Daftar konser dan festival Jakarta yang sudah diumumkan untuk Juni-Desember 2026, lengkap dengan venue dan tautan resmi.',
    $$<p>Jakarta memasuki paruh kedua 2026 dengan kalender konser yang padat. Mulai dari festival lokal, fan concert, sampai stadium show, semuanya sudah punya tanggal dan venue yang bisa diverifikasi.</p>
    <h2>Agenda utama</h2>
    <p>Jakarta Fair Music Concert membuka rangkaian pada 11 Juni. Setelah itu ada Pesta Warna Nada, Allo Bank Festival, KARD, The Sounds Project, LEEHI, iKON, LaLaLa Festival, Avenged Sevenfold, LANY, dan BTS.</p>
    <p>Selalu cek kembali jam tampil, kategori tiket, dan aturan masuk melalui tautan resmi di halaman konser masing-masing. MAMEN tidak mengarang angka minat; setelah reset, angka interested dimulai dari nol dan akan bertambah dari pengguna MAMEN.</p>
    <p>Sumber: <a href="https://www.jakartafair.co.id/page/music-concert">Jakarta Fair</a>, <a href="https://concerts.weverse.io/events/bts_tour">Weverse</a>, dan situs resmi setiap acara.</p>$$,
    '2026-06-08T12:00:00+07:00',
    'Mamen Editorial',
    'published',
    'Kalender Konser Jakarta 2026 Juni-Desember',
    'Konser dan festival terverifikasi di Jakarta sepanjang paruh kedua 2026.',
    ARRAY['jakarta', 'konser 2026', 'festival', 'calendar'],
    NOW(),
    NOW()
  ),
  (
    'bts-world-tour-jakarta-2026-tanggal-venue',
    'BTS WORLD TOUR Jakarta 2026: Tanggal dan Venue Resmi',
    'music',
    'kpop',
    'https://concerts.weverse.io/events/bts_tour/img/poster-CcxS4ZKk.webp',
    'Weverse mencantumkan Jakarta sebagai pemberhentian BTS WORLD TOUR pada 26-27 Desember 2026 di GBK.',
    $$<p>BTS WORLD TOUR resmi mencantumkan Jakarta untuk dua malam, 26 dan 27 Desember 2026, di Gelora Bung Karno Stadium.</p>
    <h2>Yang sudah terkonfirmasi</h2>
    <p>Tanggal dan venue tercantum pada jadwal tur resmi Weverse. Detail penjualan tiket, kategori, dan showtime perlu mengikuti pembaruan resmi berikutnya.</p>
    <p>Sumber: <a href="https://concerts.weverse.io/events/bts_tour">BTS WORLD TOUR di Weverse</a>.</p>$$,
    '2026-06-08T11:00:00+07:00',
    'Mamen Music',
    'published',
    'BTS Jakarta 2026 Tanggal dan Venue Resmi',
    'Informasi resmi BTS WORLD TOUR Jakarta 26-27 Desember 2026.',
    ARRAY['bts', 'kpop', 'gbk', 'jakarta'],
    NOW(),
    NOW()
  ),
  (
    'lany-jakarta-2026-day-2-sold-out',
    'LANY Jakarta 2026 Tambah Hari Kedua, Day 2 Sold Out',
    'music',
    'news',
    'https://lanyinjakarta.com/image/banner-lany.jpg',
    'LANY akan tampil dua malam di Indonesia Arena pada 29-30 Oktober 2026.',
    $$<p>LANY membawa Soft World Tour ke Indonesia Arena, Jakarta, pada 29 dan 30 Oktober 2026.</p>
    <p>Situs resmi konser menandai pertunjukan 30 Oktober sebagai sold out. Itu adalah sinyal minat publik yang nyata, tetapi MAMEN tetap memulai penghitung interested dari nol agar angka di aplikasi berasal dari pengguna MAMEN.</p>
    <p>Sumber dan tiket: <a href="https://lanyinjakarta.com/">LANY in Jakarta</a>.</p>$$,
    '2026-06-08T10:00:00+07:00',
    'Mamen Music',
    'published',
    'LANY Jakarta 2026 Indonesia Arena',
    'LANY Soft World Tour Jakarta berlangsung 29-30 Oktober 2026.',
    ARRAY['lany', 'international', 'indonesia arena'],
    NOW(),
    NOW()
  ),
  (
    'avenged-sevenfold-jakarta-2026-jis',
    'Avenged Sevenfold Kembali ke Jakarta Oktober 2026',
    'music',
    'news',
    'https://a7xindonesia.com/wp-content/uploads/2026/05/G4eZkBkaEAAVn0y.jpg',
    'Avenged Sevenfold dijadwalkan tampil di Jakarta International Stadium pada 10 Oktober 2026.',
    $$<p>Avenged Sevenfold kembali ke Indonesia untuk konser di Jakarta International Stadium pada 10 Oktober 2026.</p>
    <p>Karena detail showtime bisa berubah, gunakan laman promotor sebagai rujukan terakhir sebelum berangkat.</p>
    <p>Sumber dan tiket: <a href="https://a7xindonesia.com/">Avenged Sevenfold Indonesia</a>.</p>$$,
    '2026-06-08T09:00:00+07:00',
    'Mamen Music',
    'published',
    'Avenged Sevenfold Jakarta 2026 JIS',
    'Konser Avenged Sevenfold Jakarta pada 10 Oktober 2026.',
    ARRAY['avenged sevenfold', 'metal', 'jis'],
    NOW(),
    NOW()
  ),
  (
    'jakarta-fair-2026-konser-musik-guide',
    'Jakarta Fair 2026: Panduan Konser Musik Sebulan Penuh',
    'concerts',
    'news',
    'https://picsum.photos/seed/jakarta-fair-guide-2026/1200/675',
    'Jakarta Fair berlangsung 11 Juni-12 Juli 2026 dengan jadwal konser harian di JIExpo Kemayoran.',
    $$<p>Jakarta Fair Kemayoran 2026 berlangsung dari 11 Juni sampai 12 Juli di JIExpo Kemayoran.</p>
    <h2>Cek jadwal harian</h2>
    <p>Lineup dan jam tampil berbeda setiap hari. Gunakan halaman konser resmi untuk memilih tanggal kedatangan dan mengecek perubahan jadwal.</p>
    <p>Sumber: <a href="https://www.jakartafair.co.id/page/music-concert">Jakarta Fair Music Concert</a>.</p>$$,
    '2026-06-07T15:00:00+07:00',
    'Mamen Editorial',
    'published',
    'Jakarta Fair 2026 Konser Musik',
    'Panduan jadwal konser Jakarta Fair Kemayoran 2026.',
    ARRAY['jakarta fair', 'jiexpo', 'festival'],
    NOW(),
    NOW()
  ),
  (
    'pesta-warna-nada-2026-guide',
    'Pesta Warna Nada 2026: Festival Dua Hari di Pancoran',
    'concerts',
    'news',
    'https://picsum.photos/seed/pesta-warna-nada-guide/1200/675',
    'Pesta Warna Nada kembali pada 13-14 Juni 2026 di Ex Hanggar Teras Pancoran.',
    $$<p>Pesta Warna Nada 2026 berlangsung selama dua hari, 13-14 Juni, di Ex Hanggar Teras Pancoran.</p>
    <p>Pastikan mengecek lineup, rundown, aturan masuk, dan ketersediaan tiket langsung dari situs resmi.</p>
    <p>Sumber: <a href="https://pestawarnanada.com/">Pesta Warna Nada</a>.</p>$$,
    '2026-06-07T14:00:00+07:00',
    'Mamen Editorial',
    'published',
    'Pesta Warna Nada 2026 Jakarta',
    'Informasi Pesta Warna Nada 13-14 Juni 2026.',
    ARRAY['pesta warna nada', 'festival', 'pancoran'],
    NOW(),
    NOW()
  ),
  (
    'allo-bank-festival-2026-cortis',
    'Allo Bank Festival 2026 Hadirkan CORTIS di Indonesia Arena',
    'music',
    'kpop',
    'https://picsum.photos/seed/allo-bank-festival-cortis/1200/675',
    'Allo Bank Festival 2026 berlangsung pada 20 Juni di Indonesia Arena.',
    $$<p>Allo Bank Festival 2026 dijadwalkan berlangsung pada 20 Juni di Indonesia Arena, Jakarta.</p>
    <p>CORTIS menjadi salah satu nama internasional yang diumumkan bersama lineup musisi Indonesia.</p>
    <p>Sumber tiket: <a href="https://event.detik.com/779/allo-bank-festival-2026">detikEvent</a>.</p>$$,
    '2026-06-07T13:00:00+07:00',
    'Mamen Music',
    'published',
    'Allo Bank Festival 2026 CORTIS',
    'Allo Bank Festival 20 Juni 2026 di Indonesia Arena.',
    ARRAY['allo bank festival', 'cortis', 'indonesia arena'],
    NOW(),
    NOW()
  ),
  (
    'kard-drift-jakarta-2026-guide',
    'KARD DRIFT Jakarta 2026: Jadwal, Venue, dan Tiket',
    'music',
    'kpop',
    'https://picsum.photos/seed/kard-drift-guide-2026/1200/675',
    'KARD tampil di Basket Hall GBK pada 27 Juni 2026 pukul 19.30 WIB.',
    $$<p>KARD membawa 2026 WORLD TOUR DRIFT ke Jakarta pada 27 Juni 2026.</p>
    <p>Konser berlangsung pukul 19.30 WIB di Basket Hall GBK Senayan.</p>
    <p>Sumber tiket: <a href="https://kard2026jakarta.com/">KARD 2026 Jakarta</a>.</p>$$,
    '2026-06-07T12:00:00+07:00',
    'Mamen Music',
    'published',
    'KARD DRIFT Jakarta 2026',
    'Panduan konser KARD Jakarta 27 Juni 2026.',
    ARRAY['kard', 'kpop', 'basket hall gbk'],
    NOW(),
    NOW()
  ),
  (
    'the-sounds-project-vol-9-guide',
    'The Sounds Project Vol. 9 Kembali Tiga Hari di Ancol',
    'concerts',
    'news',
    'https://picsum.photos/seed/tsp-vol-9-guide/1200/675',
    'The Sounds Project Vol. 9 berlangsung 7-9 Agustus 2026 di Ecopark Ancol.',
    $$<p>The Sounds Project Vol. 9 kembali ke Ecopark Ancol selama tiga hari, 7-9 Agustus 2026.</p>
    <p>Festival ini menampilkan lineup lintas genre. Cek lineup dan rundown terbaru melalui kanal resmi sebelum membeli tiket.</p>
    <p>Sumber: <a href="https://thesoundsproject.com/">The Sounds Project</a>.</p>$$,
    '2026-06-06T15:00:00+07:00',
    'Mamen Editorial',
    'published',
    'The Sounds Project Vol 9 2026',
    'Informasi The Sounds Project Vol. 9 di Ecopark Ancol.',
    ARRAY['the sounds project', 'ancol', 'festival'],
    NOW(),
    NOW()
  ),
  (
    'leehi-only-jakarta-2026-guide',
    'LEEHI - ONLY Jakarta 2026: Konser Intim di SCBD',
    'music',
    'kpop',
    'https://picsum.photos/seed/leehi-only-guide/1200/675',
    'LEEHI tampil pada 9 Agustus 2026 pukul 20.00 WIB di The Bengkel Space SCBD.',
    $$<p>LEEHI akan menyapa Jakarta melalui pertunjukan ONLY pada Minggu, 9 Agustus 2026.</p>
    <p>Show dimulai pukul 20.00 WIB di The Bengkel Space SCBD.</p>
    <p>Sumber tiket: <a href="https://leehi-jakarta.com/">LEEHI Jakarta</a>.</p>$$,
    '2026-06-06T14:00:00+07:00',
    'Mamen Music',
    'published',
    'LEEHI Jakarta 2026',
    'Konser LEEHI ONLY Jakarta 9 Agustus 2026.',
    ARRAY['leehi', 'kpop', 'r&b', 'scbd'],
    NOW(),
    NOW()
  ),
  (
    'ikon-live-jakarta-2026-guide',
    'iKON LIVE Jakarta 2026: Jumat Malam di Istora',
    'music',
    'kpop',
    'https://picsum.photos/seed/ikon-live-guide/1200/675',
    'iKON dijadwalkan tampil pada 21 Agustus 2026 pukul 20.00 WIB di Istora Senayan.',
    $$<p>iKON LIVE in Jakarta dijadwalkan berlangsung Jumat, 21 Agustus 2026 pukul 20.00 WIB.</p>
    <p>Venue yang diumumkan adalah Istora Senayan. Cek detail tiket dan kebijakan masuk melalui halaman acara.</p>
    <p>Sumber: <a href="https://ikonjakarta2026.vercel.app/">iKON Jakarta 2026</a>.</p>$$,
    '2026-06-06T13:00:00+07:00',
    'Mamen Music',
    'published',
    'iKON Jakarta 2026 Istora Senayan',
    'Jadwal iKON LIVE in Jakarta 21 Agustus 2026.',
    ARRAY['ikon', 'kpop', 'istora senayan'],
    NOW(),
    NOW()
  ),
  (
    'lalala-festival-2026-jiexpo-guide',
    'LaLaLa Festival 2026 Pindah ke JIExpo Jakarta',
    'concerts',
    'news',
    'https://picsum.photos/seed/lalala-festival-guide/1200/675',
    'LaLaLa Festival berlangsung 22-23 Agustus 2026 di JIExpo Kemayoran.',
    $$<p>LaLaLa Festival 2026 berlangsung pada 22-23 Agustus di Jakarta International Expo.</p>
    <p>Festival ini membawa lineup internasional dan lokal ke venue yang lebih mudah dijangkau dari pusat Jakarta.</p>
    <p>Sumber: <a href="https://lalalafest.com/">LaLaLa Festival</a>.</p>$$,
    '2026-06-06T12:00:00+07:00',
    'Mamen Editorial',
    'published',
    'LaLaLa Festival 2026 JIExpo',
    'Informasi LaLaLa Festival Jakarta 22-23 Agustus 2026.',
    ARRAY['lalala festival', 'jiexpo', 'festival'],
    NOW(),
    NOW()
  ),
  (
    'starter-pack-nonton-konser-jakarta-2026',
    'Starter Pack Nonton Konser Jakarta 2026',
    'music',
    'merch',
    'https://picsum.photos/seed/concert-starter-pack-2026/1200/675',
    'Daftar barang praktis untuk festival outdoor, arena show, dan konser stadion di Jakarta.',
    $$<p>Kalender konser Jakarta 2026 mencakup festival outdoor, arena show, dan konser stadion. Persiapan yang tepat membuat pengalaman lebih nyaman.</p>
    <h2>Barang penting</h2>
    <p>Bawa earplug, power bank, jas hujan ringkas, botol minum sesuai aturan venue, serta sepatu nyaman. Selalu baca daftar barang terlarang dari promotor.</p>
    <p>Produk di bawah memakai tautan affiliate dummy untuk pengujian CMS dan redirect.</p>$$,
    '2026-06-05T15:00:00+07:00',
    'Mamen Lifestyle',
    'published',
    'Starter Pack Konser Jakarta 2026',
    'Perlengkapan praktis untuk nonton konser di Jakarta.',
    ARRAY['concert essentials', 'lifestyle', 'affiliate'],
    NOW(),
    NOW()
  );

UPDATE public.articles
SET linked_concert_ids = ARRAY(SELECT id FROM public.concerts)
WHERE slug = 'kalender-konser-jakarta-2026-juni-desember';

UPDATE public.articles
SET linked_concert_ids = ARRAY(
  SELECT id FROM public.concerts WHERE slug = 'bts-world-tour-jakarta-2026'
)
WHERE slug = 'bts-world-tour-jakarta-2026-tanggal-venue';

UPDATE public.articles
SET linked_concert_ids = ARRAY(
  SELECT id FROM public.concerts WHERE slug = 'lany-soft-world-tour-jakarta-2026'
)
WHERE slug = 'lany-jakarta-2026-day-2-sold-out';

UPDATE public.articles
SET linked_concert_ids = ARRAY(
  SELECT id FROM public.concerts WHERE slug = 'avenged-sevenfold-jakarta-2026'
)
WHERE slug = 'avenged-sevenfold-jakarta-2026-jis';

WITH links(article_slug, concert_slug) AS (
  VALUES
    ('jakarta-fair-2026-konser-musik-guide', 'jakarta-fair-music-concert-2026'),
    ('pesta-warna-nada-2026-guide', 'pesta-warna-nada-2026'),
    ('allo-bank-festival-2026-cortis', 'allo-bank-festival-2026'),
    ('kard-drift-jakarta-2026-guide', 'kard-drift-world-tour-jakarta-2026'),
    ('the-sounds-project-vol-9-guide', 'the-sounds-project-vol-9-2026'),
    ('leehi-only-jakarta-2026-guide', 'leehi-only-jakarta-2026'),
    ('ikon-live-jakarta-2026-guide', 'ikon-live-jakarta-2026'),
    ('lalala-festival-2026-jiexpo-guide', 'lalala-festival-2026')
)
UPDATE public.articles article
SET linked_concert_ids = ARRAY[concert.id]
FROM links
JOIN public.concerts concert ON concert.slug = links.concert_slug
WHERE article.slug = links.article_slug;

UPDATE public.articles
SET linked_concert_ids = ARRAY(
  SELECT id FROM public.concerts WHERE slug IN (
    'jakarta-fair-music-concert-2026',
    'pesta-warna-nada-2026',
    'allo-bank-festival-2026',
    'kard-drift-world-tour-jakarta-2026',
    'the-sounds-project-vol-9-2026',
    'leehi-only-jakarta-2026',
    'ikon-live-jakarta-2026',
    'lalala-festival-2026'
  )
)
WHERE slug = 'starter-pack-nonton-konser-jakarta-2026';

INSERT INTO public.featured_brands (name, normalized_name, image, link, sort_order, is_active)
VALUES
  ('Loop', 'loop', '', '/', 0, false),
  ('Anker', 'anker', '', '/', 0, false),
  ('Uniqlo', 'uniqlo', '', '/', 0, false),
  ('Hydro Flask', 'hydro flask', '', '/', 0, false)
ON CONFLICT (normalized_name) DO NOTHING;

INSERT INTO public.article_products (
  article_id, brand_id, merchant, title, image, price_display, affiliate_url, sort_order
)
VALUES
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'loop'),
    'shopee',
    'Loop Experience 2 Earplugs',
    'https://picsum.photos/seed/loop-experience-2/400/400',
    'Rp 499.000',
    'https://example.com/affiliate/loop-experience-2',
    1
  ),
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'anker'),
    'tokopedia',
    'Anker PowerCore Power Bank',
    'https://picsum.photos/seed/anker-powercore/400/400',
    'Rp 599.000',
    'https://example.com/affiliate/anker-powercore',
    2
  ),
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'adidas'),
    'shopee',
    'Adidas Ultraboost Walking Shoes',
    'https://picsum.photos/seed/adidas-ultraboost-concert/400/400',
    'Rp 2.400.000',
    'https://example.com/affiliate/adidas-ultraboost',
    3
  ),
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'nike'),
    'tokopedia',
    'Nike Crossbody Festival Bag',
    'https://picsum.photos/seed/nike-crossbody-festival/400/400',
    'Rp 449.000',
    'https://example.com/affiliate/nike-crossbody',
    4
  ),
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'uniqlo'),
    'shopee',
    'Uniqlo Pocketable Parka',
    'https://picsum.photos/seed/uniqlo-pocketable-parka/400/400',
    'Rp 599.000',
    'https://example.com/affiliate/uniqlo-parka',
    5
  ),
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'jbl'),
    'tokopedia',
    'JBL Tune Wireless Earbuds',
    'https://picsum.photos/seed/jbl-tune-concert/400/400',
    'Rp 899.000',
    'https://example.com/affiliate/jbl-tune',
    6
  ),
  (
    (SELECT id FROM public.articles WHERE slug = 'starter-pack-nonton-konser-jakarta-2026'),
    (SELECT id FROM public.featured_brands WHERE normalized_name = 'hydro flask'),
    'shopee',
    'Hydro Flask Reusable Bottle',
    'https://picsum.photos/seed/hydro-flask-concert/400/400',
    'Rp 699.000',
    'https://example.com/affiliate/hydro-flask',
    7
  );
