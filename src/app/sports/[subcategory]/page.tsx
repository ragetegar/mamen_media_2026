import ArticleSubcategoryPage from "@/components/ArticleSubcategoryPage";

interface PageProps {
    params: Promise<{ subcategory: string }>;
}

export default async function SportsSubcategoryPage({ params }: PageProps) {
    const { subcategory } = await params;
    return <ArticleSubcategoryPage category="sports" subcategory={subcategory} />;
}
