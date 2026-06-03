"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getBrowserSupabase } from "@/lib/supabase";
import { ProfileSnippet } from "@/lib/types";
import AuthWall from "@/components/AuthWall";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { Users, Check, Plus } from "lucide-react";

interface ConcertAttendeesProps {
    concertId: string;
}

function ConcertAttendeesInner({ concertId }: ConcertAttendeesProps) {
    const { user } = useAuth();
    const [attendees, setAttendees] = useState<ProfileSnippet[]>([]);
    const [total, setTotal] = useState(0);
    const [isAttending, setIsAttending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);

    const supabase = getBrowserSupabase();

    useEffect(() => {
        let mounted = true;

        async function fetchAttendees() {
            setLoading(true);
            try {
                // Get total count
                const { count } = await supabase
                    .from("concert_attendees")
                    .select("*", { count: "exact", head: true })
                    .eq("concert_id", concertId);

                // Get first 10 attendees
                const { data: rows } = await supabase
                    .from("concert_attendees")
                    .select("user_id")
                    .eq("concert_id", concertId)
                    .order("created_at", { ascending: false })
                    .limit(10);

                if (!mounted) return;
                setTotal(count || 0);

                if (rows && rows.length > 0) {
                    const userIds = rows.map((r: any) => r.user_id);
                    const { data: profiles } = await supabase
                        .from("profiles")
                        .select("id, name, handle, avatar")
                        .in("id", userIds);

                    if (mounted && profiles) {
                        setAttendees(profiles as ProfileSnippet[]);
                    }
                }

                // Check if current user is attending
                if (user) {
                    const { data: attendance } = await supabase
                        .from("concert_attendees")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("concert_id", concertId)
                        .maybeSingle();

                    if (mounted) {
                        setIsAttending(!!attendance);
                    }
                }
            } catch (err) {
                console.error("Error fetching attendees:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchAttendees();
        return () => { mounted = false; };
    }, [concertId, user]);

    const handleToggleAttend = async () => {
        if (!user) {
            setLoginOpen(true);
            return;
        }

        setToggling(true);
        try {
            if (isAttending) {
                await supabase
                    .from("concert_attendees")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("concert_id", concertId);

                setIsAttending(false);
                setTotal((prev) => Math.max(0, prev - 1));
                setAttendees((prev) => prev.filter((p) => p.id !== user.id));
            } else {
                await supabase
                    .from("concert_attendees")
                    .insert({ user_id: user.id, concert_id: concertId, source: "concert_page" });

                setIsAttending(true);
                setTotal((prev) => prev + 1);

                // Add current user to attendees display
                const newProfile: ProfileSnippet = {
                    id: user.id,
                    name: user.name,
                    handle: user.handle,
                    avatar: user.avatar || "",
                };
                setAttendees((prev) => [newProfile, ...prev].slice(0, 10));
            }
        } catch (err) {
            console.error("Error toggling attendance:", err);
        } finally {
            setToggling(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-mamen-gray-900 border-2 border-mamen-gray-800 p-6 animate-pulse">
                <div className="h-4 w-40 bg-mamen-gray-800 mb-4"></div>
                <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-mamen-gray-800" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-mamen-gray-900 border-2 border-mamen-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Users size={18} className="text-mamen-purple" />
                    <h3 className="font-headline text-sm font-bold tracking-wider uppercase text-mamen-white">
                        {total > 0 ? (
                            <>{total} {total === 1 ? "person" : "people"} attending</>
                        ) : (
                            <>Be the first to attend!</>
                        )}
                    </h3>
                </div>

                <button
                    onClick={handleToggleAttend}
                    disabled={toggling}
                    className={`flex items-center gap-2 px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider border-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                        isAttending
                            ? "bg-mamen-lime text-mamen-black border-mamen-black shadow-hard-sm"
                            : "bg-mamen-purple text-white border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px]"
                    }`}
                >
                    {isAttending ? (
                        <>
                            <Check size={14} />
                            I&apos;m Going
                        </>
                    ) : (
                        <>
                            <Plus size={14} />
                            I&apos;m Going
                        </>
                    )}
                </button>
            </div>

            {/* Avatar row */}
            {attendees.length > 0 && (
                <div className="flex items-center">
                    <div className="flex -space-x-2">
                        {attendees.slice(0, 10).map((profile) => (
                            <Link
                                key={profile.id}
                                href={`/profile/${profile.handle}`}
                                title={profile.name}
                                className="relative group"
                            >
                                <div className="w-10 h-10 rounded-full border-2 border-mamen-gray-900 bg-mamen-purple flex items-center justify-center overflow-hidden shrink-0 hover:z-10 hover:scale-110 transition-transform">
                                    {profile.avatar && profile.avatar.startsWith("http") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={profile.avatar}
                                            alt={profile.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-white font-headline font-bold text-sm">
                                            {profile.name?.[0] || "?"}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                    {total > 10 && (
                        <span className="ml-3 text-xs text-mamen-gray-400 font-headline font-bold">
                            +{total - 10} more
                        </span>
                    )}
                </div>
            )}

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </div>
    );
}

export default function ConcertAttendees({ concertId }: ConcertAttendeesProps) {
    return (
        <AuthWall blurContent>
            <ConcertAttendeesInner concertId={concertId} />
        </AuthWall>
    );
}
