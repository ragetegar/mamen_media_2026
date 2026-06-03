import SectionHeader from "@/components/SectionHeader";
import { getBarenganPosts } from "@/lib/data";
import BarenganFeed from "./BarenganFeed";

interface PageProps {
    searchParams: Promise<{ concert?: string }>;
}

export default async function BarenganPage({ searchParams }: PageProps) {
    const { concert: concertSlug } = await searchParams;

    // Fetch initial data on the server — instant HTML
    const posts = await getBarenganPosts({
        concertSlug: concertSlug || undefined,
        sort: "latest",
    });

    return (
        <>
            {/* Header */}
            <section className="bg-mamen-black py-12 md:py-16 border-b-4 border-mamen-purple">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader title="BAREN" highlight="GAN" />
                    <p className="text-mamen-gray-200 text-base max-w-lg -mt-4">
                        Find your concert buddy! Post or browse to find strangers to watch concerts together.
                    </p>
                </div>
            </section>

            {/* Feed (client-side for sort interactivity) */}
            <BarenganFeed initialPosts={posts} concertSlug={concertSlug} />
        </>
    );
}
