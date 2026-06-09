import ArticleSubcategoryPage from "@/components/ArticleSubcategoryPage";

interface PageProps {
    params: Promise<{ subcategory: string }>;
}

export default async function MusicSubcategoryPage({ params }: PageProps) {
    const { subcategory } = await params;
    return <ArticleSubcategoryPage category="music" subcategory={subcategory} />;
}
