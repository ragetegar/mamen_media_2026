import CategoryListingPage from "@/components/CategoryListingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sports",
    description: "Football, basketball, esports, and all sports coverage from Indonesia.",
};

const subcategories = [
    { value: "football", label: "Football" },
    { value: "basketball", label: "Basketball" },
    { value: "esports", label: "Esports" },
];

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function SportsPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    return (
        <CategoryListingPage
            category="sports"
            title="ALL"
            highlight="SPORTS"
            description="Football, basketball, esports, and all sports coverage from Indonesia."
            subcategories={subcategories}
            activeSub={sub || null}
        />
    );
}
