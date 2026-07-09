import sanitizeHtml from "sanitize-html";

export function sanitizeArticleHtml(html: string) {
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img",
            "h1",
            "h2",
            "h3",
            "iframe",
            "figure",
            "figcaption",
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            a: ["href", "name", "target", "rel"],
            img: ["src", "alt", "title", "width", "height", "loading"],
            iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "frameborder"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        allowedIframeHostnames: ["www.youtube.com", "youtube.com", "open.spotify.com"],
        transformTags: {
            a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }, true),
        },
    });
}
