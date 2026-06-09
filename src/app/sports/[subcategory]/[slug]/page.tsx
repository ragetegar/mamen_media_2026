import NestedArticlePage, { getNestedArticleMetadata } from "@/components/NestedArticlePage";

interface PageProps {
    params: Promise<{ subcategory: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return getNestedArticleMetadata({ category: "sports", subcategory, slug });
}

export default async function SportsArticlePage({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return <NestedArticlePage category="sports" subcategory={subcategory} slug={slug} />;
}
