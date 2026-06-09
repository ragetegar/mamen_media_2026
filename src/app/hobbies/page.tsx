import CategoryListingPage from "@/components/CategoryListingPage";
import { ARTICLE_TAXONOMY } from "@/lib/article-taxonomy";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Hobbies",
    description: "Gaming, anime, JKT48, and all things hobbies from the Indonesian scene.",
};

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function HobbiesPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    if (sub) notFound();
    return (
        <CategoryListingPage
            category="hobbies"
            title="ALL"
            highlight="HOBBIES"
            description="Gaming, anime, JKT48, and all things hobbies from the Indonesian scene."
            subcategories={ARTICLE_TAXONOMY.hobbies}
        />
    );
}
