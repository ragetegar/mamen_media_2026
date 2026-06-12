import { Article, ArticleCategory, ArticleSubcategory } from "./types";

export const ARTICLE_TAXONOMY = {
    "public-voice": [
        { value: "opinion", label: "Public Voice" },
    ],
    music: [
        { value: "review", label: "Music Review" },
        { value: "news", label: "News" },
        { value: "merch", label: "Merch" },
    ],
    lifestyle: [
        { value: "fashion", label: "Fashion" },
        { value: "sneaker", label: "Sneakers" },
        { value: "health", label: "Health" },
    ],
    sports: [
        { value: "football", label: "Football" },
        { value: "basketball", label: "Basketball" },
        { value: "esports", label: "Esports" },
    ],
    hobbies: [
        { value: "gaming", label: "Gaming" },
        { value: "anime", label: "Anime" },
        { value: "jkt48", label: "JKT48" },
    ],
} as const satisfies Record<ArticleCategory, readonly { value: ArticleSubcategory; label: string }[]>;

export function isArticleCategory(value: string): value is ArticleCategory {
    return value in ARTICLE_TAXONOMY;
}

export function isValidArticleTaxonomy(category: string, subcategory: string): boolean {
    if (!isArticleCategory(category)) return false;
    return ARTICLE_TAXONOMY[category].some((item) => item.value === subcategory);
}

export function getArticleSubcategoryLabel(article: Pick<Article, "category" | "subcategory">): string {
    return ARTICLE_TAXONOMY[article.category].find((item) => item.value === article.subcategory)?.label
        || article.subcategory;
}

export function getArticleCategoryLabel(category: ArticleCategory): string {
    if (category === "public-voice") return "Public Voice";
    return category.charAt(0).toUpperCase() + category.slice(1);
}

export function getArticleHref(article: Pick<Article, "category" | "subcategory" | "slug">): string {
    return `/${article.category}/${article.subcategory}/${article.slug}`;
}

export function getArticleSubcategoryHref(category: ArticleCategory, subcategory: ArticleSubcategory): string {
    return `/${category}/${subcategory}`;
}
