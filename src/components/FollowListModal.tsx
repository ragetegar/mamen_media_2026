"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase";
import { ProfileSnippet } from "@/lib/types";
import FollowButton from "./FollowButton";
import Link from "next/link";

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    mode: "followers" | "following";
}

export default function FollowListModal({ isOpen, onClose, userId, mode: initialMode }: FollowListModalProps) {
    const [mode, setMode] = useState<"followers" | "following">(initialMode);
    const [profiles, setProfiles] = useState<ProfileSnippet[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);

    useEffect(() => {
        if (!isOpen || !userId) return;

        let mounted = true;
        const supabase = getBrowserSupabase();

        const fetchList = async () => {
            setLoading(true);
            try {
                const column = mode === "followers" ? "following_id" : "follower_id";
                const selectColumn = mode === "followers" ? "follower_id" : "following_id";

                // Get total count
                const { count } = await supabase
                    .from("follows")
                    .select("*", { count: "exact", head: true })
                    .eq(column, userId);

                // Get paginated IDs
                const { data, error } = await supabase
                    .from("follows")
                    .select(selectColumn)
                    .eq(column, userId)
                    .order("created_at", { ascending: false })
                    .range(offset, offset + PAGE_SIZE - 1);

                if (error || !data || data.length === 0) {
                    if (mounted) {
                        setProfiles([]);
                        setTotal(count || 0);
                        setLoading(false);
                    }
                    return;
                }

                const userIds = data.map((f: any) => f[selectColumn]);
                const { data: profileData } = await supabase
                    .from("profiles")
                    .select("id, name, handle, avatar")
                    .in("id", userIds);

                if (mounted) {
                    setProfiles((profileData || []) as ProfileSnippet[]);
                    setTotal(count || 0);
                }
            } catch {
                // Silently handle errors
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchList();

        return () => {
            mounted = false;
        };
    }, [isOpen, userId, mode, offset]);

    // Reset offset when mode changes
    useEffect(() => {
        setOffset(0);
    }, [mode]);

    if (!isOpen) return null;

    const hasMore = offset + PAGE_SIZE < total;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-mamen-gray-900 border-4 border-mamen-purple w-full max-w-md shadow-hard-purple max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-mamen-gray-800 shrink-0">
                    <h2 className="font-headline text-xl font-black text-mamen-white">
                        CONNECTIONS
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-mamen-gray-200 hover:text-mamen-white cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-mamen-gray-800 shrink-0">
                    <button
                        onClick={() => setMode("followers")}
                        className={`flex-1 py-3 text-sm font-headline font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            mode === "followers"
                                ? "text-mamen-purple border-b-2 border-mamen-purple"
                                : "text-mamen-gray-400 hover:text-mamen-gray-200"
                        }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setMode("following")}
                        className={`flex-1 py-3 text-sm font-headline font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            mode === "following"
                                ? "text-mamen-purple border-b-2 border-mamen-purple"
                                : "text-mamen-gray-400 hover:text-mamen-gray-200"
                        }`}
                    >
                        Following
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {loading && profiles.length === 0 ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mamen-purple"></div>
                        </div>
                    ) : profiles.length === 0 ? (
                        <p className="text-center text-mamen-gray-400 py-10 text-sm">
                            {mode === "followers" ? "No followers yet." : "Not following anyone yet."}
                        </p>
                    ) : (
                        <>
                            {profiles.map((profile) => (
                                <div key={profile.id} className="flex items-center gap-3 p-3 bg-mamen-gray-800 border border-mamen-gray-700">
                                    {/* Avatar */}
                                    <Link href={`/profile/${profile.handle}`} onClick={onClose} className="shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-mamen-purple flex items-center justify-center font-headline font-bold text-sm text-white overflow-hidden">
                                            {profile.avatar && profile.avatar.startsWith("http") ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                                            ) : (
                                                profile.name?.[0] || "?"
                                            )}
                                        </div>
                                    </Link>

                                    {/* Name + Handle */}
                                    <Link href={`/profile/${profile.handle}`} onClick={onClose} className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-mamen-white truncate">{profile.name}</p>
                                        <p className="text-xs text-mamen-gray-400 truncate">@{profile.handle}</p>
                                    </Link>

                                    {/* Follow Button */}
                                    <FollowButton targetUserId={profile.id} size="sm" />
                                </div>
                            ))}

                            {/* Pagination */}
                            <div className="flex justify-between items-center pt-2">
                                {offset > 0 && (
                                    <button
                                        onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                                        className="text-xs font-headline font-bold text-mamen-purple hover:text-purple-400 uppercase tracking-wider cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                )}
                                <div className="flex-1" />
                                {hasMore && (
                                    <button
                                        onClick={() => setOffset(offset + PAGE_SIZE)}
                                        className="text-xs font-headline font-bold text-mamen-purple hover:text-purple-400 uppercase tracking-wider cursor-pointer"
                                    >
                                        Load More
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
