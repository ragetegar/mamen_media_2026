"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Concert } from "@/lib/types";

interface RelatedConcertMultiSelectProps {
    concerts: Concert[];
    selectedIds: string[];
    onToggle: (concertId: string) => void;
}

export default function RelatedConcertMultiSelect({
    concerts,
    selectedIds,
    onToggle,
}: RelatedConcertMultiSelectProps) {
    const [query, setQuery] = useState("");
    const normalizedQuery = query.trim().toLowerCase();

    const selectedConcerts = useMemo(
        () => selectedIds
            .map((id) => concerts.find((concert) => concert.id === id))
            .filter((concert): concert is Concert => Boolean(concert)),
        [concerts, selectedIds],
    );

    const matches = useMemo(() => {
        if (!normalizedQuery) return [];

        return concerts
            .filter((concert) => {
                const searchableText = [
                    concert.title,
                    concert.city,
                    concert.venue,
                    concert.concert_type,
                ].join(" ").toLowerCase();

                return searchableText.includes(normalizedQuery);
            })
            .slice(0, 8);
    }, [concerts, normalizedQuery]);

    return (
        <div className="space-y-3">
            {selectedConcerts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedConcerts.map((concert) => (
                        <button
                            key={concert.id}
                            type="button"
                            onClick={() => onToggle(concert.id)}
                            className="flex max-w-full items-center gap-2 border-2 border-mamen-magenta bg-mamen-magenta/10 px-2.5 py-1.5 text-left text-xs font-bold text-mamen-white transition-colors hover:bg-mamen-magenta/20"
                            aria-label={`Remove ${concert.title}`}
                        >
                            <span className="truncate">{concert.title}</span>
                            <X size={13} className="shrink-0 text-mamen-magenta" />
                        </button>
                    ))}
                </div>
            )}

            <div className="relative">
                <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mamen-gray-200"
                />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="w-full border-2 border-mamen-gray-700 bg-mamen-gray-800 py-3 pl-11 pr-4 text-sm text-mamen-white transition-colors placeholder:text-mamen-gray-700 focus:border-mamen-purple focus:outline-none"
                    placeholder="Search concert by title, city, venue, or type..."
                />
            </div>

            {normalizedQuery && (
                <div className="max-h-72 overflow-y-auto border-2 border-mamen-gray-700 bg-mamen-gray-900">
                    {matches.length > 0 ? (
                        matches.map((concert) => {
                            const checked = selectedIds.includes(concert.id);

                            return (
                                <button
                                    key={concert.id}
                                    type="button"
                                    onClick={() => onToggle(concert.id)}
                                    className={`flex w-full items-center gap-3 border-b border-mamen-gray-700 px-3 py-3 text-left transition-colors last:border-b-0 ${
                                        checked
                                            ? "bg-mamen-magenta/10 text-mamen-white"
                                            : "text-mamen-gray-200 hover:bg-mamen-gray-800 hover:text-mamen-white"
                                    }`}
                                >
                                    <span
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${
                                            checked
                                                ? "border-mamen-magenta bg-mamen-magenta text-white"
                                                : "border-mamen-gray-700"
                                        }`}
                                    >
                                        {checked && <Check size={13} strokeWidth={3} />}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate text-xs font-bold">{concert.title}</span>
                                        <span className="block text-xs text-mamen-gray-700">
                                            {concert.city} · {concert.venue} · {concert.concert_type}
                                        </span>
                                    </span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="px-4 py-5 text-sm text-mamen-gray-200">
                            No concerts match “{query.trim()}”.
                        </p>
                    )}
                </div>
            )}

            <p className="text-xs text-mamen-gray-700">
                {selectedIds.length} selected. Search and check multiple concerts.
            </p>
        </div>
    );
}
