import CategoryListingPage from "@/components/CategoryListingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Music",
    description: "Music reviews, news, merch recommendations, and everything that sounds good.",
};

const subcategories = [
    { value: "review", label: "Music Review" },
    { value: "news", label: "News" },
    { value: "merch", label: "Merch" },
];

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function MusicPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    return (
        <CategoryListingPage
            category="music"
            title="ALL"
            highlight="MUSIC"
            description="Music reviews, news, merch recommendations, and everything that sounds good."
            subcategories={subcategories}
            activeSub={sub || null}
        />
    );
}
