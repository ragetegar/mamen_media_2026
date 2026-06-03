"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ConcertTile from "@/components/ConcertTile";
import { getConcerts } from "@/lib/data";
import { ConcertType, ConcertSort, CONCERT_TYPES, CONCERT_SORT_OPTIONS } from "@/lib/types";

const cities = ["All", "Jakarta", "Bandung", "Bali"];

interface ConcertFiltersProps {
    initialConcerts: any[];
    initialType?: ConcertType | "all";
}

export default function ConcertFilters({ initialConcerts, initialType = "all" }: ConcertFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [selectedCity, setSelectedCity] = useState("All");
    const [selectedType, setSelectedType] = useState<ConcertType | "all">(initialType);
    const [selectedSort, setSelectedSort] = useState<ConcertSort>("soonest");
    const [hidePast, setHidePast] = useState(true);
    const [concerts, setConcerts] = useState<any[]>(initialConcerts);
    const [loading, setLoading] = useState(false);
    const [hasFiltered, setHasFiltered] = useState(false);

    useEffect(() => {
        // Skip the first render since we have initial data
        if (!hasFiltered) return;

        let isMounted = true;
        setLoading(true);

        async function fetchConcerts() {
            try {
                const data = await getConcerts({
                    city: selectedCity === "All" ? undefined : selectedCity,
                    type: selectedType === "all" ? undefined : selectedType,
                    sort: selectedSort,
                    hidePast: hidePast,
                });
                if (isMounted) setConcerts(data);
            } catch (error) {
                console.error("Failed to fetch concerts:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchConcerts();
        return () => { isMounted = false; };
    }, [selectedCity, selectedType, selectedSort, hidePast, hasFiltered]);

    const handleFilterChange = (setter: Function, value: any) => {
        setHasFiltered(true);
        setter(value);
    };

    const handleTypeChange = (value: ConcertType | "all") => {
        setHasFiltered(true);
        setSelectedType(value);

        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") {
            params.delete("type");
        } else {
            params.set("type", value);
        }
        // Change URL to reflect new filter state without full reload
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    return (
        <>
            {/* Filters */}
            <section className="bg-mamen-gray-900 border-b-4 border-mamen-black sticky top-16 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col gap-4">
                        {/* Row 1: Type + City */}
                        <div className="flex flex-col md:flex-row gap-4 md:items-center">
                            <div className="flex gap-4 items-center">
                                <span className="font-headline text-xs font-bold tracking-widest text-mamen-gray-200 uppercase shrink-0">Type:</span>
                                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                    <button onClick={() => handleTypeChange("all")}
                                        className={`font-headline text-xs font-bold tracking-widest uppercase px-3 py-1.5 shrink-0 border-2 transition-all cursor-pointer ${selectedType === "all" ? "bg-mamen-purple text-mamen-white border-mamen-black" : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-purple"}`}>
                                        All
                                    </button>
                                    {CONCERT_TYPES.map((type) => (
                                        <button key={type.value} onClick={() => handleTypeChange(type.value)}
                                            className={`font-headline text-xs font-bold tracking-widest uppercase px-3 py-1.5 shrink-0 border-2 transition-all cursor-pointer ${selectedType === type.value ? "bg-mamen-purple text-mamen-white border-mamen-black" : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-purple"}`}>
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-4 items-center md:ml-auto">
                                <span className="font-headline text-xs font-bold tracking-widest text-mamen-gray-200 uppercase shrink-0">City:</span>
                                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                    {cities.map((city) => (
                                        <button key={city} onClick={() => handleFilterChange(setSelectedCity, city)}
                                            className={`font-headline text-xs font-bold tracking-widest uppercase px-3 py-1.5 shrink-0 border-2 transition-all cursor-pointer ${selectedCity === city ? "bg-mamen-magenta text-mamen-white border-mamen-black" : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-magenta"}`}>
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Sort + Hide Past */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center border-t border-mamen-gray-800 pt-3">
                            <div className="flex gap-4 items-center">
                                <span className="font-headline text-xs font-bold tracking-widest text-mamen-gray-200 uppercase shrink-0">Sort:</span>
                                <div className="flex gap-1">
                                    {CONCERT_SORT_OPTIONS.map((option) => (
                                        <button key={option.value} onClick={() => handleFilterChange(setSelectedSort, option.value)}
                                            className={`font-headline text-xs font-bold tracking-widest uppercase px-3 py-1.5 shrink-0 border-2 transition-all cursor-pointer ${selectedSort === option.value ? "bg-mamen-lime text-mamen-black border-mamen-black" : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-lime"}`}>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 sm:ml-auto">
                                <span className="font-headline text-xs font-bold tracking-widest text-mamen-gray-200 uppercase">Show past events</span>
                                <button onClick={() => { setHasFiltered(true); setHidePast(!hidePast); }}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${!hidePast ? "bg-mamen-purple" : "bg-mamen-gray-700"}`}
                                    role="switch" aria-checked={!hidePast}>
                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${!hidePast ? "translate-x-5" : "translate-x-0"}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Concert Grid */}
            <section className="bg-mamen-black py-12 md:py-16 min-h-[50vh]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-magenta"></div>
                        </div>
                    ) : concerts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {concerts.map((concert) => (
                                <ConcertTile key={concert.id} concert={concert} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-4 border-dashed border-mamen-gray-800">
                            <p className="font-headline text-2xl font-bold text-mamen-gray-700">No concerts found for this filter.</p>
                            <p className="mt-2 text-sm text-mamen-gray-700">Try a different city or event type.</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
