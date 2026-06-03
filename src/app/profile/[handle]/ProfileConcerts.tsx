"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Concert } from "@/lib/types";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ── Supabase-backed attendance helpers ──

export async function loadUserConcertIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("concert_attendees")
        .select("concert_id")
        .eq("user_id", userId);

    if (error) {
        console.error("Error loading concert attendance:", error);
        return [];
    }
    return (data || []).map((row) => row.concert_id);
}

export async function saveUserConcert(userId: string, concertId: string) {
    const { error } = await supabase
        .from("concert_attendees")
        .insert({ user_id: userId, concert_id: concertId });

    if (error && error.code !== "23505") {
        console.error("Error saving concert attendance:", error);
    }
}

export async function removeUserConcert(userId: string, concertId: string) {
    const { error } = await supabase
        .from("concert_attendees")
        .delete()
        .eq("user_id", userId)
        .eq("concert_id", concertId);

    if (error) {
        console.error("Error removing concert attendance:", error);
    }
}

// ── Types for concert history ──
interface ConcertHistoryItem {
    concert: Concert;
    source: string;
    created_at: string;
}

// ── Pagination constants ──
const PER_PAGE = 8;

// ── Component ──

export default function ProfileConcerts({ userId }: { userId: string }) {
    const [history, setHistory] = useState<ConcertHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

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
                    setHistory([]);
                    return;
                }

                const concertIds = attendRows.map((r: any) => r.concert_id);
                const { data: concerts, error: concertError } = await supabase
                    .from("concerts")
                    .select("*")
                    .in("id", concertIds);

                if (concertError || !concerts) {
                    setHistory([]);
                    return;
                }

                const concertMap: Record<string, Concert> = {};
                concerts.forEach((c: any) => { concertMap[c.id] = c as Concert; });

                const items: ConcertHistoryItem[] = attendRows
                    .filter((r: any) => concertMap[r.concert_id])
                    .map((r: any) => ({
                        concert: concertMap[r.concert_id],
                        source: r.source || "manual",
                        created_at: r.created_at,
                    }));

                setHistory(items);
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

    if (history.length === 0) {
        return (
            <div className="py-12 text-center border-2 border-dashed border-mamen-gray-800">
                <Calendar className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                <p className="text-mamen-gray-700 font-headline text-base font-bold">
                    No attending concerts yet.
                </p>
            </div>
        );
    }

    // Split into upcoming / past
    const now = new Date();
    const upcoming = history.filter((h) => new Date(h.concert.start_datetime) >= now);
    const past = history.filter((h) => new Date(h.concert.start_datetime) < now);
    const allSorted = [...upcoming, ...past];

    // Pagination
    const totalPages = Math.ceil(allSorted.length / PER_PAGE);
    const start = (page - 1) * PER_PAGE;
    const visible = allSorted.slice(start, start + PER_PAGE);

    return (
        <div className="space-y-4">
            {visible.map((item) => {
                const eventDate = new Date(item.concert.start_datetime);
                const isPast = eventDate < now;

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
                            {isPast && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-[9px] font-headline font-bold text-white uppercase tracking-wider opacity-80">Past</span>
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
