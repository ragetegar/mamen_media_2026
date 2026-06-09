import NestedArticlePage, { getNestedArticleMetadata } from "@/components/NestedArticlePage";

interface PageProps {
    params: Promise<{ subcategory: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return getNestedArticleMetadata({ category: "hobbies", subcategory, slug });
}

export default async function HobbiesArticlePage({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return <NestedArticlePage category="hobbies" subcategory={subcategory} slug={slug} />;
}
