import CategoryListingPage from "@/components/CategoryListingPage";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Public Voice",
    description: "Suara, keresahan, dan perspektif publik tentang isu yang sedang dibicarakan.",
};

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: Promise<{ sub?: string }>;
}

export default async function PublicVoicePage({ searchParams }: PageProps) {
    const { sub } = await searchParams;
    if (sub) redirect("/");

    return (
        <CategoryListingPage
            category="public-voice"
            title="PUBLIC"
            highlight="VOICE"
            description="Suara, keresahan, dan perspektif publik tentang isu yang sedang dibicarakan."
            subcategories={[]}
        />
    );
}
