// ═══════════════════════════════════════════════
// MAMEN.ID — Mock Data Layer
// Full Pop Culture Platform — Music, Gaming, Anime, Fashion, Sports, JKT48
// ═══════════════════════════════════════════════

import {
    Article,
    ArticleProduct,
    Concert,
    ArticleCategory,
    ConcertType,
    ConcertSort,
    FeaturedBrand,
    BarenganPost,
    BarenganResponse,
    BarenganMember,
    BarenganMemberStatus,
    BarenganChatMessage,
    ProfileSnippet,
    DmConversation,
    DirectMessage,
    ConcertAttendee,
} from "./types";
import { createServerSupabase, getBrowserSupabase, supabase } from "./supabase";
import { getBarenganCapacity } from "./barengan";

async function getContextSupabase() {
    return typeof window === "undefined" ? await createServerSupabase() : getBrowserSupabase();
}

type RawBarenganPost = Omit<BarenganPost, "concert" | "profile"> & {
    concert?: Concert | null;
};

type RawBarenganMember = Omit<BarenganMember, "profile">;

type RawBarenganChatMessage = Omit<BarenganChatMessage, "sender">;

type BarenganMemberPostLookup = {
    barengan_post_id: string;
    barengan_posts:
    | { max_members?: number | null; looking_for?: number | null }
    | { max_members?: number | null; looking_for?: number | null }[]
    | null;
};

// ── ARTICLES ──

export const mockArticles: Article[] = [
    {
        id: "1",
        slug: "hindia-menari-dengan-bayangan-album-review",
        title: "Hindia - 'Menari Dengan Bayangan' Album Review: A Masterpiece of Indonesian Indie",
        category: "music",
        subcategory: "review",
        cover_image: "https://picsum.photos/seed/hindia/800/500",
        excerpt:
            "Hindia delivers his most ambitious work yet, blending indie pop with electronic textures that push the boundaries of Indonesian music.",
        body_html: `<p>Hindia's latest album 'Menari Dengan Bayangan' is nothing short of a revelation. The Jakarta-based artist has crafted 12 tracks that weave through themes of identity, urban anxiety, and hope.</p>
    <h2>Production & Sound</h2>
    <p>Working with producer Rayhan Noor, Hindia explores new sonic territories. The album opens with the atmospheric 'Bayangan Pertama', a slow-burn track that builds from whispered vocals to a crescendo of layered synths.</p>
    <h2>Standout Tracks</h2>
    <p>'Rumah ke Rumah' is the album's crown jewel — a 6-minute epic that combines traditional Javanese gamelan samples with modern bass production.</p>
    <h2>Verdict</h2>
    <p>This is the album Indonesian music needed. <strong>9/10</strong></p>`,
        published_at: "2026-02-20T10:00:00Z",
        author: "Mamen Editorial",
        seo_title: "Hindia Album Review | Mamen",
        seo_description: "In-depth review of Hindia's groundbreaking album.",
        tags: ["indie", "album review", "music", "indonesian"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-20T10:00:00Z",
        updated_at: "2026-02-20T10:00:00Z",
    },
    {
        id: "2",
        slug: "head-in-the-clouds-jakarta-2026-recap",
        title: "Head In The Clouds Jakarta 2026: The Night That Shook GBK",
        category: "news",
        subcategory: "concert",
        cover_image: "https://picsum.photos/seed/hitc/800/500",
        excerpt:
            "88rising brought the heat to Jakarta with an unforgettable night featuring NIKI, Rich Brian, and surprise guest Joji.",
        body_html: `<p>The gates of Gelora Bung Karno opened at 2 PM, but the energy was already electric.</p>
    <h2>The Surprise</h2>
    <p>Joji appeared from beneath the stage, opening with 'Glimpse of Us' to 80,000 screaming fans. Videos went viral within minutes.</p>`,
        published_at: "2026-02-19T08:00:00Z",
        author: "Mamen Editorial",
        seo_title: "HITC Jakarta 2026 Recap | Mamen",
        seo_description: "Complete recap of HITC Jakarta 2026.",
        tags: ["festival", "88rising", "concert recap", "gbk"],
        linked_concert_ids: ["3"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-19T08:00:00Z",
        updated_at: "2026-02-19T08:00:00Z",
    },
    {
        id: "3",
        slug: "coldplay-jakarta-2026-confirmed",
        title: "BREAKING: Coldplay Returns to Jakarta for 'Moon Music' World Tour 2026",
        category: "music",
        subcategory: "news",
        cover_image: "https://picsum.photos/seed/coldplay/800/500",
        excerpt:
            "Chris Martin and company are bringing their spectacular 'Moon Music' show to GBK Stadium this October.",
        body_html: `<p>It's official. Coldplay will return to Jakarta as part of their 'Moon Music' World Tour, with two confirmed dates at Gelora Bung Karno Stadium on October 15-16, 2026.</p>
    <h2>The Moon Music Experience</h2>
    <p>The 'Moon Music' tour has been praised globally for its sustainable staging and breathtaking visual production.</p>`,
        published_at: "2026-02-18T14:00:00Z",
        author: "Mamen News",
        seo_title: "Coldplay Jakarta 2026 | Mamen",
        seo_description: "Coldplay Moon Music World Tour Jakarta 2026.",
        tags: ["breaking", "coldplay", "concert announcement", "gbk"],
        linked_concert_ids: ["1"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-18T14:00:00Z",
        updated_at: "2026-02-18T14:00:00Z",
    },
    {
        id: "4",
        slug: "best-audio-gear-concert-goers-2026",
        title: "The Best Audio Gear for Concert Goers in 2026",
        category: "music",
        subcategory: "merch",
        cover_image: "https://picsum.photos/seed/audiogear/800/500",
        excerpt:
            "From earplugs that protect without killing the vibe to portable speakers that slap.",
        body_html: `<p>Going to concerts regularly? Your ears deserve protection.</p>
    <h2>Best Concert Earplugs</h2>
    <p>The Loop Experience Pro 2 remains our top pick. These earplugs reduce volume by 23dB while maintaining crystal-clear sound quality.</p>
    <h2>Best Portable Speaker</h2>
    <p>For pre-concert hangouts, the JBL Charge 6 is unbeatable.</p>`,
        published_at: "2026-02-17T09:00:00Z",
        author: "Mamen Gear",
        seo_title: "Best Concert Gear 2026 | Mamen",
        seo_description: "Top audio gear every concert goer needs.",
        tags: ["gear", "audio", "earplugs", "guide"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-17T09:00:00Z",
        updated_at: "2026-02-17T09:00:00Z",
    },
    {
        id: "5",
        slug: "jkt48-12th-anniversary-concert-review",
        title: "JKT48 12th Anniversary Concert: A Night of Nostalgia and New Beginnings",
        category: "hobbies",
        subcategory: "jkt48",
        cover_image: "https://picsum.photos/seed/jkt48/800/500",
        excerpt:
            "JKT48's 12th anniversary show was an emotional rollercoaster — from graduation announcements to surprise performances by original members.",
        body_html: `<p>The lights dimmed at Jakarta International Expo, and 8,000 fans held their breath. JKT48's 12th anniversary concert was about to begin — and nobody was ready for what came next.</p>
    <h2>The Setlist</h2>
    <p>Opening with the classic 'Heavy Rotation' Indonesian version, the energy was electric from the first beat. The 30-song setlist was a masterful blend of early hits and recent tracks.</p>
    <h2>The Surprise</h2>
    <p>Former member Melody returned to stage for a special duet, bringing the entire venue to tears. The moment was pure magic.</p>
    <h2>New Generation Shines</h2>
    <p>The 11th generation members proved they're ready to carry the torch. Their performance of 'Sanjou' was flawless.</p>`,
        published_at: "2026-02-16T11:00:00Z",
        author: "Mamen Editorial",
        seo_title: "JKT48 12th Anniversary Concert Review | Mamen",
        seo_description: "Review of JKT48's 12th anniversary concert.",
        tags: ["jkt48", "concert review", "idol", "anniversary"],
        linked_concert_ids: ["8"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-16T11:00:00Z",
        updated_at: "2026-02-16T11:00:00Z",
    },
    {
        id: "6",
        slug: "nike-dunk-low-jakarta-colorway-release",
        title: "Nike Dunk Low 'Jakarta' Colorway Drops This Friday — Everything You Need to Know",
        category: "lifestyle",
        subcategory: "sneakers",
        cover_image: "https://picsum.photos/seed/nikejkt/800/500",
        excerpt:
            "Nike's love letter to Jakarta comes in a stunning batik-inspired colorway. Here's how to cop.",
        body_html: `<p>Nike is dropping a Jakarta-exclusive Dunk Low colorway this Friday, and it might be the most fire Indonesian sneaker release of the year.</p>
    <h2>The Design</h2>
    <p>The shoe features a batik-inspired pattern on the upper, with traditional green and gold tones representing Jakarta. The midsole carries a subtle 'JKT' deboss.</p>
    <h2>Where to Buy</h2>
    <p>Available through Nike SNKRS app and select retailers in Indonesia. Retail price: Rp 1.799.000.</p>`,
        published_at: "2026-02-15T13:00:00Z",
        author: "Mamen Style",
        seo_title: "Nike Dunk Low Jakarta Release | Mamen",
        seo_description: "Nike Dunk Low Jakarta colorway release details.",
        tags: ["nike", "sneakers", "streetwear", "drop"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-15T13:00:00Z",
        updated_at: "2026-02-15T13:00:00Z",
    },
    {
        id: "7",
        slug: "elden-ring-dlc-shadow-erdtree-review",
        title: "Elden Ring: Shadow of the Erdtree Review — FromSoftware's Magnum Opus",
        category: "hobbies",
        subcategory: "gaming",
        cover_image: "https://picsum.photos/seed/eldenring/800/500",
        excerpt:
            "The DLC that gamers have been waiting for delivers on every promise. This is FromSoftware at their absolute peak.",
        body_html: `<p>FromSoftware's Shadow of the Erdtree DLC is a masterclass in game design. Expanding on an already incredible base game, this 40+ hour expansion raises the bar for what DLC can be.</p>
    <h2>New Mechanics</h2>
    <p>The Shadow Realm introduces new weapon types, a revamped spirit ash system, and some of the most creative boss fights in Souls history.</p>
    <h2>Verdict</h2>
    <p>If the base Elden Ring was a 10/10, Shadow of the Erdtree is an 11. Essential gaming. <strong>10/10</strong></p>`,
        published_at: "2026-02-14T09:00:00Z",
        author: "Mamen Gaming",
        seo_title: "Elden Ring Shadow of the Erdtree Review | Mamen",
        seo_description: "Elden Ring DLC review — FromSoftware's greatest achievement.",
        tags: ["gaming", "elden ring", "review", "fromsoftware"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-14T09:00:00Z",
        updated_at: "2026-02-14T09:00:00Z",
    },
    {
        id: "8",
        slug: "one-piece-live-action-season-2-preview",
        title: "One Piece Live Action Season 2: Everything We Know About the Alabasta Arc",
        category: "hobbies",
        subcategory: "anime",
        cover_image: "https://picsum.photos/seed/onepiece/800/500",
        excerpt:
            "Netflix's One Piece live action returns with the Alabasta saga. New cast reveals, set photos, and release window confirmed.",
        body_html: `<p>After a wildly successful first season, Netflix's One Piece live action is sailing into the Alabasta Arc for Season 2 — and it's shaping up to be even bigger.</p>
    <h2>New Cast</h2>
    <p>Chopper will be a combination of practical effects and CGI. Nico Robin's casting has been confirmed. Vivi and Crocodile are perfectly cast.</p>
    <h2>Release Window</h2>
    <p>Expected late 2026. Production is currently underway in South Africa.</p>`,
        published_at: "2026-02-13T10:00:00Z",
        author: "Mamen Culture",
        seo_title: "One Piece Season 2 Preview | Mamen",
        seo_description: "Everything about One Piece Live Action Season 2.",
        tags: ["anime", "one piece", "netflix", "preview"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-13T10:00:00Z",
        updated_at: "2026-02-13T10:00:00Z",
    },
    {
        id: "9",
        slug: "blackpink-jakarta-concert-2026",
        title: "BLACKPINK Announce Jakarta Concert — BORN PINK World Tour Extended",
        category: "news",
        subcategory: "concert",
        cover_image: "https://picsum.photos/seed/blackpink/800/500",
        excerpt:
            "Blinks unite! BLACKPINK is coming to Jakarta's GBK Stadium as part of their extended BORN PINK tour.",
        body_html: `<p>YG Entertainment has confirmed BLACKPINK will perform at Gelora Bung Karno Stadium in Jakarta. The BORN PINK World Tour extended dates include two nights in the Indonesian capital.</p>
    <h2>Ticket Info</h2>
    <p>Presale begins March 15 for BLINK membership holders. General sale opens March 18 via Tiket.com.</p>
    <h2>Expected Setlist</h2>
    <p>Based on recent shows, fans can expect hits like 'Pink Venom', 'Shut Down', 'How You Like That', and new unreleased tracks.</p>`,
        published_at: "2026-02-12T15:00:00Z",
        author: "Mamen K-Pop",
        seo_title: "BLACKPINK Jakarta Concert 2026 | Mamen",
        seo_description: "BLACKPINK BORN PINK tour Jakarta dates confirmed.",
        tags: ["kpop", "blackpink", "concert", "gbk"],
        linked_concert_ids: ["4"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-12T15:00:00Z",
        updated_at: "2026-02-12T15:00:00Z",
    },
    {
        id: "10",
        slug: "indonesia-vs-japan-world-cup-qualifier",
        title: "Indonesia vs Japan World Cup Qualifier: Can the Garuda Shock the World?",
        category: "sports",
        subcategory: "football",
        cover_image: "https://picsum.photos/seed/timnas/800/500",
        excerpt:
            "Timnas Indonesia faces Japan in a crucial World Cup qualifier at GBK. Here's why this could be the biggest match in Indonesian football history.",
        body_html: `<p>The mood at Gelora Bung Karno will be unlike anything before. Indonesia's national team faces Japan in a World Cup 2026 qualifier that could define a generation of Indonesian football.</p>
    <h2>The Squad</h2>
    <p>Coach Shin Tae-yong has called up a mix of local stars and naturalized players. Key names include Egy Maulana Vikri, Elkan Baggott, and Rafael Struick.</p>
    <h2>Why This Matters</h2>
    <p>A win or draw here could secure Indonesia's path to the World Cup — a first in the modern era.</p>`,
        published_at: "2026-02-11T08:00:00Z",
        author: "Mamen Sports",
        seo_title: "Indonesia vs Japan World Cup Qualifier | Mamen",
        seo_description: "Preview of Indonesia's crucial World Cup qualifier vs Japan.",
        tags: ["football", "timnas", "world cup", "qualifier"],
        status: "published",
        author_id: "user-1",
        created_at: "2026-02-11T08:00:00Z",
        updated_at: "2026-02-11T08:00:00Z",
    },
];

// ── CONCERTS ──

export const mockConcerts: Concert[] = [
    {
        id: "1",
        slug: "coldplay-moon-music-jakarta-2026",
        title: "Coldplay — Moon Music World Tour Jakarta",
        concert_type: "international",
        start_datetime: "2026-10-15T19:00:00+07:00",
        end_datetime: "2026-10-16T23:00:00+07:00",
        venue: "Gelora Bung Karno Stadium",
        city: "Jakarta",
        poster_image: "https://picsum.photos/seed/coldplayposter/600/800",
        ticket_url: "https://tiket.com",
        genre_tags: ["Pop", "Rock"],
        description:
            "Chris Martin and Coldplay bring their spectacular Moon Music World Tour to Jakarta for two unforgettable nights.",
        interested_count: 45230,
        created_at: "2026-02-18T00:00:00Z",
        updated_at: "2026-02-18T00:00:00Z",
    },
    {
        id: "2",
        slug: "pamungkas-solipsism-tour-jakarta",
        title: "Pamungkas — Solipsism Tour",
        concert_type: "local",
        start_datetime: "2026-03-22T19:30:00+07:00",
        venue: "Istora Senayan",
        city: "Jakarta",
        poster_image: "https://picsum.photos/seed/pamungkasposter/600/800",
        ticket_url: "https://tiket.com",
        genre_tags: ["Indie", "Pop"],
        description:
            "The culmination of Pamungkas' nationwide Solipsism Tour at Jakarta's iconic Istora Senayan.",
        interested_count: 12800,
        created_at: "2026-02-16T00:00:00Z",
        updated_at: "2026-02-16T00:00:00Z",
    },
    {
        id: "3",
        slug: "head-in-the-clouds-jakarta-2026",
        title: "Head In The Clouds Festival Jakarta 2026",
        concert_type: "festival",
        start_datetime: "2026-04-05T14:00:00+07:00",
        end_datetime: "2026-04-06T23:00:00+07:00",
        venue: "JIExpo Kemayoran",
        city: "Jakarta",
        poster_image: "https://picsum.photos/seed/hitcfest/600/800",
        ticket_url: "https://tokopedia.com",
        genre_tags: ["Hip-Hop", "R&B", "Pop"],
        description:
            "88rising's signature festival returns. NIKI, Rich Brian, Joji, and more across multiple stages.",
        interested_count: 32100,
        created_at: "2026-02-14T00:00:00Z",
        updated_at: "2026-02-14T00:00:00Z",
    },
    {
        id: "4",
        slug: "blackpink-born-pink-jakarta",
        title: "BLACKPINK — BORN PINK Tour Jakarta",
        concert_type: "kpop",
        start_datetime: "2026-05-08T19:00:00+07:00",
        end_datetime: "2026-05-09T23:00:00+07:00",
        venue: "Gelora Bung Karno Stadium",
        city: "Jakarta",
        poster_image: "https://picsum.photos/seed/bpjkt/600/800",
        ticket_url: "https://tiket.com",
        genre_tags: ["K-Pop"],
        description:
            "BLACKPINK brings the BORN PINK World Tour to Jakarta for two electrifying nights at GBK.",
        interested_count: 67800,
        created_at: "2026-02-13T00:00:00Z",
        updated_at: "2026-02-13T00:00:00Z",
    },
    {
        id: "5",
        slug: "dewa-19-reunion-bandung",
        title: "Dewa 19 Reunion Concert feat. Ari Lasso & Once",
        concert_type: "local",
        start_datetime: "2026-04-12T18:00:00+07:00",
        venue: "Trans Studio Bandung",
        city: "Bandung",
        poster_image: "https://picsum.photos/seed/dewa19/600/800",
        ticket_url: "https://tokopedia.com",
        genre_tags: ["Rock", "Pop"],
        description:
            "Dewa 19 reunites with both Ari Lasso and Once for an unprecedented double-headliner show.",
        interested_count: 28700,
        created_at: "2026-02-12T00:00:00Z",
        updated_at: "2026-02-12T00:00:00Z",
    },
    {
        id: "6",
        slug: "soundrenaline-2026",
        title: "Soundrenaline Festival 2026",
        concert_type: "festival",
        start_datetime: "2026-06-06T12:00:00+07:00",
        end_datetime: "2026-06-08T23:00:00+07:00",
        venue: "GWK Cultural Park",
        city: "Bali",
        poster_image: "https://picsum.photos/seed/soundrenaline/600/800",
        ticket_url: "https://tiket.com",
        genre_tags: ["Multi-genre"],
        description:
            "Indonesia's premier music festival returns to Bali with 50+ artists across 5 stages over 3 days.",
        interested_count: 41500,
        created_at: "2026-02-11T00:00:00Z",
        updated_at: "2026-02-11T00:00:00Z",
    },
    {
        id: "7",
        slug: "seventeen-follow-tour-jakarta",
        title: "SEVENTEEN — FOLLOW Tour Jakarta",
        concert_type: "kpop",
        start_datetime: "2026-07-12T18:00:00+07:00",
        venue: "Indonesia Arena",
        city: "Jakarta",
        poster_image: "https://picsum.photos/seed/svt/600/800",
        ticket_url: "https://tiket.com",
        genre_tags: ["K-Pop"],
        description: "SEVENTEEN brings the FOLLOW tour to Jakarta's state-of-the-art Indonesia Arena.",
        interested_count: 38200,
        created_at: "2026-02-10T00:00:00Z",
        updated_at: "2026-02-10T00:00:00Z",
    },
    {
        id: "8",
        slug: "jkt48-summer-festival",
        title: "JKT48 Summer Festival 2026",
        concert_type: "local",
        start_datetime: "2026-08-15T16:00:00+07:00",
        venue: "Jakarta International Expo",
        city: "Jakarta",
        poster_image: "https://picsum.photos/seed/jkt48fest/600/800",
        ticket_url: "https://jkt48.com",
        genre_tags: ["J-Pop", "Idol"],
        description:
            "JKT48's biggest annual event — outdoor festival with all teams, handshake events, and special guests.",
        interested_count: 15800,
        created_at: "2026-02-09T00:00:00Z",
        updated_at: "2026-02-09T00:00:00Z",
    },
];

// ── AFFILIATE PRODUCTS ──

export const mockProducts: ArticleProduct[] = [
    {
        id: "1",
        article_id: "4",
        merchant: "shopee",
        title: "Loop Experience Pro 2 Earplugs",
        image: "https://picsum.photos/seed/loop/400/400",
        price_display: "Rp 450.000",
        affiliate_url: "https://shopee.co.id",
        sort_order: 1,
    },
    {
        id: "2",
        article_id: "4",
        merchant: "tokopedia",
        title: "JBL Charge 6 Portable Speaker",
        image: "https://picsum.photos/seed/jbl/400/400",
        price_display: "Rp 2.899.000",
        affiliate_url: "https://tokopedia.com",
        sort_order: 2,
    },
    {
        id: "3",
        article_id: "6",
        merchant: "shopee",
        title: "Nike Dunk Low 'Jakarta' Colorway",
        image: "https://picsum.photos/seed/nikejktshoe/400/400",
        price_display: "Rp 1.799.000",
        affiliate_url: "https://shopee.co.id",
        sort_order: 1,
    },
    {
        id: "4",
        article_id: "1",
        merchant: "shopee",
        title: "Hindia - Menari Dengan Bayangan (Vinyl)",
        image: "https://picsum.photos/seed/hindiavinyl/400/400",
        price_display: "Rp 550.000",
        affiliate_url: "https://shopee.co.id",
        sort_order: 1,
    },
    {
        id: "5",
        article_id: "1",
        merchant: "tokopedia",
        title: "Audio-Technica AT-LP60X Turntable",
        image: "https://picsum.photos/seed/turntable/400/400",
        price_display: "Rp 2.199.000",
        affiliate_url: "https://tokopedia.com",
        sort_order: 2,
    },
    {
        id: "6",
        article_id: "5",
        merchant: "shopee",
        title: "JKT48 Official Light Stick",
        image: "https://picsum.photos/seed/jkt48stick/400/400",
        price_display: "Rp 350.000",
        affiliate_url: "https://shopee.co.id",
        sort_order: 1,
    },
    {
        id: "7",
        article_id: "5",
        merchant: "tokopedia",
        title: "JKT48 12th Anniversary Photo Book",
        image: "https://picsum.photos/seed/jkt48book/400/400",
        price_display: "Rp 275.000",
        affiliate_url: "https://tokopedia.com",
        sort_order: 2,
    },
    {
        id: "8",
        article_id: "7",
        merchant: "shopee",
        title: "DualSense Edge Controller",
        image: "https://picsum.photos/seed/dualsense/400/400",
        price_display: "Rp 2.999.000",
        affiliate_url: "https://shopee.co.id",
        sort_order: 1,
    },
    {
        id: "9",
        article_id: "9",
        merchant: "shopee",
        title: "BLACKPINK Official Light Stick Ver.2",
        image: "https://picsum.photos/seed/bplightstick/400/400",
        price_display: "Rp 890.000",
        affiliate_url: "https://shopee.co.id",
        sort_order: 1,
    },
];

// ── FEATURED BRANDS (for Top Brands section) ──

export const mockFeaturedBrands: FeaturedBrand[] = [
    {
        id: "1",
        name: "Nike",
        image: "https://picsum.photos/seed/nikebrand/400/400",
        link: "/media/nike-dunk-low-jakarta-colorway-release",
        tag: "New Drop",
    },
    {
        id: "2",
        name: "JBL",
        image: "https://picsum.photos/seed/jblbrand/400/400",
        link: "/media/best-audio-gear-concert-goers-2026",
        tag: "Hot",
    },
    {
        id: "3",
        name: "Audio T.",
        image: "https://picsum.photos/seed/atbrand/400/400",
        link: "/media/hindia-menari-dengan-bayangan-album-review",
        tag: "Featured",
    },
    {
        id: "4",
        name: "PlayStation",
        image: "https://picsum.photos/seed/psbrand/400/400",
        link: "/media/elden-ring-dlc-shadow-erdtree-review",
        tag: "Gaming",
    },
    {
        id: "5",
        name: "Adidas",
        image: "https://picsum.photos/seed/adidasbrand/400/400",
        link: "/media?cat=lifestyle",
        tag: "Style",
    },
];

// ── DATA ACCESS FUNCTIONS ──

export async function getArticles(category?: ArticleCategory, subcategory?: string): Promise<Article[]> {
    let query = supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (category) {
        query = query.eq("category", category);
    }

    if (subcategory) {
        query = query.eq("subcategory", subcategory);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
    return data as Article[];
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) return undefined;
    return data as Article;
}

export async function getArticleProducts(articleId: string): Promise<ArticleProduct[]> {
    const { data, error } = await supabase
        .from("article_products")
        .select("*")
        .eq("article_id", articleId)
        .order("sort_order", { ascending: true });

    if (error) return [];
    return data as ArticleProduct[];
}

export async function getConcerts(filters?: {
    city?: string;
    type?: ConcertType;
    sort?: ConcertSort;
    hidePast?: boolean;
}): Promise<Concert[]> {
    const sortBy = filters?.sort || "soonest";

    let query = supabase
        .from("concerts")
        .select("*");

    // Hide past events (H+1 rule: hide events ended more than 24h ago)
    if (filters?.hidePast !== false) {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.or(`end_datetime.gt.${cutoff},end_datetime.is.null,start_datetime.gt.${cutoff}`);
    }

    if (filters?.city) {
        query = query.eq("city", filters.city);
    }
    if (filters?.type) {
        query = query.eq("concert_type", filters.type);
    }

    // Apply sort
    if (sortBy === "latest") {
        query = query.order("created_at", { ascending: false });
    } else if (sortBy === "popular") {
        query = query.order("interested_count", { ascending: false });
    } else {
        // "soonest" — default
        query = query.order("start_datetime", { ascending: true });
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching concerts:", error);
        return [];
    }
    return data as Concert[];
}

export async function getConcertBySlug(slug: string): Promise<Concert | undefined> {
    const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) return undefined;
    return data as Concert;
}

export async function getFeaturedArticle(): Promise<Article> {
    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return mockArticles[0]; // Fallback to mock
    return data as Article;
}

export async function getFeaturedConcert(): Promise<Concert> {
    const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .order("start_datetime", { ascending: true })
        .limit(1)
        .single();

    if (error || !data) return mockConcerts[0]; // Fallback to mock
    return data as Concert;
}

export async function getProductById(id: string): Promise<ArticleProduct | undefined> {
    const { data, error } = await supabase
        .from("article_products")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) return undefined;
    return data as ArticleProduct;
}

export async function getRelatedArticles(currentSlug: string, limit = 3, concertId?: string): Promise<Article[]> {
    let query = supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .neq("slug", currentSlug)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (concertId) {
        // Find articles whose linked_concert_ids array contains the concertId
        query = query.contains("linked_concert_ids", [concertId]);
    }

    const { data, error } = await query;
    if (error) return [];
    return data as Article[];
}

export async function getRelatedConcerts(limit = 3): Promise<Concert[]> {
    const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .order("start_datetime", { ascending: true })
        .limit(limit);

    if (error) return [];
    return data as Concert[];
}

export async function getFeaturedBrands(): Promise<FeaturedBrand[]> {
    const { data, error } = await supabase
        .from("featured_brands")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching featured brands:", error);
        return [];
    }
    return data as FeaturedBrand[];
}

export async function getArticleLinkedConcerts(article: Article): Promise<Concert[]> {
    if (!article.linked_concert_ids || article.linked_concert_ids.length === 0) return [];

    const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .in("id", article.linked_concert_ids);

    if (error) return [];
    return data as Concert[];
}

// ── BARENGAN FUNCTIONS ──

export async function getBarenganPosts(filters?: {
    concertSlug?: string;
    sort?: "latest" | "concert_date";
    limit?: number;
}): Promise<BarenganPost[]> {
    const db = await getContextSupabase();
    let query = db
        .from("barengan_posts")
        .select(`*, concert:concerts(*)`)
        .eq("is_active", true);

    if (filters?.concertSlug) {
        const { data: concert } = await db
            .from("concerts")
            .select("id")
            .eq("slug", filters.concertSlug)
            .single();

        if (concert) {
            query = query.eq("concert_id", concert.id);
        }
    }

    const sortBy = filters?.sort || "latest";
    query = query.order("created_at", { ascending: false });

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
        console.error("Error fetching barengan posts:", error);
        return [];
    }

    const posts = data as RawBarenganPost[];
    if (posts.length === 0) return [];

    // Fetch profiles and member counts (approved + pending) separately
    const userIds = [...new Set(posts.map((p) => p.user_id))];
    const postIds = posts.map((p) => p.id);

    const [profilesResult, approvedResult, pendingResult] = await Promise.all([
        db.from("profiles").select("id, name, handle, avatar").in("id", userIds),
        db.from("barengan_members").select("barengan_post_id").eq("status", "approved").in("barengan_post_id", postIds),
        db.from("barengan_members").select("barengan_post_id").eq("status", "pending").in("barengan_post_id", postIds),
    ]);

    const profileMap: Record<string, ProfileSnippet> = {};
    profilesResult.data?.forEach((profile) => { profileMap[profile.id] = profile as ProfileSnippet; });

    const approvedCountMap: Record<string, number> = {};
    approvedResult.data?.forEach((result) => {
        approvedCountMap[result.barengan_post_id] = (approvedCountMap[result.barengan_post_id] || 0) + 1;
    });

    const pendingCountMap: Record<string, number> = {};
    pendingResult.data?.forEach((result) => {
        pendingCountMap[result.barengan_post_id] = (pendingCountMap[result.barengan_post_id] || 0) + 1;
    });

    const hydratedPosts = posts.map((post) => ({
        ...post,
        profile: profileMap[post.user_id] || null,
        approved_count: approvedCountMap[post.id] || 0,
        member_count: (approvedCountMap[post.id] || 0) + (pendingCountMap[post.id] || 0),
        response_count: approvedCountMap[post.id] || 0, // legacy compat
    })) as BarenganPost[];

    if (sortBy === "concert_date") {
        return hydratedPosts.sort((firstPost, secondPost) => {
            const firstDate = firstPost.concert?.start_datetime ? new Date(firstPost.concert.start_datetime).getTime() : Number.MAX_SAFE_INTEGER;
            const secondDate = secondPost.concert?.start_datetime ? new Date(secondPost.concert.start_datetime).getTime() : Number.MAX_SAFE_INTEGER;
            return firstDate - secondDate;
        });
    }

    return hydratedPosts;
}

export async function getBarenganPostById(id: string): Promise<BarenganPost | null> {
    const db = await getContextSupabase();
    const { data, error } = await db
        .from("barengan_posts")
        .select(`*, concert:concerts(*)`)
        .eq("id", id)
        .single();

    if (error || !data) return null;

    // Fetch profile and member counts separately
    const [profileResult, approvedResult, pendingResult] = await Promise.all([
        db.from("profiles").select("id, name, handle, avatar").eq("id", (data as RawBarenganPost).user_id).single(),
        db.from("barengan_members").select("id", { count: "exact", head: true }).eq("barengan_post_id", id).eq("status", "approved"),
        db.from("barengan_members").select("id", { count: "exact", head: true }).eq("barengan_post_id", id).eq("status", "pending"),
    ]);

    const approvedCount = approvedResult.count || 0;
    const pendingCount = pendingResult.count || 0;

    return {
        ...data,
        profile: profileResult.data || null,
        approved_count: approvedCount,
        member_count: approvedCount + pendingCount,
        response_count: approvedCount, // legacy compat
    } as unknown as BarenganPost;
}

/** @deprecated Use getBarenganMembers instead */
export async function getBarenganResponses(postId: string): Promise<BarenganResponse[]> {
    // Redirect to new members table for backward compat
    const members = await getBarenganMembers(postId, "approved");
    return members.map((m) => ({
        id: m.id,
        barengan_post_id: m.barengan_post_id,
        user_id: m.user_id,
        message: m.message,
        created_at: m.created_at,
        profile: m.profile,
    })) as BarenganResponse[];
}

export async function getBarenganMembers(postId: string, status?: BarenganMemberStatus): Promise<BarenganMember[]> {
    const db = await getContextSupabase();
    let query = db
        .from("barengan_members")
        .select("*")
        .eq("barengan_post_id", postId)
        .order("created_at", { ascending: true });

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    // Fetch profiles separately
    const members = data as RawBarenganMember[];
    const userIds = [...new Set(members.map((member) => member.user_id))];
    const { data: profiles } = await db
        .from("profiles")
        .select("id, name, handle, avatar")
        .in("id", userIds);

    const profileMap: Record<string, ProfileSnippet> = {};
    profiles?.forEach((profile) => { profileMap[profile.id] = profile as ProfileSnippet; });

    return members.map((member) => ({
        ...member,
        profile: profileMap[member.user_id] || null,
    })) as unknown as BarenganMember[];
}

export async function createBarenganPost(post: {
    user_id: string;
    concert_id: string;
    status: string;
    message: string;
    looking_for: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
    const db = await getContextSupabase();
    const { data, error } = await db
        .from("barengan_posts")
        .insert({
            ...post,
            max_members: post.looking_for + 1,
        })
        .select("id")
        .single();

    if (error) return { success: false, error: error.message };
    return { success: true, id: data.id };
}

/** @deprecated Use requestToJoinBarengan instead */
export async function createBarenganResponse(response: {
    barengan_post_id: string;
    user_id: string;
    message: string;
}): Promise<{ success: boolean; error?: string }> {
    return requestToJoinBarengan(response.barengan_post_id, response.user_id, response.message);
}

export async function requestToJoinBarengan(postId: string, userId: string, message: string): Promise<{ success: boolean; error?: string }> {
    const db = await getContextSupabase();
    const { error } = await db
        .from("barengan_members")
        .insert({
            barengan_post_id: postId,
            user_id: userId,
            message,
            status: "pending",
        });

    if (error) {
        if (error.code === "23505") return { success: false, error: "You already requested to join this group" };
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function approveBarenganMember(memberId: string): Promise<{ success: boolean; error?: string }> {
    const db = await getContextSupabase();
    const { data: member, error: memberError } = await db
        .from("barengan_members")
        .select("barengan_post_id, barengan_posts(max_members, looking_for)")
        .eq("id", memberId)
        .single();

    if (memberError || !member) return { success: false, error: memberError?.message || "Request not found" };

    const memberLookup = member as unknown as BarenganMemberPostLookup;
    const { count, error: countError } = await db
        .from("barengan_members")
        .select("id", { count: "exact", head: true })
        .eq("barengan_post_id", memberLookup.barengan_post_id)
        .eq("status", "approved");

    if (countError) return { success: false, error: countError.message };

    const embeddedPost = Array.isArray(memberLookup.barengan_posts)
        ? memberLookup.barengan_posts[0]
        : memberLookup.barengan_posts;
    const maxMembers = getBarenganCapacity(embeddedPost || {});
    if ((count || 0) + 1 >= maxMembers) {
        return { success: false, error: "This barengan group is already full" };
    }

    const { error } = await db
        .from("barengan_members")
        .update({ status: "approved" })
        .eq("id", memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function rejectBarenganMember(memberId: string): Promise<{ success: boolean; error?: string }> {
    const db = await getContextSupabase();
    const { error } = await db
        .from("barengan_members")
        .update({ status: "rejected" })
        .eq("id", memberId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function sendBarenganChatMessage(postId: string, userId: string, body: string): Promise<{ success: boolean; error?: string }> {
    const db = await getContextSupabase();
    const { error } = await db
        .from("barengan_messages")
        .insert({
            barengan_post_id: postId,
            user_id: userId,
            body,
        });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function getBarenganChatMessages(postId: string, limit: number = 100): Promise<BarenganChatMessage[]> {
    const db = await getContextSupabase();
    const { data, error } = await db
        .from("barengan_messages")
        .select("*")
        .eq("barengan_post_id", postId)
        .order("created_at", { ascending: true })
        .limit(limit);

    if (error || !data || data.length === 0) return [];

    // Fetch sender profiles
    const messages = data as RawBarenganChatMessage[];
    const userIds = [...new Set(messages.map((message) => message.user_id))];
    const { data: profiles } = await db
        .from("profiles")
        .select("id, name, handle, avatar")
        .in("id", userIds);

    const profileMap: Record<string, ProfileSnippet> = {};
    profiles?.forEach((profile) => { profileMap[profile.id] = profile as ProfileSnippet; });

    return messages.map((message) => ({
        ...message,
        sender: profileMap[message.user_id] || null,
    })) as unknown as BarenganChatMessage[];
}

export async function getBarenganCountForConcert(concertId: string): Promise<number> {
    const db = await getContextSupabase();
    const { count, error } = await db
        .from("barengan_posts")
        .select("*", { count: "exact", head: true })
        .eq("concert_id", concertId)
        .eq("is_active", true);

    if (error) return 0;
    return count || 0;
}

export async function getUserConcertAttendedCount(userId: string): Promise<number> {
    // Count barengan posts where user is ticket_holder and concert has ended
    const { data, error } = await supabase
        .from("barengan_posts")
        .select(`
            id,
            concert:concerts!inner(end_datetime, start_datetime)
        `)
        .eq("user_id", userId)
        .eq("status", "ticket_holder");

    if (error || !data) return 0;

    const now = new Date();
    return data.filter((post: any) => {
        const endDate = post.concert?.end_datetime || post.concert?.start_datetime;
        return endDate && new Date(endDate) < now;
    }).length;
}

// ── FOLLOW FUNCTIONS ──

export async function followUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from("follows")
        .insert({ follower_id: followerId, following_id: followingId });

    if (error) {
        if (error.code === "23505") return { success: false, error: "Already following this user" };
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function unfollowUser(followerId: string, followingId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", followerId)
        .eq("following_id", followingId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function getFollowers(userId: string, limit = 20, offset = 0): Promise<{ profiles: ProfileSnippet[]; total: number }> {
    const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

    const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error || !data || data.length === 0) return { profiles: [], total: count || 0 };

    const userIds = data.map((f: any) => f.follower_id);
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, handle, avatar")
        .in("id", userIds);

    return { profiles: (profiles || []) as ProfileSnippet[], total: count || 0 };
}

export async function getFollowing(userId: string, limit = 20, offset = 0): Promise<{ profiles: ProfileSnippet[]; total: number }> {
    const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

    const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error || !data || data.length === 0) return { profiles: [], total: count || 0 };

    const userIds = data.map((f: any) => f.following_id);
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, handle, avatar")
        .in("id", userIds);

    return { profiles: (profiles || []) as ProfileSnippet[], total: count || 0 };
}

export async function getFollowerCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

    if (error) return 0;
    return count || 0;
}

export async function getFollowingCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

    if (error) return 0;
    return count || 0;
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();

    if (error) return false;
    return !!data;
}

export async function isMutualFollow(userId1: string, userId2: string): Promise<boolean> {
    const { data, error } = await supabase
        .rpc("are_mutual_follows", { user1: userId1, user2: userId2 });

    if (error) return false;
    return !!data;
}

// ── CONCERT ATTENDEE FUNCTIONS ──

export async function getConcertAttendees(concertId: string, limit = 20, offset = 0): Promise<{ profiles: ProfileSnippet[]; total: number }> {
    const { count } = await supabase
        .from("concert_attendees")
        .select("*", { count: "exact", head: true })
        .eq("concert_id", concertId);

    const { data, error } = await supabase
        .from("concert_attendees")
        .select("user_id")
        .eq("concert_id", concertId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error || !data || data.length === 0) return { profiles: [], total: count || 0 };

    const userIds = data.map((row: any) => row.user_id);
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, handle, avatar")
        .in("id", userIds);

    return { profiles: (profiles || []) as ProfileSnippet[], total: count || 0 };
}

export async function getConcertAttendeeCount(concertId: string): Promise<number> {
    const { count, error } = await supabase
        .from("concert_attendees")
        .select("*", { count: "exact", head: true })
        .eq("concert_id", concertId);

    if (error) return 0;
    return count || 0;
}

export async function getUserConcertHistory(userId: string): Promise<Array<{ concert: Concert; source: string; created_at: string }>> {
    const { data, error } = await supabase
        .from("concert_attendees")
        .select("concert_id, source, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return [];

    const concertIds = data.map((row: any) => row.concert_id);
    const { data: concerts } = await supabase
        .from("concerts")
        .select("*")
        .in("id", concertIds);

    if (!concerts) return [];

    const concertMap: Record<string, Concert> = {};
    concerts.forEach((c: any) => { concertMap[c.id] = c as Concert; });

    return data
        .filter((row: any) => concertMap[row.concert_id])
        .map((row: any) => ({
            concert: concertMap[row.concert_id],
            source: row.source || "manual",
            created_at: row.created_at,
        }));
}

export async function getUserConcertCount(userId: string): Promise<number> {
    const { count, error } = await supabase
        .from("concert_attendees")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

    if (error) return 0;
    return count || 0;
}

export async function attendConcert(userId: string, concertId: string, source?: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from("concert_attendees")
        .insert({ user_id: userId, concert_id: concertId, source: source || "manual" });

    if (error) {
        if (error.code === "23505") return { success: false, error: "Already attending this concert" };
        return { success: false, error: error.message };
    }
    return { success: true };
}

export async function unattendConcert(userId: string, concertId: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from("concert_attendees")
        .delete()
        .eq("user_id", userId)
        .eq("concert_id", concertId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function isAttendingConcert(userId: string, concertId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from("concert_attendees")
        .select("id")
        .eq("user_id", userId)
        .eq("concert_id", concertId)
        .maybeSingle();

    if (error) return false;
    return !!data;
}

// ── DM FUNCTIONS ──

export async function getOrCreateConversation(userId1: string, userId2: string): Promise<{ id: string } | null> {
    const p1 = userId1 < userId2 ? userId1 : userId2;
    const p2 = userId1 < userId2 ? userId2 : userId1;

    const { data: existing } = await supabase
        .from("dm_conversations")
        .select("id")
        .eq("participant_1", p1)
        .eq("participant_2", p2)
        .maybeSingle();

    if (existing) return { id: existing.id };

    const { data: created, error } = await supabase
        .from("dm_conversations")
        .insert({ participant_1: p1, participant_2: p2 })
        .select("id")
        .single();

    if (error) {
        console.error("Error creating conversation:", error);
        return null;
    }

    return { id: created.id };
}

export async function getConversations(userId: string): Promise<DmConversation[]> {
    const { data: conversations, error } = await supabase
        .from("dm_conversations")
        .select("*")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order("last_message_at", { ascending: false });

    if (error || !conversations) return [];

    const enriched = await Promise.all(
        conversations.map(async (conv: any) => {
            const otherUserId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;

            const [profileResult, lastMsgResult, unreadResult] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("id, name, handle, avatar")
                    .eq("id", otherUserId)
                    .single(),
                supabase
                    .from("direct_messages")
                    .select("body")
                    .eq("conversation_id", conv.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle(),
                supabase
                    .from("direct_messages")
                    .select("*", { count: "exact", head: true })
                    .eq("conversation_id", conv.id)
                    .neq("sender_id", userId)
                    .is("read_at", null),
            ]);

            return {
                ...conv,
                other_user: profileResult.data as ProfileSnippet | undefined,
                last_message_preview: lastMsgResult.data?.body || "",
                unread_count: unreadResult.count || 0,
            } as DmConversation;
        })
    );

    return enriched;
}

export async function getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<DirectMessage[]> {
    const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error || !data) return [];

    const senderIds = [...new Set(data.map((m: any) => m.sender_id))];
    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, handle, avatar")
        .in("id", senderIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p as ProfileSnippet]));

    return data.map((m: any) => ({
        ...m,
        sender: profileMap.get(m.sender_id),
    })) as DirectMessage[];
}

export async function sendDirectMessage(conversationId: string, senderId: string, body: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from("direct_messages")
        .insert({ conversation_id: conversationId, sender_id: senderId, body });

    if (error) {
        console.error("Error sending message:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase
        .from("direct_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", userId)
        .is("read_at", null);
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
    const { data: conversations } = await supabase
        .from("dm_conversations")
        .select("id")
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

    if (!conversations || conversations.length === 0) return 0;

    const conversationIds = conversations.map((c: any) => c.id);

    const { count, error } = await supabase
        .from("direct_messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", conversationIds)
        .neq("sender_id", userId)
        .is("read_at", null);

    if (error) return 0;
    return count || 0;
}
