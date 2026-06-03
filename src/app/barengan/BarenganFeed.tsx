"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import BarenganCard from "@/components/BarenganCard";
import { getBarenganPosts } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";
import { BarenganPost } from "@/lib/types";
import { Plus, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface BarenganFeedProps {
    initialPosts: BarenganPost[];
    concertSlug?: string | null;
}

export default function BarenganFeed({ initialPosts, concertSlug }: BarenganFeedProps) {
    const { user } = useAuth();
    const [posts, setPosts] = useState<BarenganPost[]>(initialPosts);
    const [sort, setSort] = useState<"latest" | "concert_date">("latest");
    const [loading, setLoading] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);

    useEffect(() => {
        if (!hasChanged) return;

        let isMounted = true;
        setLoading(true);

        async function fetchPosts() {
            try {
                const data = await getBarenganPosts({
                    concertSlug: concertSlug || undefined,
                    sort,
                });
                if (isMounted) setPosts(data);
            } catch (error) {
                console.error("Failed to fetch barengan posts:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchPosts();
        return () => { isMounted = false; };
    }, [sort, hasChanged, concertSlug]);

    return (
        <>
            {/* Sort & Filter Bar */}
            <section className="bg-mamen-gray-900 border-b-4 border-mamen-black sticky top-16 z-40">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex gap-1">
                            {[
                                { value: "latest" as const, label: "Latest" },
                                { value: "concert_date" as const, label: "Concert Date" },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => { setHasChanged(true); setSort(option.value); }}
                                    className={`font-headline text-xs font-bold tracking-widest uppercase px-3 py-1.5 border-2 transition-all cursor-pointer ${sort === option.value
                                        ? "bg-mamen-lime text-mamen-black border-mamen-black"
                                        : "bg-transparent text-mamen-gray-200 border-transparent hover:text-mamen-lime"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                            {/* For You — Coming Soon */}
                            <div className="relative group">
                                <button
                                    disabled
                                    className="font-headline text-xs font-bold tracking-widest uppercase px-3 py-1.5 border-2 border-transparent text-mamen-gray-700 cursor-not-allowed"
                                >
                                    For You
                                </button>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-mamen-gray-800 text-mamen-gray-200 text-[10px] font-headline font-bold tracking-wider uppercase whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-mamen-gray-700">
                                    Coming Soon
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {concertSlug && (
                                <Link
                                    href="/barengan"
                                    className="text-xs text-mamen-magenta font-headline font-bold tracking-widest uppercase hover:text-mamen-purple transition-colors"
                                >
                                    Clear filter ×
                                </Link>
                            )}

                            {user && (
                                <Link href="/barengan/create">
                                    <Button variant="lime" size="sm">
                                        <Plus size={16} className="mr-1" />
                                        Post
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feed */}
            <section className="bg-mamen-black py-8 md:py-12 min-h-[50vh]">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="card-frame overflow-hidden mb-4">
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-mamen-purple border-2 border-mamen-black flex items-center justify-center font-headline font-black text-white shrink-0">
                                {user?.name?.[0]?.toUpperCase() || <Sparkles size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-mamen-gray-200">
                                    {user ? "What event do you want to watch together?" : "Login to request joins or start your own barengan."}
                                </p>
                                <p className="text-xs text-mamen-gray-700 mt-0.5">
                                    Requests stay private until the creator approves them.
                                </p>
                            </div>
                            {user && (
                                <Link href="/barengan/create" className="shrink-0">
                                    <Button variant="lime" size="sm">
                                        <Plus size={16} className="mr-1" />
                                        Post
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-purple"></div>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="space-y-4">
                            {posts.map((post) => (
                                <BarenganCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-4 border-dashed border-mamen-gray-800">
                            <p className="font-headline text-2xl font-bold text-mamen-gray-700 mb-2">
                                No barengan posts yet
                            </p>
                            <p className="text-sm text-mamen-gray-700 mb-6">
                                Be the first to find a concert buddy!
                            </p>
                            {user && (
                                <Link href="/barengan/create">
                                    <Button variant="lime">
                                        <Plus size={16} className="mr-1" />
                                        Create Post
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
