export function getSiteUrl() {
    return (
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "https://mamen.id"
    ).replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
    if (/^https?:\/\//i.test(path)) return path;
    return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
