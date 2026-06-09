import NestedArticlePage, { getNestedArticleMetadata } from "@/components/NestedArticlePage";

interface PageProps {
    params: Promise<{ subcategory: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return getNestedArticleMetadata({ category: "music", subcategory, slug });
}

export default async function MusicArticlePage({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return <NestedArticlePage category="music" subcategory={subcategory} slug={slug} />;
}
