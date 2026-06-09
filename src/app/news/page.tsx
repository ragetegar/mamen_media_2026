import CategoryListingPage from "@/components/CategoryListingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "News",
    description: "Editorial news, concert announcements, and guides from MAMEN.",
};

const subcategories = [
    { value: "concert", label: "Concert News" },
    { value: "guide", label: "Guides" },
    { value: "general", label: "General News" },
];

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function NewsPage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    return (
        <CategoryListingPage
            category="news"
            title="LATEST"
            highlight="NEWS"
            description="Editorial news, concert announcements, and guides. Concert event pages remain under Concerts."
            subcategories={subcategories}
            activeSub={sub || null}
        />
    );
}
