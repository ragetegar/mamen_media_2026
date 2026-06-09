import ArticleDetailPage from "@/components/ArticleDetailPage";
import { getArticleBySlug } from "@/lib/data";
import { isValidArticleTaxonomy } from "@/lib/article-taxonomy";
import { ArticleCategory } from "@/lib/types";
import { Metadata } from "next";

interface NestedArticlePageProps {
    category: ArticleCategory;
    subcategory: string;
    slug: string;
}

export async function getNestedArticleMetadata({
    category,
    subcategory,
    slug,
}: NestedArticlePageProps): Promise<Metadata> {
    if (!isValidArticleTaxonomy(category, subcategory)) return { title: "Article Not Found" };

    const article = await getArticleBySlug(slug);
    if (!article || article.category !== category || article.subcategory !== subcategory) {
        return { title: "Article Not Found" };
    }

    return {
        title: article.seo_title || article.title,
        description: article.seo_description || article.excerpt,
        openGraph: {
            title: article.seo_title || article.title,
            description: article.seo_description || article.excerpt,
            images: [article.cover_image],
            type: "article",
        },
    };
}

export default function NestedArticlePage({ category, subcategory, slug }: NestedArticlePageProps) {
    return <ArticleDetailPage slug={slug} expectedCategory={category} expectedSubcategory={subcategory} />;
}
