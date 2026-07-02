import ArticleSubcategoryPage from "@/components/ArticleSubcategoryPage";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ subcategory: string }>;
}

export default async function PublicVoiceSubcategoryPage({ params }: PageProps) {
    const { subcategory } = await params;
    return <ArticleSubcategoryPage category="public-voice" subcategory={subcategory} />;
}
