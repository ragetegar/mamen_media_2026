import type { MetadataRoute } from "next";
import { getArticles, getConcerts } from "@/lib/data";
import { getArticleHref } from "@/lib/article-taxonomy";
import { absoluteUrl } from "@/lib/site";

const staticRoutes = [
    "",
    "/public-voice",
    "/concerts",
    "/music",
    "/lifestyle",
    "/sports",
    "/hobbies",
    "/barengan",
    "/about",
    "/privacy",
    "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [articles, concerts] = await Promise.all([
        getArticles(undefined, undefined, 1000),
        getConcerts({ hidePast: false, limit: 1000 }),
    ]);

    return [
        ...staticRoutes.map((route) => ({
            url: absoluteUrl(route || "/"),
            lastModified: new Date(),
            changeFrequency: route === "" ? "daily" as const : "weekly" as const,
            priority: route === "" ? 1 : 0.7,
        })),
        ...articles.map((article) => ({
            url: absoluteUrl(getArticleHref(article)),
            lastModified: new Date(article.updated_at || article.published_at || Date.now()),
            changeFrequency: "weekly" as const,
            priority: article.category === "public-voice" ? 0.6 : 0.8,
        })),
        ...concerts.map((concert) => ({
            url: absoluteUrl(`/concerts/${concert.slug}`),
            lastModified: new Date(concert.updated_at || concert.created_at || Date.now()),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        })),
    ];
}
