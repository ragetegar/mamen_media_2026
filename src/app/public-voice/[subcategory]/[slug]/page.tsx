import NestedArticlePage, { getNestedArticleMetadata } from "@/components/NestedArticlePage";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ subcategory: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return getNestedArticleMetadata({ category: "public-voice", subcategory, slug });
}

export default async function PublicVoiceArticlePage({ params }: PageProps) {
    const { subcategory, slug } = await params;
    return <NestedArticlePage category="public-voice" subcategory={subcategory} slug={slug} />;
}
