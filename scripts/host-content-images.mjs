import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const envPath = path.resolve(".env.local");
const envText = await fs.readFile(envPath, "utf8");
for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const {
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary credentials are required");
}
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase service credentials are required");
}

const directImages = {
    "win-metawin-fancon-jakarta-2026": "https://winmetawinjakarta2026.com/images/banner/banner-desktop.png",
    "avenged-sevenfold-jakarta-2026": "https://a7xindonesia.com/a7xbanner.jpg",
    "lany-soft-world-tour-jakarta-2026": "https://lanyinjakarta.com/image/banner-lany.jpg",
    "bts-world-tour-jakarta-2026": "https://concerts.weverse.io/events/bts_tour/img/poster-CcxS4ZKk.webp",
};

const headers = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
};

async function supabase(pathname, options = {}) {
    const response = await fetch(`${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${pathname}`, {
        ...options,
        headers: { ...headers, ...options.headers },
    });
    if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
    return response.status === 204 ? null : response.json();
}

async function findPageImage(pageUrl) {
    try {
        const response = await fetch(pageUrl, { redirect: "follow" });
        if (!response.ok) return null;
        const html = await response.text();
        const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image)["']/i);
        if (!match) return null;
        return new URL(match[1], response.url).href;
    } catch {
        return null;
    }
}

async function uploadBytes(bytes, contentType, publicId) {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "mamen/concerts/2026";
    const signatureBase = `folder=${folder}&overwrite=true&public_id=${publicId}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha256").update(signatureBase + CLOUDINARY_API_SECRET).digest("hex");
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: contentType }), `${publicId}.${contentType.split("/")[1] || "jpg"}`);
    form.append("api_key", CLOUDINARY_API_KEY);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    form.append("folder", folder);
    form.append("public_id", publicId);
    form.append("overwrite", "true");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: form,
    });
    if (!response.ok) throw new Error(await response.text());
    return (await response.json()).secure_url;
}

async function uploadDownloadedImage(imageUrl, publicId) {
    const imageResponse = await fetch(imageUrl, { redirect: "follow" });
    if (!imageResponse.ok) throw new Error(`Could not download ${imageUrl}`);
    const contentType = imageResponse.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) throw new Error(`${imageUrl} is not an image`);
    return uploadBytes(Buffer.from(await imageResponse.arrayBuffer()), contentType, publicId);
}

function escapeXml(value) {
    return value.replace(/[<>&'"]/g, (character) => ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        "\"": "&quot;",
    })[character]);
}

function createFallbackPoster(concert) {
    const date = new Date(concert.start_datetime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "Asia/Jakarta",
    });
    const title = escapeXml(concert.title);
    const venue = escapeXml(concert.venue);
    return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6d28d9"/><stop offset="0.5" stop-color="#db2777"/><stop offset="1" stop-color="#111827"/></linearGradient></defs>
<rect width="900" height="1200" fill="url(#g)"/><circle cx="760" cy="170" r="230" fill="#c7ff00" opacity=".18"/><circle cx="100" cy="1050" r="300" fill="#c7ff00" opacity=".12"/>
<text x="70" y="110" fill="#c7ff00" font-family="Arial,sans-serif" font-size="34" font-weight="700" letter-spacing="8">MAMEN CONCERT GUIDE</text>
<foreignObject x="65" y="260" width="770" height="480"><div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:Arial,sans-serif;font-size:82px;font-weight:900;line-height:1.02;text-transform:uppercase">${title}</div></foreignObject>
<text x="70" y="930" fill="#c7ff00" font-family="Arial,sans-serif" font-size="50" font-weight="800">${date}</text>
<text x="70" y="1005" fill="white" font-family="Arial,sans-serif" font-size="34" font-weight="700">${venue}</text>
<text x="70" y="1070" fill="white" font-family="Arial,sans-serif" font-size="30">Jakarta</text>
<text x="70" y="1140" fill="white" opacity=".7" font-family="Arial,sans-serif" font-size="22">Unofficial guide artwork - check official event link for updates</text>
</svg>`);
}

const concerts = await supabase("concerts?select=id,slug,title,venue,start_datetime,ticket_url,poster_image");
const hostedByConcertId = new Map();

for (const concert of concerts) {
    const candidates = [
        directImages[concert.slug],
        await findPageImage(concert.ticket_url),
        concert.poster_image,
    ].filter(Boolean);

    let hostedUrl = null;
    for (const source of [...new Set(candidates)]) {
        try {
            hostedUrl = await uploadDownloadedImage(source, concert.slug);
            break;
        } catch (error) {
            console.warn(`Could not use ${source} for ${concert.slug}: ${error.message}`);
        }
    }

    if (!hostedUrl) {
        hostedUrl = await uploadBytes(createFallbackPoster(concert), "image/svg+xml", concert.slug);
        console.log(`Created fallback flyer for ${concert.slug}`);
    }

    await supabase(`concerts?id=eq.${concert.id}`, {
        method: "PATCH",
        body: JSON.stringify({ poster_image: hostedUrl, updated_at: new Date().toISOString() }),
    });
    hostedByConcertId.set(concert.id, hostedUrl);
    console.log(`Hosted ${concert.slug}`);
}

const articles = await supabase("articles?select=id,slug,linked_concert_ids");
for (const article of articles) {
    const linkedPoster = article.linked_concert_ids?.map((id) => hostedByConcertId.get(id)).find(Boolean);
    if (!linkedPoster) continue;
    await supabase(`articles?id=eq.${article.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cover_image: linkedPoster, updated_at: new Date().toISOString() }),
    });
    console.log(`Updated article ${article.slug}`);
}
