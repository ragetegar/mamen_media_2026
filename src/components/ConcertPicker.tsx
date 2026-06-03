"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Concert } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Search, X } from "lucide-react";

interface ConcertPickerProps {
    onSelect: (concert: Concert) => void;
    selectedConcert?: Concert | null;
}

export default function ConcertPicker({ onSelect, selectedConcert }: ConcertPickerProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Concert[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            const { data } = await supabase
                .from("concerts")
                .select("*")
                .ilike("title", `%${query}%`)
                .order("start_datetime", { ascending: true })
                .limit(8);

            setResults((data as Concert[]) || []);
            setLoading(false);
            setIsOpen(true);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (selectedConcert) {
        return (
            <div className="flex items-center gap-3 p-3 bg-mamen-gray-900 border-2 border-mamen-purple">
                <div className="w-12 h-16 shrink-0 relative overflow-hidden border border-mamen-gray-700">
                    <Image
                        src={selectedConcert.poster_image}
                        alt={selectedConcert.title}
                        fill
                        className="object-cover"
                        sizes="48px"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-headline text-sm font-bold text-mamen-white truncate">
                        {selectedConcert.title}
                    </p>
                    <p className="text-xs text-mamen-gray-700">
                        {new Date(selectedConcert.start_datetime).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })} · {selectedConcert.venue}
                    </p>
                </div>
                <button
                    onClick={() => onSelect(null as any)}
                    className="p-1 text-mamen-gray-700 hover:text-mamen-white cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div className="flex items-center gap-2 border-2 border-mamen-gray-700 bg-mamen-gray-900 p-3 focus-within:border-mamen-purple transition-colors">
                <Search size={16} className="text-mamen-gray-700 shrink-0" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a concert..."
                    className="bg-transparent text-mamen-white text-sm w-full outline-none placeholder:text-mamen-gray-700"
                />
                {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-t border-b border-mamen-purple shrink-0" />
                )}
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-mamen-gray-900 border-2 border-mamen-gray-700 max-h-64 overflow-y-auto z-50">
                    {results.map((concert) => (
                        <button
                            key={concert.id}
                            onClick={() => {
                                onSelect(concert);
                                setQuery("");
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-3 p-3 hover:bg-mamen-gray-800 transition-colors text-left cursor-pointer"
                        >
                            <div className="w-8 h-11 shrink-0 relative overflow-hidden border border-mamen-gray-700">
                                <Image
                                    src={concert.poster_image}
                                    alt={concert.title}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-mamen-white truncate font-headline">
                                    {concert.title}
                                </p>
                                <p className="text-xs text-mamen-gray-700">
                                    {new Date(concert.start_datetime).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })} · {concert.city}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && !loading && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-mamen-gray-900 border-2 border-mamen-gray-700 p-4 text-center text-sm text-mamen-gray-700">
                    No concerts found for &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}
