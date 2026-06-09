import NestedArticlePage, { getNestedArticleMetadata } from "@/components/NestedArticlePage";

interface PageProps {
    params: Promise<{ subcategory: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return getNestedArticleMetadata({ category: "lifestyle", subcategory, slug });
}

export default async function LifestyleArticlePage({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return <NestedArticlePage category="lifestyle" subcategory={subcategory} slug={slug} />;
}
