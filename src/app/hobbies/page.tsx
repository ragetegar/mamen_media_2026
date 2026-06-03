import CategoryListingPage from "@/components/CategoryListingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Hobbies",
    description: "Gaming, anime, JKT48, and all things hobbies from the Indonesian scene.",
};

const subcategories = [
    { value: "gaming", label: "Gaming" },
    { value: "anime", label: "Anime" },
    { value: "jkt48", label: "JKT48" },
];

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function HobbiesPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    return (
        <CategoryListingPage
            category="hobbies"
            title="ALL"
            highlight="HOBBIES"
            description="Gaming, anime, JKT48, and all things hobbies from the Indonesian scene."
            subcategories={subcategories}
            activeSub={sub || null}
        />
    );
}
