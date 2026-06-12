// ═══════════════════════════════════════════════
// MAMEN.ID — Type Definitions
// Full Pop Culture Media Platform
// ═══════════════════════════════════════════════

export interface Article {
    id: string;
    slug: string;
    title: string;
    category: ArticleCategory;
    subcategory: ArticleSubcategory;
    cover_image: string;
    excerpt: string;
    body_html: string;
    published_at?: string;
    author: string;
    author_id?: string;
    status?: "published" | "draft";
    seo_title: string;
    seo_description: string;
    tags?: string[];
    linked_concert_ids?: string[];
    created_at: string;
    updated_at: string;
}

export type ArticleCategory =
    | "public-voice"
    | "music"
    | "lifestyle"
    | "sports"
    | "hobbies";

export type ArticleSubcategory =
    | "opinion"
    | "review"
    | "news"
    | "merch"
    | "fashion"
    | "sneaker"
    | "health"
    | "football"
    | "basketball"
    | "esports"
    | "gaming"
    | "anime"
    | "jkt48";

export const ARTICLE_CATEGORIES: { value: ArticleCategory; label: string }[] = [
    { value: "public-voice", label: "Public Voice" },
    { value: "music", label: "Music" },
    { value: "lifestyle", label: "Lifestyle" },
    { value: "sports", label: "Sports" },
    { value: "hobbies", label: "Hobbies" },
];

// ── Navigation Categories ──

export const NAV_CATEGORIES = [
    {
        label: "Public Voice",
        href: "/public-voice",
        subcategories: [],
    },
    {
        label: "Concerts",
        href: "/concerts",
        subcategories: [
            { label: "Festival", href: "/concerts?type=festival" },
            { label: "Local Artist", href: "/concerts?type=local" },
            { label: "International", href: "/concerts?type=international" },
            { label: "K-Pop", href: "/concerts?type=kpop" },
        ],
    },
    {
        label: "Music",
        href: "/music",
        subcategories: [
            { label: "Music Review", href: "/music/review" },
            { label: "News", href: "/music/news" },
            { label: "Merch", href: "/music/merch" },
        ],
    },
    {
        label: "Lifestyle",
        href: "/lifestyle",
        subcategories: [
            { label: "Fashion", href: "/lifestyle/fashion" },
            { label: "Sneakers", href: "/lifestyle/sneaker" },
            { label: "Health", href: "/lifestyle/health" },
        ],
    },
    {
        label: "Sports",
        href: "/sports",
        subcategories: [
            { label: "Football", href: "/sports/football" },
            { label: "Basketball", href: "/sports/basketball" },
            { label: "Esports", href: "/sports/esports" },
        ],
    },
    {
        label: "Hobbies",
        href: "/hobbies",
        subcategories: [
            { label: "Gaming", href: "/hobbies/gaming" },
            { label: "Anime", href: "/hobbies/anime" },
            { label: "JKT48", href: "/hobbies/jkt48" },
        ],
    },
];

// ── Concert Types ──

export type ConcertType = "festival" | "local" | "international" | "kpop";

export const CONCERT_TYPES: { value: ConcertType; label: string }[] = [
    { value: "festival", label: "Festival" },
    { value: "local", label: "Local Artist" },
    { value: "international", label: "International" },
    { value: "kpop", label: "K-Pop / Asian" },
];

// ── Concert Sort ──

export type ConcertSort = "soonest" | "latest" | "popular";

export const CONCERT_SORT_OPTIONS: { value: ConcertSort; label: string }[] = [
    { value: "soonest", label: "Soonest" },
    { value: "latest", label: "Latest Added" },
    { value: "popular", label: "Most Popular" },
];

export interface ArticleProduct {
    id: string;
    article_id: string;
    brand_id?: string;
    merchant: Merchant;
    title: string;
    image: string;
    price_display: string;
    affiliate_url: string;
    sort_order: number;
}

export type Merchant = "shopee" | "tokopedia" | "tiktok";

export interface Concert {
    id: string;
    slug: string;
    title: string;
    concert_type: ConcertType;
    start_datetime: string;
    end_datetime?: string;
    venue: string;
    city: string;
    poster_image: string;
    ticket_url: string;
    genre_tags: string[];
    description?: string;
    interested_count: number;
    created_at: string;
    updated_at: string;
}

// Featured brand for "Top Brands" section
export interface FeaturedBrand {
    id: string;
    name: string;
    image: string;
    link: string;
    tag?: string;
    sort_order?: number;
    is_active?: boolean;
}

export interface ArticleConcert {
    article_id: string;
    concert_id: string;
}

export interface AffiliateClick {
    id: string;
    article_id: string;
    article_product_id: string;
    merchant: Merchant;
    clicked_at: string;
    referrer?: string;
    user_agent?: string;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribed_at: string;
}

// ── Barengan Types ──

export type BarenganStatus = "ticket_holder" | "interested_will_come" | "interested_unsure";

export const BARENGAN_STATUS_OPTIONS: { value: BarenganStatus; label: string; emoji: string }[] = [
    { value: "ticket_holder", label: "Ticket Holder", emoji: "🎫" },
    { value: "interested_will_come", label: "Interested & Will Come", emoji: "🔥" },
    { value: "interested_unsure", label: "Interested but Unsure", emoji: "🤔" },
];

export interface BarenganPost {
    id: string;
    user_id: string;
    concert_id: string;
    status: BarenganStatus;
    message: string;
    looking_for: number;
    max_members: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    // Joined fields
    concert?: Concert;
    profile?: ProfileSnippet;
    member_count?: number;
    approved_count?: number;
    response_count?: number; // legacy compat
}

export type BarenganMemberStatus = "pending" | "approved" | "rejected";

export interface BarenganMember {
    id: string;
    barengan_post_id: string;
    user_id: string;
    message: string;
    status: BarenganMemberStatus;
    created_at: string;
    profile?: ProfileSnippet;
}

export interface BarenganChatMessage {
    id: string;
    barengan_post_id: string;
    user_id: string;
    body: string;
    created_at: string;
    sender?: ProfileSnippet;
}

// Legacy — kept for backward compat with old data
export interface BarenganResponse {
    id: string;
    barengan_post_id: string;
    user_id: string;
    message: string;
    created_at: string;
    profile?: ProfileSnippet;
}

// ── Extended types with relations ──

export interface ArticleWithProducts extends Article {
    article_products: ArticleProduct[];
}

export interface ArticleWithAll extends Article {
    article_products: ArticleProduct[];
    concerts?: Concert[];
}

export interface ConcertWithArticles extends Concert {
    articles?: Article[];
}

// ── Shared Profile Snippet ──

export interface ProfileSnippet {
    id: string;
    name: string;
    handle: string;
    avatar: string;
}

// ── Follow System ──

export interface Follow {
    id: string;
    follower_id: string;
    following_id: string;
    created_at: string;
}

// ── Direct Messages ──

export interface DmConversation {
    id: string;
    participant_1: string;
    participant_2: string;
    last_message_at: string;
    created_at: string;
    // Joined
    other_user?: ProfileSnippet;
    last_message_preview?: string;
    unread_count?: number;
}

export interface DirectMessage {
    id: string;
    conversation_id: string;
    sender_id: string;
    body: string;
    read_at: string | null;
    created_at: string;
    sender?: ProfileSnippet;
}

// ── Concert Attendees ──

export interface ConcertAttendee {
    id: string;
    concert_id: string;
    user_id: string;
    source: string;
    created_at: string;
    profile?: ProfileSnippet;
}
