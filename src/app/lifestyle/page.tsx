import CategoryListingPage from "@/components/CategoryListingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lifestyle",
    description: "Fashion, sneakers, health, and everything lifestyle from the Indonesian scene.",
};

const subcategories = [
    { value: "fashion", label: "Fashion" },
    { value: "sneaker", label: "Sneakers" },
    { value: "health", label: "Health" },
];

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function LifestylePage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    return (
        <CategoryListingPage
            category="lifestyle"
            title="ALL"
            highlight="LIFESTYLE"
            description="Fashion, sneakers, health, and everything lifestyle from the Indonesian scene."
            subcategories={subcategories}
            activeSub={sub || null}
        />
    );
}
