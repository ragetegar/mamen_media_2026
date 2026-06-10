export function normalizeArticleTag(tag: string) {
    let decodedTag = tag;

    try {
        decodedTag = decodeURIComponent(tag);
    } catch {
        // Keep the original value when it contains an incomplete URI escape.
    }

    return decodedTag.trim().toLocaleLowerCase("en-US").replace(/^#+/, "").replace(/\s+/g, " ");
}

export function getTagHref(tag: string) {
    return `/tag/${encodeURIComponent(normalizeArticleTag(tag))}`;
}
