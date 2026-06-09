import CategoryListingPage from "@/components/CategoryListingPage";
import { ARTICLE_TAXONOMY } from "@/lib/article-taxonomy";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Sports",
    description: "Football, basketball, esports, and all sports coverage from Indonesia.",
};

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function SportsPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    if (sub) notFound();
    return (
        <CategoryListingPage
            category="sports"
            title="ALL"
            highlight="SPORTS"
            description="Football, basketball, esports, and all sports coverage from Indonesia."
            subcategories={ARTICLE_TAXONOMY.sports}
        />
    );
}
