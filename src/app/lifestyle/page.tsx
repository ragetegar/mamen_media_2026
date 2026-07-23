import CategoryListingPage from "@/components/CategoryListingPage";
import { ARTICLE_TAXONOMY } from "@/lib/article-taxonomy";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Lifestyle",
    description: "Fashion, sneakers, health, and everything lifestyle from the Indonesian scene.",
};

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function LifestylePage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    if (sub) redirect("/");
    return (
        <CategoryListingPage
            category="lifestyle"
            title="ALL"
            highlight="LIFESTYLE"
            description="Fashion, sneakers, health, and everything lifestyle from the Indonesian scene."
            subcategories={ARTICLE_TAXONOMY.lifestyle}
        />
    );
}
