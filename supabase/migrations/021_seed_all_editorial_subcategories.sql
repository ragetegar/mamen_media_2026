-- Add one published editorial article to every currently empty submenu.
INSERT INTO public.articles (
  slug, title, category, subcategory, cover_image, excerpt, body_html,
  published_at, author, status, seo_title, seo_description, tags, linked_concert_ids,
  created_at, updated_at
)
VALUES
  (
    'cara-mendengarkan-album-baru-secara-utuh',
    'Cara Mendengarkan Album Baru Secara Utuh di Era Playlist',
    'music',
    'review',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943487/mamen/concerts/2026/leehi-only-jakarta-2026.jpg',
    'Panduan menikmati album sebagai satu karya lengkap, bukan sekadar kumpulan single.',
    $$<p>Playlist membuat penemuan musik terasa cepat, tetapi sebuah album biasanya dirancang sebagai perjalanan yang utuh. Urutan lagu, jeda, dan perubahan suasana merupakan bagian dari ceritanya.</p>
    <h2>Mulai tanpa shuffle</h2>
    <p>Dengarkan album dari lagu pertama sampai terakhir tanpa shuffle. Catat lagu yang langsung menonjol, lalu perhatikan bagaimana lagu tersebut berhubungan dengan track sebelum dan sesudahnya.</p>
    <h2>Ulangi dengan konteks</h2>
    <p>Pada putaran kedua, baca kredit penulis, produser, dan musisi pendukung. Detail itu membantu menjelaskan kenapa warna suara atau lirik berubah sepanjang album.</p>
    <h2>Beri waktu</h2>
    <p>Review yang jujur tidak harus lahir setelah satu kali dengar. Beberapa album membutuhkan waktu sebelum hook, lirik, dan produksinya terasa menyatu.</p>$$,
    '2026-06-09T10:00:00+07:00',
    'Mamen Music',
    'published',
    'Cara Mendengarkan dan Mereview Album Baru',
    'Panduan menikmati dan menilai album baru secara utuh di era playlist.',
    ARRAY['album review', 'music listening', 'playlist'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'merch-konser-yang-benar-benar-berguna',
    'Merch Konser yang Benar-Benar Berguna Setelah Show Selesai',
    'music',
    'merch',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943546/mamen/concerts/2026/lany-soft-world-tour-jakarta-2026.svg',
    'Cara memilih merchandise konser yang tetap terpakai setelah euforia malam pertunjukan selesai.',
    $$<p>Merchandise adalah cara membawa pulang memori konser, tetapi tidak semuanya perlu dibeli. Pilihan terbaik adalah barang yang punya nilai sentimental sekaligus benar-benar bisa dipakai.</p>
    <h2>Tentukan anggaran sebelum masuk venue</h2>
    <p>Harga merch resmi dapat mengambil porsi besar dari anggaran konser. Tentukan batas belanja dan prioritaskan satu barang utama sebelum melihat booth.</p>
    <h2>Pilih yang sesuai kebiasaan</h2>
    <p>Kaos, tote bag, topi, dan poster punya fungsi berbeda. Pilih berdasarkan barang yang memang sering kamu gunakan, bukan hanya karena desainnya sedang ramai.</p>
    <h2>Periksa detail produk</h2>
    <p>Cek ukuran, bahan, kualitas cetak, dan aturan penukaran. Simpan bukti pembelian jika booth menyediakan kebijakan penggantian barang cacat.</p>$$,
    '2026-06-09T09:30:00+07:00',
    'Mamen Music',
    'published',
    'Panduan Memilih Merch Konser',
    'Tips memilih merchandise konser yang berguna dan sesuai anggaran.',
    ARRAY['merch', 'concert merch', 'shopping guide'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'rotasi-sneaker-nyaman-untuk-konser',
    'Rotasi Sneaker Nyaman untuk Festival dan Konser Arena',
    'lifestyle',
    'sneaker',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943485/mamen/concerts/2026/kard-drift-world-tour-jakarta-2026.jpg',
    'Memilih sneaker untuk berdiri lama, berjalan jauh, dan tetap nyaman sampai encore.',
    $$<p>Sepatu konser bukan hanya bagian dari outfit. Kamu mungkin berdiri berjam-jam, berjalan dari transportasi umum, dan melewati permukaan venue yang berubah-ubah.</p>
    <h2>Utamakan sepatu yang sudah teruji</h2>
    <p>Jangan memakai sneaker baru langsung ke festival. Gunakan lebih dulu beberapa kali agar kamu tahu titik tekanan dan daya tahannya.</p>
    <h2>Sesuaikan dengan venue</h2>
    <p>Untuk festival outdoor, pilih outsole dengan grip baik dan material yang mudah dibersihkan. Untuk arena indoor, cushioning dan sirkulasi udara bisa menjadi prioritas.</p>
    <h2>Siapkan rotasi</h2>
    <p>Jika menghadiri beberapa acara berdekatan, berganti pasangan sepatu membantu midsole kembali ke bentuk semula dan memberi kaki waktu beradaptasi.</p>$$,
    '2026-06-09T09:00:00+07:00',
    'Mamen Lifestyle',
    'published',
    'Sneaker Nyaman untuk Konser dan Festival',
    'Panduan memilih dan merotasi sneaker nyaman untuk konser.',
    ARRAY['sneaker', 'concert outfit', 'festival'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'jaga-pendengaran-tanpa-kehilangan-vibe',
    'Jaga Pendengaran Tanpa Kehilangan Vibe Konser',
    'lifestyle',
    'health',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943489/mamen/concerts/2026/avenged-sevenfold-jakarta-2026.webp',
    'Kebiasaan sederhana untuk mengurangi kelelahan telinga sebelum, selama, dan setelah konser.',
    $$<p>Volume konser dapat membuat telinga terasa lelah, terutama setelah berada dekat speaker dalam waktu lama. Perlindungan pendengaran membantu kamu menikmati lebih banyak pertunjukan dalam jangka panjang.</p>
    <h2>Gunakan earplug konser</h2>
    <p>Earplug khusus musik menurunkan level suara tanpa membuat detail pertunjukan hilang sepenuhnya. Pastikan ukurannya nyaman sebelum hari acara.</p>
    <h2>Ambil jeda dari area keras</h2>
    <p>Jika telinga mulai berdenging atau terasa penuh, berpindahlah ke area yang lebih tenang. Hindari berdiri tepat di depan speaker sepanjang show.</p>
    <h2>Berikan waktu pemulihan</h2>
    <p>Setelah konser, kurangi penggunaan headphone dengan volume tinggi. Jika gangguan pendengaran menetap, cari bantuan tenaga kesehatan profesional.</p>$$,
    '2026-06-09T08:30:00+07:00',
    'Mamen Lifestyle',
    'published',
    'Cara Menjaga Pendengaran Saat Konser',
    'Tips sederhana menjaga kesehatan pendengaran saat menonton konser.',
    ARRAY['hearing health', 'concert safety', 'earplug'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'ritual-matchday-suporter-sepak-bola',
    'Ritual Matchday: Menikmati Sepak Bola dari Tribun sampai Nobar',
    'sports',
    'football',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943484/mamen/concerts/2026/jakarta-fair-music-concert-2026.jpg',
    'Matchday adalah pengalaman komunitas yang dimulai jauh sebelum peluit pertama.',
    $$<p>Sepak bola hidup dari ritme pertandingan dan komunitas di sekitarnya. Pengalaman matchday dapat terasa kuat baik dari tribun stadion maupun layar nobar.</p>
    <h2>Datang dengan persiapan</h2>
    <p>Periksa jadwal, akses transportasi, aturan venue, dan kondisi cuaca. Datang lebih awal memberi waktu untuk bertemu komunitas dan menghindari antrean panjang.</p>
    <h2>Hormati ruang bersama</h2>
    <p>Dukung tim dengan lantang tanpa mengganggu keselamatan penonton lain. Ikuti instruksi penyelenggara dan jaga area tetap nyaman untuk semua.</p>
    <h2>Nikmati cerita pertandingan</h2>
    <p>Selain skor akhir, perhatikan perubahan taktik, momentum, dan reaksi tribun. Detail-detail itu membuat setiap matchday punya cerita sendiri.</p>$$,
    '2026-06-09T08:00:00+07:00',
    'Mamen Sports',
    'published',
    'Panduan Menikmati Matchday Sepak Bola',
    'Panduan menikmati pengalaman matchday sepak bola dari stadion sampai nobar.',
    ARRAY['football', 'matchday', 'supporter'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'basketball-pickup-game-untuk-pemula',
    'Pickup Basketball untuk Pemula: Datang, Main, dan Jadi Teman Satu Tim',
    'sports',
    'basketball',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943416/mamen/concerts/2026/allo-bank-festival-2026.jpg',
    'Etika dasar dan persiapan sederhana sebelum bergabung dalam pickup game.',
    $$<p>Pickup basketball adalah salah satu cara termudah untuk bertemu pemain baru. Kamu tidak perlu menjadi pemain kompetitif, tetapi perlu memahami ritme dan etika permainan bersama.</p>
    <h2>Bawa perlengkapan dasar</h2>
    <p>Gunakan sepatu basket yang nyaman, bawa air minum, dan lakukan pemanasan. Datang lebih awal membantu kamu mengenal aturan lapangan setempat.</p>
    <h2>Komunikasi lebih penting dari highlight</h2>
    <p>Panggil screen, beri tahu saat melakukan switch, dan oper bola kepada rekan yang terbuka. Pemain yang komunikatif selalu menyenangkan untuk diajak satu tim.</p>
    <h2>Hormati rotasi permainan</h2>
    <p>Setiap lapangan punya sistem antrean dan format skor berbeda. Tanyakan sebelum bermain dan terima hasil pertandingan dengan sportif.</p>$$,
    '2026-06-09T07:30:00+07:00',
    'Mamen Sports',
    'published',
    'Panduan Pickup Basketball untuk Pemula',
    'Etika dan persiapan bergabung dalam pickup basketball.',
    ARRAY['basketball', 'pickup game', 'community'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'cara-menonton-turnamen-esports',
    'Cara Menonton Turnamen Esports Tanpa Bingung',
    'sports',
    'esports',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943563/mamen/concerts/2026/bts-world-tour-jakarta-2026.svg',
    'Panduan memahami format, draft, momentum, dan cerita tim dalam turnamen esports.',
    $$<p>Turnamen esports bisa terasa rumit saat pertama kali ditonton. Format pertandingan, istilah permainan, dan banyaknya tim membuat penonton baru mudah kehilangan konteks.</p>
    <h2>Pelajari tujuan utama permainan</h2>
    <p>Kamu tidak harus menghafal semua mekanik. Mulailah dari cara tim menang, fungsi tiap peran, dan indikator keunggulan yang paling sering dibahas caster.</p>
    <h2>Ikuti satu tim atau pemain</h2>
    <p>Memilih satu tim membuat bracket lebih mudah diikuti. Perhatikan gaya bermain, perubahan roster, dan rivalitas yang membentuk cerita turnamen.</p>
    <h2>Gunakan desk analysis</h2>
    <p>Segmen sebelum dan setelah pertandingan biasanya menjelaskan draft, strategi, dan momen penting dengan bahasa yang lebih mudah dipahami.</p>$$,
    '2026-06-09T07:00:00+07:00',
    'Mamen Sports',
    'published',
    'Panduan Menonton Turnamen Esports',
    'Cara memahami format dan cerita turnamen esports untuk penonton baru.',
    ARRAY['esports', 'tournament', 'watch guide'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'memilih-game-coop-untuk-mabar',
    'Memilih Game Co-op yang Tidak Bikin Mabar Berantakan',
    'hobbies',
    'gaming',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943420/mamen/concerts/2026/the-sounds-project-vol-9-2026.jpg',
    'Cara memilih game bersama berdasarkan waktu, jumlah pemain, dan gaya komunikasi grup.',
    $$<p>Game co-op terbaik bukan selalu game dengan ulasan tertinggi. Pilihan yang tepat adalah game yang cocok dengan jadwal, kemampuan, dan selera seluruh grup.</p>
    <h2>Samakan ekspektasi waktu</h2>
    <p>Game dengan sesi singkat cocok untuk grup yang sulit menyamakan jadwal. Campaign panjang lebih cocok jika semua pemain siap berkomitmen secara rutin.</p>
    <h2>Perhatikan tingkat stres</h2>
    <p>Beberapa grup menikmati tantangan kompetitif, sementara yang lain ingin suasana santai. Bicarakan tujuan mabar sebelum memilih game.</p>
    <h2>Buat aturan komunikasi</h2>
    <p>Tentukan platform voice chat, waktu mulai, dan cara mengganti pemain yang berhalangan. Sedikit struktur membuat sesi bermain jauh lebih nyaman.</p>$$,
    '2026-06-09T06:30:00+07:00',
    'Mamen Hobbies',
    'published',
    'Cara Memilih Game Co-op untuk Mabar',
    'Panduan memilih game co-op yang cocok untuk grup bermain.',
    ARRAY['gaming', 'co-op', 'mabar'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'panduan-memulai-anime-musiman',
    'Panduan Memulai Anime Musiman Tanpa Menambah Backlog',
    'hobbies',
    'anime',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943423/mamen/concerts/2026/lalala-festival-2026.jpg',
    'Cara memilih anime musiman berdasarkan genre, staf kreatif, dan waktu yang tersedia.',
    $$<p>Setiap musim membawa banyak judul baru, tetapi mencoba semuanya sering berakhir menjadi backlog. Sistem seleksi sederhana membantu kamu menemukan tontonan yang benar-benar ingin diikuti.</p>
    <h2>Pilih berdasarkan premis dan staf</h2>
    <p>Selain trailer, lihat sutradara, studio, penulis seri, dan karya mereka sebelumnya. Informasi itu memberi gambaran lebih baik tentang arah adaptasi.</p>
    <h2>Gunakan aturan tiga episode dengan fleksibel</h2>
    <p>Tiga episode cukup untuk banyak seri, tetapi bukan aturan mutlak. Hentikan lebih cepat jika jelas tidak cocok, atau beri waktu lebih lama untuk cerita slow burn.</p>
    <h2>Sisakan ruang untuk kejutan</h2>
    <p>Pilih beberapa prioritas, lalu sisakan satu slot untuk judul yang direkomendasikan komunitas setelah musim berjalan.</p>$$,
    '2026-06-09T06:00:00+07:00',
    'Mamen Hobbies',
    'published',
    'Panduan Memilih Anime Musiman',
    'Cara mengikuti anime musiman tanpa menambah backlog berlebihan.',
    ARRAY['anime', 'seasonal anime', 'watch guide'],
    ARRAY[]::uuid[],
    NOW(),
    NOW()
  ),
  (
    'etika-menonton-pertunjukan-idol',
    'Etika Menonton Pertunjukan Idol untuk Penonton Baru',
    'hobbies',
    'jkt48',
    'https://res.cloudinary.com/dk3sxbnch/image/upload/v1780943421/mamen/concerts/2026/ikon-live-jakarta-2026.jpg',
    'Panduan sederhana menikmati pertunjukan idol sambil menghormati performer dan sesama penonton.',
    $$<p>Pertunjukan idol memiliki energi komunitas yang kuat. Penonton baru tidak harus langsung memahami semua chant, tetapi perlu menghormati aturan acara dan ruang penonton lain.</p>
    <h2>Kenali format acara</h2>
    <p>Baca informasi tiket, waktu masuk, aturan dokumentasi, dan susunan acara. Format teater, festival, dan konser besar dapat memiliki kebiasaan berbeda.</p>
    <h2>Ikuti energi tanpa memaksa diri</h2>
    <p>Kamu boleh ikut chant setelah merasa nyaman, tetapi menikmati pertunjukan dengan tenang juga sah. Hindari menghalangi pandangan atau mengganggu penonton lain.</p>
    <h2>Dukung dengan sehat</h2>
    <p>Hormati batas pribadi performer, aturan interaksi, dan keputusan anggota. Fandom yang sehat membuat pengalaman acara lebih menyenangkan untuk semua.</p>$$,
    '2026-06-09T05:30:00+07:00',
    'Mamen Hobbies',
    'published',
    'Etika Menonton Pertunjukan Idol',
    'Panduan etika pertunjukan idol untuk penonton baru.',
    ARRAY['jkt48', 'idol', 'fan guide'],
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
  updated_at = NOW();
