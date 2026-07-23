import CategoryListingPage from "@/components/CategoryListingPage";
import { ARTICLE_TAXONOMY } from "@/lib/article-taxonomy";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Music",
    description: "Music reviews, merch recommendations, and everything that sounds good.",
};

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function MusicPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    if (sub) redirect("/");

    return (
        <CategoryListingPage
            category="music"
            title="ALL"
            highlight="MUSIC"
            description="Music reviews, merch recommendations, and everything that sounds good."
            subcategories={ARTICLE_TAXONOMY.music}
        />
    );
}
