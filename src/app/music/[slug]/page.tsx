import ArticleDetailPage from "@/components/ArticleDetailPage";
import { Metadata } from "next";
import { getArticleBySlug, mockArticles } from "@/lib/data";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return mockArticles
        .filter((a) => a.category === "music")
        .map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) return { title: "Article Not Found" };

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

export default async function MusicArticlePage({ params }: PageProps) {
    const { slug } = await params;
    return <ArticleDetailPage slug={slug} expectedCategory="music" />;
}
