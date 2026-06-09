import ArticleDetailPage from "@/components/ArticleDetailPage";
import { Metadata } from "next";
import { getArticleBySlug } from "@/lib/data";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article || article.category !== "news") return { title: "Article Not Found" };

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

export default async function NewsArticlePage({ params }: PageProps) {
    const { slug } = await params;
    return <ArticleDetailPage slug={slug} expectedCategory="news" />;
}
