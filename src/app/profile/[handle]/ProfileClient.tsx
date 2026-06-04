"use client";

import { useState, useEffect } from "react";
import { useAuth, AuthUser } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import {
    Settings, Save, X, CalendarDays, History, Star,
    Instagram, MessageCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileComments from "./ProfileComments";
import ProfileConcerts from "./ProfileConcerts";
import ImageUploader from "@/components/ImageUploader";
import ConcertCardMini from "@/components/ConcertCardMini";
import FollowButton from "@/components/FollowButton";
import FollowCounts from "@/components/FollowCounts";
import FollowListModal from "@/components/FollowListModal";
import { Concert } from "@/lib/types";
import { isMutualFollow, getOrCreateConversation } from "@/lib/data";

interface ProfileClientProps {
    handle: string;
}

// TikTok icon (Lucide doesn't have one)
function TikTokIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.4a8.16 8.16 0 0 0 4.77 1.52V7.46a4.85 4.85 0 0 1-1.01-.77z" />
        </svg>
    );
}

// X (Twitter) icon
function XIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

export default function ProfileClient({ handle }: ProfileClientProps) {
    const { user, updateProfile } = useAuth();
    const router = useRouter();

    const [profileUser, setProfileUser] = useState<AuthUser | null>(null);
    const [messagePermission, setMessagePermission] = useState<{ profileId: string; canMessage: boolean } | null>(null);
    const [startingDm, setStartingDm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");
    const [attendCount, setAttendCount] = useState(0);
    const [favoriteConcerts, setFavoriteConcerts] = useState<Concert[]>([]);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editHandle, setEditHandle] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [editBanner, setEditBanner] = useState("");
    const [editIG, setEditIG] = useState("");
    const [editTikTok, setEditTikTok] = useState("");
    const [editX, setEditX] = useState("");

    const [activeTab, setActiveTab] = useState<"concerts" | "comments">("concerts");

    // Follow system state
    const [followerCount, setFollowerCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [showFollowList, setShowFollowList] = useState(false);
    const [followListMode, setFollowListMode] = useState<"followers" | "following">("followers");

    // Fetch profile by handle immediately. Profiles are public; auth only enables owner actions.
    useEffect(() => {
        let mounted = true;

        const fetchProfile = async () => {
            try {
                const { data, error: pbError } = await supabase
                    .from("profiles")
                    .select("*")
                    .ilike("handle", handle)
                    .maybeSingle();

                if (!mounted) return;

                if (pbError || !data) {
                    setError("User not found!");
                    return;
                }

                const profile: AuthUser = {
                    id: data.id,
                    name: data.name || "",
                    handle: data.handle || "",
                    email: data.email || "",
                    role: data.role || "user",
                    avatar: data.avatar || "",
                    banner_image: data.banner_image || "",
                    social_instagram: data.social_instagram || "",
                    social_tiktok: data.social_tiktok || "",
                    social_x: data.social_x || "",
                    favorite_concert_ids: data.favorite_concert_ids || [],
                };

                setProfileUser(profile);
                setEditName(profile.name);
                setEditHandle(profile.handle);
                setEditAvatar(profile.avatar && profile.avatar.startsWith("http") ? profile.avatar : "");
                setEditBanner(profile.banner_image || "");
                setEditIG(profile.social_instagram || "");
                setEditTikTok(profile.social_tiktok || "");
                setEditX(profile.social_x || "");

                // Fetch attend count + favorite concerts + follow counts in parallel
                const [attendResult, favResult, followerResult, followingResult] = await Promise.all([
                    supabase
                        .from("concert_attendees")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", profile.id),
                    profile.favorite_concert_ids && profile.favorite_concert_ids.length > 0
                        ? supabase.from("concerts").select("*").in("id", profile.favorite_concert_ids)
                        : Promise.resolve({ data: null }),
                    supabase
                        .from("follows")
                        .select("*", { count: "exact", head: true })
                        .eq("following_id", profile.id),
                    supabase
                        .from("follows")
                        .select("*", { count: "exact", head: true })
                        .eq("follower_id", profile.id),
                ]);

                if (mounted) {
                    setAttendCount(attendResult.count || 0);
                    if (favResult.data) setFavoriteConcerts(favResult.data as Concert[]);
                    setFollowerCount(followerResult.count || 0);
                    setFollowingCount(followingResult.count || 0);
                }
            } catch {
                if (mounted) setError("Error fetching user profile.");
            }
        };

        fetchProfile();

        return () => { mounted = false; };
    }, [handle]);

    const isOwner = user?.handle?.toLowerCase() === profileUser?.handle?.toLowerCase();
    const canMessage = messagePermission && messagePermission.profileId === profileUser?.id
        ? messagePermission.canMessage
        : false;

    // Check mutual follow for Message button
    useEffect(() => {
        if (!user || !profileUser || isOwner) {
            return;
        }
        let mounted = true;
        isMutualFollow(user.id, profileUser.id).then((mutual) => {
            if (mounted) {
                setMessagePermission({ profileId: profileUser.id, canMessage: mutual });
            }
        });
        return () => { mounted = false; };
    }, [user, profileUser, isOwner]);

    const handleStartDm = async () => {
        if (!user || !profileUser) return;
        setStartingDm(true);
        const conv = await getOrCreateConversation(user.id, profileUser.id);
        setStartingDm(false);
        if (conv) {
            router.push(`/messages?conv=${conv.id}`);
        }
    };

    const handleSave = async () => {
        setError("");
        const result = await updateProfile({
            name: editName,
            handle: editHandle,
            avatar: editAvatar || undefined,
            banner_image: editBanner || undefined,
            social_instagram: editIG || undefined,
            social_tiktok: editTikTok || undefined,
            social_x: editX || undefined,
        });
        if (result.success) {
            setIsEditing(false);
            if (editHandle !== profileUser?.handle) {
                window.location.href = `/profile/${editHandle}`;
            } else {
                setProfileUser((prev) => prev ? {
                    ...prev,
                    name: editName,
                    handle: editHandle,
                    avatar: editAvatar || prev.avatar,
                    banner_image: editBanner,
                    social_instagram: editIG,
                    social_tiktok: editTikTok,
                    social_x: editX,
                } : null);
            }
        } else {
            setError(result.error || "Failed to update profile");
        }
    };

    if (!profileUser && !error) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-mamen-purple"></div>
            </div>
        );
    }

    if (!profileUser && error) {
        return (
            <div className="text-center py-20">
                <h1 className="font-headline text-3xl font-black text-mamen-white mb-4">Error</h1>
                <p className="text-mamen-gray-200">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Banner + Profile Header */}
            <div className="relative">
                {/* Banner Image */}
                <div className="w-full h-32 sm:h-44 md:h-52 bg-mamen-gray-800 overflow-hidden">
                    {profileUser?.banner_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={profileUser.banner_image}
                            alt="Profile banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-mamen-purple/30 via-mamen-gray-900 to-mamen-magenta/30" />
                    )}
                </div>

                {/* Profile card overlapping the banner bottom */}
                <div className="relative -mt-14 mx-4 bg-mamen-gray-900 border-2 border-mamen-gray-800 p-5 md:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-mamen-purple flex items-center justify-center font-headline font-black text-3xl md:text-4xl text-white shrink-0 shadow-hard-md overflow-hidden border-4 border-mamen-gray-900 -mt-16 sm:-mt-20">
                            {profileUser?.avatar && profileUser.avatar.startsWith("http") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profileUser.avatar} alt={profileUser.name} className="w-full h-full object-cover" />
                            ) : (
                                profileUser?.name[0]
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center sm:text-left pb-1">
                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-0.5 flex-wrap">
                                <h1 className="font-headline text-2xl md:text-3xl font-black text-mamen-white leading-none">
                                    {profileUser?.name}
                                </h1>
                                {profileUser?.role === "admin" && (
                                    <span className="text-[10px] px-2 py-0.5 bg-mamen-purple text-white font-bold uppercase tracking-wider rounded-full">Admin</span>
                                )}
                                {profileUser?.role === "contributor" && (
                                    <span className="text-[10px] px-2 py-0.5 bg-mamen-magenta text-white font-bold uppercase tracking-wider rounded-full">Contributor</span>
                                )}
                            </div>
                            <p className="text-mamen-gray-400 text-sm font-medium">@{profileUser?.handle}</p>

                            {/* Follow counts */}
                            <div className="mt-2">
                                <FollowCounts
                                    userId={profileUser?.id || ""}
                                    followerCount={followerCount}
                                    followingCount={followingCount}
                                    onClickFollowers={() => { setFollowListMode("followers"); setShowFollowList(true); }}
                                    onClickFollowing={() => { setFollowListMode("following"); setShowFollowList(true); }}
                                />
                            </div>

                            {/* Stats + Socials row */}
                            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 flex-wrap">
                                {/* Attend count badge */}
                                <div className="flex items-center gap-1.5 text-xs text-mamen-magenta font-bold">
                                    <CalendarDays size={14} />
                                    <span>{attendCount} concert{attendCount !== 1 ? "s" : ""}</span>
                                </div>

                                {/* Social links */}
                                {profileUser?.social_instagram && (
                                    <a href={profileUser.social_instagram.startsWith("http") ? profileUser.social_instagram : `https://instagram.com/${profileUser.social_instagram}`} target="_blank" rel="noopener noreferrer" className="text-mamen-gray-400 hover:text-pink-400 transition-colors">
                                        <Instagram size={16} />
                                    </a>
                                )}
                                {profileUser?.social_tiktok && (
                                    <a href={profileUser.social_tiktok.startsWith("http") ? profileUser.social_tiktok : `https://tiktok.com/@${profileUser.social_tiktok}`} target="_blank" rel="noopener noreferrer" className="text-mamen-gray-400 hover:text-white transition-colors">
                                        <TikTokIcon size={16} />
                                    </a>
                                )}
                                {profileUser?.social_x && (
                                    <a href={profileUser.social_x.startsWith("http") ? profileUser.social_x : `https://x.com/${profileUser.social_x}`} target="_blank" rel="noopener noreferrer" className="text-mamen-gray-400 hover:text-white transition-colors">
                                        <XIcon size={16} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Edit button (owner) or Follow button (visitor) */}
                        {isOwner && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-1.5 border-2 border-mamen-gray-700 text-mamen-gray-200 font-headline text-xs font-bold uppercase tracking-wider hover:bg-mamen-gray-800 hover:text-white transition-colors shrink-0"
                            >
                                <Settings size={12} /> Edit
                            </button>
                        )}
                        {!isOwner && profileUser && (
                            <div className="shrink-0 flex items-center gap-2">
                                <FollowButton targetUserId={profileUser.id} />
                                {user && canMessage && (
                                    <button
                                        onClick={handleStartDm}
                                        disabled={startingDm}
                                        className="flex items-center gap-2 px-3 py-1.5 border-2 border-mamen-purple text-mamen-purple font-headline text-xs font-bold uppercase tracking-wider hover:bg-mamen-purple hover:text-white transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                                    >
                                        <MessageCircle size={12} />
                                        {startingDm ? "..." : "Message"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Inline Edit Form */}
                    {isEditing && (
                        <div className="mt-6 pt-6 border-t border-mamen-gray-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">Display Name</label>
                                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple" />
                                </div>
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">Handle (@)</label>
                                    <input type="text" value={editHandle} onChange={(e) => setEditHandle(e.target.value)} className="w-full px-3 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple" />
                                </div>
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">Profile Picture</label>
                                    <ImageUploader value={editAvatar} onChange={(url) => setEditAvatar(url)} folder="mamen/avatars" aspect="1/1" />
                                </div>
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">Banner Image</label>
                                    <ImageUploader value={editBanner} onChange={(url) => setEditBanner(url)} folder="mamen/banners" aspect="16/5" />
                                </div>
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">
                                        <Instagram size={12} className="inline mr-1" />Instagram
                                    </label>
                                    <input type="text" value={editIG} onChange={(e) => setEditIG(e.target.value)} placeholder="username or URL" className="w-full px-3 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple placeholder:text-mamen-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">
                                        <span className="inline-flex mr-1"><TikTokIcon size={12} /></span>TikTok
                                    </label>
                                    <input type="text" value={editTikTok} onChange={(e) => setEditTikTok(e.target.value)} placeholder="username or URL" className="w-full px-3 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple placeholder:text-mamen-gray-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-1">
                                        <span className="inline-flex mr-1"><XIcon size={12} /></span>X (Twitter)
                                    </label>
                                    <input type="text" value={editX} onChange={(e) => setEditX(e.target.value)} placeholder="username or URL" className="w-full px-3 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple placeholder:text-mamen-gray-700" />
                                </div>
                            </div>
                            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                            <div className="flex gap-2 mt-4">
                                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-mamen-lime text-mamen-black font-headline text-xs font-bold uppercase tracking-wider shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer">
                                    <Save size={14} /> Save
                                </button>
                                <button onClick={() => { setIsEditing(false); setError(""); }} className="flex items-center gap-2 px-4 py-2 bg-mamen-gray-800 text-white font-headline text-xs font-bold uppercase tracking-wider border border-mamen-gray-700 cursor-pointer">
                                    <X size={14} /> Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Favorite Concerts Showcase */}
            {favoriteConcerts.length > 0 && (
                <div>
                    <h3 className="font-headline text-sm font-bold tracking-widest text-mamen-gray-400 uppercase mb-3 flex items-center gap-2">
                        <Star size={14} className="text-yellow-400" />
                        Favorite Concerts
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {favoriteConcerts.slice(0, 3).map((c) => (
                            <ConcertCardMini key={c.id} concert={c} />
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b-2 border-mamen-gray-800">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("concerts")}
                        className={`pb-4 text-sm font-headline font-bold tracking-wider uppercase flex items-center gap-2 transition-colors relative ${activeTab === "concerts"
                            ? "text-mamen-magenta"
                            : "text-mamen-gray-400 hover:text-mamen-gray-200"
                            }`}
                    >
                        <CalendarDays size={16} /> Attending Concerts
                        {activeTab === "concerts" && (
                            <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-mamen-magenta" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("comments")}
                        className={`pb-4 text-sm font-headline font-bold tracking-wider uppercase flex items-center gap-2 transition-colors relative ${activeTab === "comments"
                            ? "text-mamen-lime"
                            : "text-mamen-gray-400 hover:text-mamen-gray-200"
                            }`}
                    >
                        <History size={16} /> Comments History
                        {activeTab === "comments" && (
                            <div className="absolute bottom-[-2px] left-0 right-0 h-1 bg-mamen-lime" />
                        )}
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "comments" ? (
                    <ProfileComments userId={profileUser?.id || ""} />
                ) : (
                    <ProfileConcerts userId={profileUser?.id || ""} />
                )}
            </div>

            {/* Follow List Modal */}
            <FollowListModal
                isOpen={showFollowList}
                onClose={() => setShowFollowList(false)}
                userId={profileUser?.id || ""}
                mode={followListMode}
            />
        </div>
    );
}
