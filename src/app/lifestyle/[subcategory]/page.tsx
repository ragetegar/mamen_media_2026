import ArticleSubcategoryPage from "@/components/ArticleSubcategoryPage";

interface PageProps {
    params: Promise<{ subcategory: string }>;
}

export default async function LifestyleSubcategoryPage({ params }: PageProps) {
    const { subcategory } = await params;
    return <ArticleSubcategoryPage category="lifestyle" subcategory={subcategory} />;
}
