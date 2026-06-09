import ArticleSubcategoryPage from "@/components/ArticleSubcategoryPage";

interface PageProps {
    params: Promise<{ subcategory: string }>;
}

export default async function HobbiesSubcategoryPage({ params }: PageProps) {
    const { subcategory } = await params;
    return <ArticleSubcategoryPage category="hobbies" subcategory={subcategory} />;
}
