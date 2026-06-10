"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Concert } from "@/lib/types";
import { Calendar, MapPin, ChevronLeft, ChevronRight, History } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProfileConcertItem {
    concert: Concert;
    source: string;
    created_at: string;
}

// ── Pagination constants ──
const PER_PAGE = 8;

// ── Component ──

interface ProfileConcertsProps {
    userId: string;
    mode: "attending" | "history";
}

export default function ProfileConcerts({ userId, mode }: ProfileConcertsProps) {
    const [concertItems, setConcertItems] = useState<ProfileConcertItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [mode]);

    useEffect(() => {
        if (!userId) return;

        async function fetchData() {
            setLoading(true);
            try {
                // Fetch concert attendance with source info
                const { data: attendRows, error: attendError } = await supabase
                    .from("concert_attendees")
                    .select("concert_id, source, created_at")
                    .eq("user_id", userId)
                    .order("created_at", { ascending: false });

                if (attendError || !attendRows || attendRows.length === 0) {
                    setConcertItems([]);
                    return;
                }

                const concertIds = attendRows.map((row) => row.concert_id);
                const { data: concerts, error: concertError } = await supabase
                    .from("concerts")
                    .select("*")
                    .in("id", concertIds);

                if (concertError || !concerts) {
                    setConcertItems([]);
                    return;
                }

                const concertMap: Record<string, Concert> = {};
                concerts.forEach((concert) => { concertMap[concert.id] = concert as Concert; });

                const items: ProfileConcertItem[] = attendRows
                    .filter((row) => concertMap[row.concert_id])
                    .map((row) => ({
                        concert: concertMap[row.concert_id],
                        source: row.source || "manual",
                        created_at: row.created_at,
                    }));

                setConcertItems(items);
            } catch (err) {
                console.error("Error fetching concert data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="py-12 text-center border-2 border-dashed border-mamen-gray-800 animate-pulse">
                <Calendar className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                <p className="text-mamen-gray-700 font-headline text-base font-bold">
                    Loading concerts...
                </p>
            </div>
        );
    }

    const now = Date.now();
    const visibleModeItems = concertItems
        .filter((item) => {
            const eventEnd = new Date(item.concert.end_datetime || item.concert.start_datetime).getTime();
            return mode === "attending" ? eventEnd >= now : eventEnd < now;
        })
        .sort((a, b) => {
            const aEnd = new Date(a.concert.end_datetime || a.concert.start_datetime).getTime();
            const bEnd = new Date(b.concert.end_datetime || b.concert.start_datetime).getTime();
            return mode === "attending" ? aEnd - bEnd : bEnd - aEnd;
        });

    if (visibleModeItems.length === 0) {
        const EmptyIcon = mode === "attending" ? Calendar : History;
        return (
            <div className="py-12 text-center border-2 border-dashed border-mamen-gray-800">
                <EmptyIcon className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                <p className="text-mamen-gray-700 font-headline text-base font-bold">
                    {mode === "attending"
                        ? "No upcoming attending concerts yet."
                        : "No concert history yet."}
                </p>
            </div>
        );
    }

    // Pagination
    const totalPages = Math.ceil(visibleModeItems.length / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const visible = visibleModeItems.slice(start, start + PER_PAGE);

    return (
        <div className="space-y-4">
            {visible.map((item) => {
                const eventDate = new Date(item.concert.start_datetime);
                const isHistory = mode === "history";

                return (
                    <Link
                        key={item.concert.id}
                        href={`/concerts/${item.concert.slug}`}
                        className="group flex gap-4 bg-mamen-gray-900 border-2 border-mamen-gray-800 hover:border-mamen-purple transition-colors p-3"
                    >
                        {/* Poster thumbnail */}
                        <div className="relative w-16 h-20 sm:w-20 sm:h-[100px] shrink-0 overflow-hidden border border-mamen-gray-700">
                            <Image
                                src={item.concert.poster_image}
                                alt={item.concert.title}
                                fill
                                className="object-cover"
                                sizes="80px"
                            />
                            {isHistory && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-[9px] font-headline font-bold text-white uppercase tracking-wider opacity-80">Attended</span>
                                </div>
                            )}
                        </div>

                        {/* Concert info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className="font-headline text-sm font-bold text-mamen-white group-hover:text-mamen-purple transition-colors line-clamp-2 leading-tight">
                                {item.concert.title}
                            </h4>
                            <div className="mt-1.5 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-xs text-mamen-gray-400">
                                    <Calendar size={12} className="shrink-0" />
                                    <span>
                                        {eventDate.toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-mamen-gray-400">
                                    <MapPin size={12} className="shrink-0" />
                                    <span className="truncate">{item.concert.venue}, {item.concert.city}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 text-mamen-gray-200 hover:text-mamen-lime transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="font-headline text-xs font-bold tracking-wider text-mamen-gray-200 uppercase">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="p-2 text-mamen-gray-200 hover:text-mamen-lime transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
