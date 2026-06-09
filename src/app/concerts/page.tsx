import SectionHeader from "@/components/SectionHeader";
import { getConcerts } from "@/lib/data";
import ConcertFilters from "./ConcertFilters";
import { ConcertType } from "@/lib/types";

export default async function ConcertsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const params = await searchParams;
    const type = (params?.type as ConcertType | "all") || "all";

    // Fetch initial data on the server — instant HTML
    const concerts = await getConcerts({
        hidePast: true, 
        sort: "soonest",
        type: type === "all" ? undefined : (type as ConcertType)
    });

    return (
        <>
            {/* Header */}
            <section className="bg-mamen-black py-12 md:py-16 border-b-4 border-mamen-magenta">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionHeader title="UPCOMING" highlight="CONCERTS" />
                    <p className="text-mamen-gray-200 text-base max-w-lg -mt-4">
                        Find the hottest festivals, local gigs, international tours, and K-Pop events.
                    </p>
                </div>
            </section>

            {/* Filters + Grid (client-side for interactivity) */}
            <ConcertFilters initialConcerts={concerts} initialType={type} />
        </>
    );
}
