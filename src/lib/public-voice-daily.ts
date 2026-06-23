import crypto from "node:crypto";
import { createServiceRoleClient } from "@/lib/supabase";

const JAKARTA_UTC_OFFSET_HOURS = 7;
const PUBLIC_VOICE_AUTHOR = "Mamen Public Voice";
const CLOUDINARY_FOLDER = "mamen/public-voice/daily";

const DEFAULT_FEEDS = [
    "https://www.antaranews.com/rss/terkini.xml",
    "https://www.antaranews.com/rss/nasional.xml",
    "https://www.antaranews.com/rss/politik.xml",
];

const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=1400&q=80",
];

type FeedItem = {
    title: string;
    link: string;
    description: string;
    publishedAt?: string;
    imageUrl?: string;
    sourceName: string;
};

type DailyPublicVoiceResult =
    | {
        status: "skipped";
        reason: "already-created";
        article: { id: string; slug: string; title: string; published_at: string | null };
    }
    | {
        status: "created";
        article: { id: string; slug: string; title: string; cover_image: string };
        source: { title: string; link: string; sourceName: string };
    };

function getJakartaDateParts(date: Date) {
    const shifted = new Date(date.getTime() + JAKARTA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
    return {
        year: shifted.getUTCFullYear(),
        month: shifted.getUTCMonth() + 1,
        day: shifted.getUTCDate(),
    };
}

function getJakartaDateKey(date: Date) {
    const { year, month, day } = getJakartaDateParts(date);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getJakartaDayBounds(date: Date) {
    const { year, month, day } = getJakartaDateParts(date);
    const start = new Date(Date.UTC(year, month - 1, day, -JAKARTA_UTC_OFFSET_HOURS));
    const end = new Date(Date.UTC(year, month - 1, day + 1, -JAKARTA_UTC_OFFSET_HOURS));
    return { start, end };
}

function decodeEntities(value: string) {
    return value
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");
}

function stripHtml(value: string) {
    return decodeEntities(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
    return value.replace(/[<>&'"]/g, (character) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&#39;",
        "\"": "&quot;",
    })[character] || character);
}

function extractText(block: string, tag: string) {
    const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return match ? stripHtml(match[1]) : "";
}

function extractLink(block: string) {
    const atomHref = block.match(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/i)?.[1];
    if (atomHref) return decodeEntities(atomHref.trim());
    return extractText(block, "link");
}

function extractAttribute(block: string, pattern: RegExp, attribute: string) {
    const tag = block.match(pattern)?.[0];
    if (!tag) return "";
    return decodeEntities(tag.match(new RegExp(`\\b${attribute}=["']([^"']+)["']`, "i"))?.[1]?.trim() || "");
}

function extractItemImage(block: string) {
    return extractAttribute(block, /<media:content\b[^>]*>/i, "url")
        || extractAttribute(block, /<media:thumbnail\b[^>]*>/i, "url")
        || extractAttribute(block, /<enclosure\b[^>]*type=["']image\/[^"']+["'][^>]*>/i, "url")
        || extractText(block, "image");
}

function parseFeed(xml: string, feedUrl: string): FeedItem[] {
    const sourceName = extractText(xml, "title") || new URL(feedUrl).hostname.replace(/^www\./, "");
    const itemBlocks = [
        ...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi),
        ...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi),
    ].map((match) => match[0]);

    return itemBlocks.map((block) => {
        const title = extractText(block, "title");
        const link = extractLink(block);
        const description = extractText(block, "description") || extractText(block, "summary") || extractText(block, "content:encoded");
        const publishedAt = extractText(block, "pubDate") || extractText(block, "published") || extractText(block, "updated");
        const imageUrl = extractItemImage(block);
        return { title, link, description, publishedAt, imageUrl, sourceName };
    }).filter((item) => item.title && item.link);
}

function getFeedUrls() {
    return (process.env.PUBLIC_VOICE_RSS_FEEDS || DEFAULT_FEEDS.join(","))
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
}

async function fetchFeedItems() {
    const results = await Promise.allSettled(getFeedUrls().map(async (feedUrl) => {
        const response = await fetch(feedUrl, { next: { revalidate: 0 } });
        if (!response.ok) throw new Error(`Feed failed: ${feedUrl}`);
        return parseFeed(await response.text(), feedUrl);
    }));

    return results.flatMap((result) => result.status === "fulfilled" ? result.value : []);
}

async function findPageImage(pageUrl: string) {
    try {
        const response = await fetch(pageUrl, { redirect: "follow", next: { revalidate: 0 } });
        if (!response.ok) return "";
        const html = await response.text();
        const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
        return match ? new URL(decodeEntities(match[1]), response.url).href : "";
    } catch {
        return "";
    }
}

function isSvgUrl(url: string) {
    return /\.svg(?:$|[?#])/i.test(url);
}

function getCloudinaryConfig() {
    const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) return null;
    return { apiKey: CLOUDINARY_API_KEY, apiSecret: CLOUDINARY_API_SECRET, cloudName: CLOUDINARY_CLOUD_NAME };
}

function cloudinaryTransform(url: string) {
    const marker = "/upload/";
    const uploadIndex = url.indexOf(marker);
    if (uploadIndex === -1) return url;
    return `${url.slice(0, uploadIndex + marker.length)}f_auto,q_auto,c_fill,g_auto,w_1200,h_750/${url.slice(uploadIndex + marker.length)}`;
}

async function uploadImageToCloudinary(imageUrl: string, publicId: string) {
    const config = getCloudinaryConfig();
    if (!config) return "";
    if (isSvgUrl(imageUrl)) return "";

    const imageResponse = await fetch(imageUrl, { redirect: "follow", next: { revalidate: 0 } });
    if (!imageResponse.ok) return "";

    const contentType = imageResponse.headers.get("content-type") || "";
    if (!contentType.startsWith("image/") || contentType.includes("svg")) return "";

    const timestamp = Math.round(Date.now() / 1000);
    const signatureBase = `folder=${CLOUDINARY_FOLDER}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha256").update(signatureBase + config.apiSecret).digest("hex");
    const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
    const form = new FormData();
    form.append("file", new Blob([await imageResponse.arrayBuffer()], { type: contentType }), `${publicId}.${extension}`);
    form.append("api_key", config.apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", CLOUDINARY_FOLDER);
    form.append("public_id", publicId);
    form.append("overwrite", "true");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
        method: "POST",
        body: form,
    });
    if (!response.ok) return "";

    const uploaded = await response.json() as { secure_url?: string };
    return uploaded.secure_url ? cloudinaryTransform(uploaded.secure_url) : "";
}

async function resolveCoverImage(item: FeedItem, slug: string) {
    const sourceImage = item.imageUrl || await findPageImage(item.link);
    const candidates = [
        sourceImage,
        FALLBACK_IMAGES[Math.abs(slug.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0)) % FALLBACK_IMAGES.length],
    ].filter((url): url is string => Boolean(url) && !isSvgUrl(url));

    for (const candidate of candidates) {
        const uploaded = await uploadImageToCloudinary(candidate, slug);
        if (uploaded) return uploaded;
    }

    return candidates[0];
}

function slugify(value: string) {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 86);
}

function getHostLabel(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return "sumber berita";
    }
}

function buildExcerpt(item: FeedItem) {
    const description = stripHtml(item.description);
    if (description.length > 150) return `${description.slice(0, 147).trim()}...`;
    return description || `Kabar terbaru ini masuk radar Public Voice karena berhubungan langsung dengan kepentingan publik.`;
}

function buildBodyHtml(item: FeedItem) {
    const sourceHost = getHostLabel(item.link);
    const intro = buildExcerpt(item);
    const safeTitle = escapeHtml(item.title);
    const safeIntro = escapeHtml(intro);
    const safeSourceName = escapeHtml(item.sourceName || sourceHost);
    const safeLink = escapeHtml(item.link);

    return `<p>${safeIntro}</p>

<p>Public Voice menaruh perhatian pada isu ini karena keputusan publik sering bergerak lebih cepat daripada penjelasan yang diterima warga. Ketika berita seperti <strong>${safeTitle}</strong> muncul, hal yang perlu dijaga bukan hanya kecepatan informasi, tetapi juga konteks, data, dan ruang bagi masyarakat untuk bertanya.</p>

<p>Catatan redaksi hari ini sederhana: setiap kebijakan, pernyataan pejabat, atau peristiwa yang berdampak luas perlu dibaca dengan kacamata akuntabilitas. Publik berhak tahu dasar keputusan, siapa yang diuntungkan, siapa yang menanggung risiko, dan bagaimana mekanisme koreksinya bila pelaksanaan di lapangan meleset.</p>

<p><strong>Sumber:</strong> <a href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeSourceName}</a>.</p>`;
}

function scoreFeedItem(item: FeedItem) {
    const text = `${item.sourceName} ${item.title} ${item.description}`.toLowerCase();
    const positiveTerms = [
        "indonesia",
        "pemerintah",
        "kabupaten",
        "kota",
        "dpr",
        "menteri",
        "presiden",
        "warga",
        "publik",
        "masyarakat",
        "petani",
        "pangan",
        "kesehatan",
        "pendidikan",
        "lingkungan",
        "transportasi",
        "bencana",
        "kebijakan",
        "anggaran",
        "nasional",
    ];
    const negativeTerms = [
        "piala dunia",
        "vs ",
        "sepak bola",
        "lions",
        "konser",
        "seleb",
        "profil istri",
        "sorotan global",
    ];

    return positiveTerms.reduce((score, term) => score + (text.includes(term) ? 2 : 0), 0)
        - negativeTerms.reduce((score, term) => score + (text.includes(term) ? 3 : 0), 0);
}

function sortFeedItems(items: FeedItem[]) {
    return [...items].sort((a, b) => {
        const scoreDifference = scoreFeedItem(b) - scoreFeedItem(a);
        if (scoreDifference !== 0) return scoreDifference;
        const left = a.publishedAt ? Date.parse(a.publishedAt) : 0;
        const right = b.publishedAt ? Date.parse(b.publishedAt) : 0;
        return right - left;
    });
}

export async function createDailyPublicVoiceArticle(now = new Date()): Promise<DailyPublicVoiceResult> {
    const supabase = createServiceRoleClient();
    const { start, end } = getJakartaDayBounds(now);

    const { data: existing, error: existingError } = await supabase
        .from("articles")
        .select("id, slug, title, published_at")
        .eq("category", "public-voice")
        .gte("published_at", start.toISOString())
        .lt("published_at", end.toISOString())
        .order("published_at", { ascending: false })
        .limit(1);

    if (existingError) throw new Error(`Failed to check today's Public Voice article: ${existingError.message}`);
    if (existing?.[0]) {
        return { status: "skipped", reason: "already-created", article: existing[0] };
    }

    const dateKey = getJakartaDateKey(now);
    const items = sortFeedItems(await fetchFeedItems());
    if (items.length === 0) throw new Error("No RSS items available for Public Voice");

    for (const item of items.slice(0, 20)) {
        const slug = slugify(`${dateKey}-${item.title}`);
        if (!slug) continue;

        const { data: duplicate, error: duplicateError } = await supabase
            .from("articles")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
        if (duplicateError) throw new Error(`Failed to check duplicate article: ${duplicateError.message}`);
        if (duplicate) continue;

        const coverImage = await resolveCoverImage(item, slug);
        const excerpt = buildExcerpt(item);
        const { data: inserted, error: insertError } = await supabase
            .from("articles")
            .insert({
                slug,
                title: item.title,
                category: "public-voice",
                subcategory: "opinion",
                cover_image: coverImage,
                excerpt,
                body_html: buildBodyHtml(item),
                published_at: now.toISOString(),
                author: PUBLIC_VOICE_AUTHOR,
                status: "published",
                seo_title: `${item.title} | Public Voice Mamen`,
                seo_description: excerpt,
                tags: ["public voice", "berita harian", "indonesia", getHostLabel(item.link)],
                linked_concert_ids: [],
            })
            .select("id, slug, title, cover_image")
            .single();

        if (insertError) throw new Error(`Failed to create Public Voice article: ${insertError.message}`);
        return {
            status: "created",
            article: inserted,
            source: { title: item.title, link: item.link, sourceName: item.sourceName },
        };
    }

    throw new Error("No unused RSS items available for Public Voice");
}
