"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import ChatThread from "@/components/ChatThread";
import LoginModal from "@/components/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import {
    BarenganPost,
    BarenganMember,
    BarenganChatMessage,
    BarenganUserRating,
    ProfileSnippet,
} from "@/lib/types";
import {
    getBarenganMembers,
    getBarenganChatMessages,
    getBarenganRatingsForPost,
    requestToJoinBarengan,
    approveBarenganMember,
    rejectBarenganMember,
    rateBarenganUser,
    sendBarenganChatMessage,
} from "@/lib/data";
import { getBarenganCapacity, getBarenganMemberTotal } from "@/lib/barengan";
import { ProfileTrustBadges } from "@/components/ProfileBadges";
import { Check, X, UserPlus, Users, MessageSquare, Clock, ThumbsUp, ThumbsDown } from "lucide-react";

interface BarenganDetailClientProps {
    post: BarenganPost;
    currentUserId?: string;
}

export default function BarenganDetailClient({ post, currentUserId }: BarenganDetailClientProps) {
    const { user, isLoading } = useAuth();
    const userId = user?.id || currentUserId;

    const [pendingMembers, setPendingMembers] = useState<BarenganMember[]>([]);
    const [approvedMembers, setApprovedMembers] = useState<BarenganMember[]>([]);
    const [chatMessages, setChatMessages] = useState<BarenganChatMessage[]>([]);
    const [ratings, setRatings] = useState<BarenganUserRating[]>([]);
    const [creatorProfile, setCreatorProfile] = useState<ProfileSnippet | null>(post.profile || null);
    const [joinMessage, setJoinMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [ratingTargetId, setRatingTargetId] = useState<string | null>(null);
    const [sendingChat, setSendingChat] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const isCreator = userId === post.user_id;
    const isApprovedMember = approvedMembers.some((m) => m.user_id === userId);
    const isPendingMember = pendingMembers.some((m) => m.user_id === userId);
    const hasGroupAccess = isCreator || isApprovedMember;
    const eventEnded = hasBarenganEventEnded(post);
    const visibleMemberTotal = getBarenganMemberTotal(
        post,
        hasGroupAccess ? approvedMembers.length : undefined
    );
    const memberCapacity = getBarenganCapacity(post);

    // Subscribe to realtime chat messages
    const { newMessages } = useRealtimeMessages(
        "barengan_messages",
        "barengan_post_id",
        post.id
    );

    // Load initial data
    useEffect(() => {
        if (isLoading) return;

        async function loadData() {
            const [pending, approved] = await Promise.all([
                getBarenganMembers(post.id, "pending"),
                getBarenganMembers(post.id, "approved"),
            ]);
            setPendingMembers(pending);
            setApprovedMembers(approved);

            // Load chat only if user has access (we check after members load)
        }
        loadData();
    }, [isLoading, post.id, userId]);

    // Load chat messages when we know user has access
    useEffect(() => {
        if (!hasGroupAccess) return;
        async function loadChat() {
            const messages = await getBarenganChatMessages(post.id);
            setChatMessages(messages);
        }
        loadChat();
    }, [hasGroupAccess, post.id]);

    const visibleChatMessages = useMemo(() => {
        // Build profiles map from existing messages + approved members
        const profileMap: Record<string, ProfileSnippet> = {};
        chatMessages.forEach((m) => {
            if (m.sender) profileMap[m.sender.id] = m.sender;
        });
        approvedMembers.forEach((m) => {
            if (m.profile) profileMap[m.profile.id] = m.profile;
        });
        if (creatorProfile) profileMap[creatorProfile.id] = creatorProfile;

        const realtimeMessages = newMessages as BarenganChatMessage[];
        const merged = realtimeMessages
            .filter((nm) => !chatMessages.some((cm) => cm.id === nm.id))
            .map((nm) => ({
                ...nm,
                sender: profileMap[nm.user_id] || null,
            }));

        return [...chatMessages, ...merged];
    }, [newMessages, chatMessages, approvedMembers, creatorProfile]);

    const ratingParticipants = useMemo(() => {
        const participants: { user_id: string; profile?: ProfileSnippet | null }[] = [
            { user_id: post.user_id, profile: creatorProfile },
            ...approvedMembers.map((member) => ({
                user_id: member.user_id,
                profile: member.profile,
            })),
        ];

        const seen = new Set<string>();
        return participants.filter((participant) => {
            if (seen.has(participant.user_id)) return false;
            seen.add(participant.user_id);
            return participant.user_id !== userId;
        });
    }, [approvedMembers, creatorProfile, post.user_id, userId]);

    const currentUserRatings = useMemo(() => {
        const map: Record<string, 1 | -1> = {};
        ratings.forEach((rating) => {
            if (rating.rater_id === userId) {
                map[rating.target_user_id] = rating.rating;
            }
        });
        return map;
    }, [ratings, userId]);

    const handleRequestJoin = async () => {
        if (!userId) {
            setLoginOpen(true);
            return;
        }
        if (!joinMessage.trim()) {
            setError("Please write a message to introduce yourself");
            return;
        }

        setSubmitting(true);
        setError("");
        const result = await requestToJoinBarengan(post.id, userId, joinMessage.trim());
        if (result.success) {
            setSuccessMsg("Your request has been sent! The creator will review it.");
            setJoinMessage("");
            // Refresh pending members
            const pending = await getBarenganMembers(post.id, "pending");
            setPendingMembers(pending);
        } else {
            setError(result.error || "Failed to send request");
        }
        setSubmitting(false);
    };

    const handleApprove = async (memberId: string) => {
        setActionLoading(memberId);
        setError("");
        const result = await approveBarenganMember(memberId);
        if (result.success) {
            const [pending, approved] = await Promise.all([
                getBarenganMembers(post.id, "pending"),
                getBarenganMembers(post.id, "approved"),
            ]);
            setPendingMembers(pending);
            setApprovedMembers(approved);
        } else {
            setError(result.error || "Failed to approve request");
        }
        setActionLoading(null);
    };

    const handleReject = async (memberId: string) => {
        setActionLoading(memberId);
        setError("");
        const result = await rejectBarenganMember(memberId);
        if (result.success) {
            const pending = await getBarenganMembers(post.id, "pending");
            setPendingMembers(pending);
        } else {
            setError(result.error || "Failed to reject request");
        }
        setActionLoading(null);
    };

    const handleSendChat = async (body: string) => {
        if (!userId) return;
        setSendingChat(true);
        await sendBarenganChatMessage(post.id, userId, body);
        setSendingChat(false);
        // Realtime subscription will pick up the new message
    };

    const refreshRatings = async () => {
        if (!hasGroupAccess) return;
        const ratingRows = await getBarenganRatingsForPost(post.id);
        setRatings(ratingRows);
    };

    const applyTrustScore = (targetUserId: string, score?: number) => {
        if (typeof score !== "number") return;

        if (targetUserId === post.user_id) {
            setCreatorProfile((prev) => prev ? { ...prev, barengan_trust_score: score } : prev);
        }

        setApprovedMembers((prev) => prev.map((member) => (
            member.user_id === targetUserId && member.profile
                ? { ...member, profile: { ...member.profile, barengan_trust_score: score } }
                : member
        )));
    };

    const handleRateUser = async (targetUserId: string, rating: 1 | -1) => {
        setRatingTargetId(targetUserId);
        setError("");
        setSuccessMsg("");

        const result = await rateBarenganUser({
            barengan_post_id: post.id,
            target_user_id: targetUserId,
            rating,
        });

        if (result.success) {
            applyTrustScore(targetUserId, result.target_score);
            await refreshRatings();
            setSuccessMsg("Rating saved.");
        } else {
            setError(result.error || "Failed to save rating");
        }

        setRatingTargetId(null);
    };

    useEffect(() => {
        if (!hasGroupAccess) {
            return;
        }

        let isMounted = true;
        getBarenganRatingsForPost(post.id).then((ratingRows) => {
            if (isMounted) setRatings(ratingRows);
        });

        return () => { isMounted = false; };
    }, [hasGroupAccess, post.id]);

    return (
        <>
            {/* Members Section */}
            <div className="card-frame overflow-hidden mb-8">
                <div className="p-6">
                    <h2 className="font-headline text-lg font-bold text-mamen-white flex items-center gap-2 mb-4">
                        <Users size={18} className="text-mamen-purple" />
                        Members ({visibleMemberTotal}/{memberCapacity})
                    </h2>

                    {/* Approved Members List */}
                    {hasGroupAccess && approvedMembers.length > 0 && (
                        <div className="space-y-3 mb-6">
                            {approvedMembers.map((member) => (
                                <MemberRow key={member.id} member={member} />
                            ))}
                        </div>
                    )}

                    {hasGroupAccess && approvedMembers.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-mamen-gray-800 mb-6">
                            <p className="text-sm text-mamen-gray-700">No approved members yet.</p>
                        </div>
                    )}

                    {!hasGroupAccess && (
                        <div className="text-center py-6 border-2 border-dashed border-mamen-gray-800 mb-6">
                            <p className="font-headline text-sm font-bold tracking-widest uppercase text-mamen-gray-200 mb-1">
                                Member list is private
                            </p>
                            <p className="text-sm text-mamen-gray-700">
                                You can see who&apos;s joining after the post creator approves your request.
                            </p>
                        </div>
                    )}

                    {/* Creator: Pending Requests */}
                    {isCreator && pendingMembers.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase mb-3 flex items-center gap-2">
                                <Clock size={14} />
                                Pending Requests ({pendingMembers.length})
                            </h3>
                            <div className="space-y-3">
                                {pendingMembers.map((member) => (
                                    <div key={member.id} className="flex items-start gap-3 p-3 bg-mamen-gray-900 border-2 border-mamen-gray-800">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-mamen-gray-700 bg-mamen-gray-800 shrink-0">
                                            {member.profile?.avatar ? (
                                                <Image
                                                    src={member.profile.avatar}
                                                    alt={member.profile.name || "User"}
                                                    width={32}
                                                    height={32}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-mamen-gray-700 font-headline font-bold text-xs">
                                                    {(member.profile?.name || "?")[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                href={`/profile/${member.profile?.handle}`}
                                                className="font-headline text-sm font-bold text-mamen-white hover:text-mamen-purple transition-colors"
                                            >
                                                <span className="inline-flex items-center gap-2 flex-wrap">
                                                    {member.profile?.name || "Anonymous"}
                                                    <ProfileTrustBadges profile={member.profile} compact />
                                                </span>
                                            </Link>
                                            <p className="text-xs text-mamen-gray-700">@{member.profile?.handle || "user"}</p>
                                            <p className="text-sm text-mamen-gray-100 mt-1">{member.message}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleApprove(member.id)}
                                                disabled={actionLoading === member.id}
                                                className="p-2 bg-mamen-lime text-mamen-black border-2 border-mamen-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50"
                                                title="Approve"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleReject(member.id)}
                                                disabled={actionLoading === member.id}
                                                className="p-2 bg-red-600 text-white border-2 border-mamen-black hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50"
                                                title="Reject"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Non-member: Request to Join */}
                    {!isCreator && !isApprovedMember && !isPendingMember && post.is_active && (
                        <div className="mt-6 border-t-2 border-mamen-gray-800 pt-6">
                            <h3 className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase mb-3 flex items-center gap-2">
                                <UserPlus size={14} />
                                Request to Join
                            </h3>
                            <textarea
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                                placeholder={userId ? "Introduce yourself... e.g., I have a ticket for Tribune section!" : "Log in to request to join..."}
                                rows={3}
                                maxLength={300}
                                disabled={!userId}
                                className="w-full bg-mamen-gray-900 border-2 border-mamen-gray-700 p-3 text-mamen-white text-sm outline-none focus:border-mamen-purple transition-colors resize-none placeholder:text-mamen-gray-700 disabled:opacity-50"
                            />
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-xs text-mamen-gray-700">{joinMessage.length}/300</p>
                                <Button
                                    variant="lime"
                                    size="sm"
                                    onClick={handleRequestJoin}
                                    disabled={submitting || (!!userId && !joinMessage.trim())}
                                >
                                    {submitting ? "Sending..." : userId ? "Request to Join" : "Login to Request"}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Pending member: waiting notice */}
                    {isPendingMember && (
                        <div className="mt-6 p-3 bg-mamen-purple/10 border-2 border-mamen-purple text-sm text-mamen-gray-100">
                            Your request is pending. The creator will review it soon.
                        </div>
                    )}

                    {/* Ended notice */}
                    {!post.is_active && (
                        <div className="mt-6 p-3 bg-mamen-gray-900 border-2 border-mamen-gray-700 text-sm text-mamen-gray-700 text-center">
                            This barengan group has ended.
                        </div>
                    )}

                    {/* Error / Success messages */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="mt-4 p-3 bg-mamen-lime/10 border-2 border-mamen-lime text-mamen-lime text-sm">
                            {successMsg}
                        </div>
                    )}
                </div>
            </div>

            {/* Post-event ratings */}
            {hasGroupAccess && eventEnded && ratingParticipants.length > 0 && (
                <div className="card-frame overflow-hidden mb-8">
                    <div className="border-b-2 border-mamen-gray-800 px-6 py-4">
                        <h2 className="font-headline text-lg font-bold text-mamen-white flex items-center gap-2">
                            <ThumbsUp size={18} className="text-mamen-lime" />
                            Rate Barengan Trust
                        </h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {ratingParticipants.map((participant) => {
                            const activeRating = currentUserRatings[participant.user_id];
                            return (
                                <div key={participant.user_id} className="flex items-center gap-3 p-3 bg-mamen-gray-900 border-2 border-mamen-gray-800">
                                    <UserAvatar profile={participant.profile} size={36} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-headline text-sm font-bold text-mamen-white">
                                                {participant.profile?.name || "Anonymous"}
                                            </p>
                                            <ProfileTrustBadges profile={participant.profile} compact />
                                        </div>
                                        <p className="text-xs text-mamen-gray-700">@{participant.profile?.handle || "user"}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleRateUser(participant.user_id, 1)}
                                            disabled={ratingTargetId === participant.user_id}
                                            className={`p-2 border-2 border-mamen-black transition-all cursor-pointer disabled:opacity-50 ${activeRating === 1
                                                ? "bg-mamen-lime text-mamen-black"
                                                : "bg-mamen-gray-800 text-mamen-gray-200 hover:bg-mamen-lime hover:text-mamen-black"
                                                }`}
                                            title="Trust"
                                        >
                                            <ThumbsUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleRateUser(participant.user_id, -1)}
                                            disabled={ratingTargetId === participant.user_id}
                                            className={`p-2 border-2 border-mamen-black transition-all cursor-pointer disabled:opacity-50 ${activeRating === -1
                                                ? "bg-red-600 text-white"
                                                : "bg-mamen-gray-800 text-mamen-gray-200 hover:bg-red-600 hover:text-white"
                                                }`}
                                            title="Untrust"
                                        >
                                            <ThumbsDown size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Group Chat — only for creator + approved members */}
            {hasGroupAccess && (
                <div className="card-frame overflow-hidden mb-8">
                    <div className="border-b-2 border-mamen-gray-800 px-6 py-4">
                        <h2 className="font-headline text-lg font-bold text-mamen-white flex items-center gap-2">
                            <MessageSquare size={18} className="text-mamen-purple" />
                            Group Chat
                        </h2>
                    </div>
                    <ChatThread
                        messages={visibleChatMessages.map((m) => ({
                            id: m.id,
                            body: m.body,
                            created_at: m.created_at,
                            sender: m.sender,
                        }))}
                        currentUserId={userId || ""}
                        onSend={handleSendChat}
                        sending={sendingChat}
                        readOnly={!post.is_active}
                        emptyText="No messages yet. Say hi to the group!"
                    />
                </div>
            )}

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}

function MemberRow({ member }: { member: BarenganMember }) {
    return (
        <div className="flex items-center gap-3 p-3 bg-mamen-gray-900 border-2 border-mamen-gray-800">
            <UserAvatar profile={member.profile} size={32} />
            <div className="min-w-0">
                <Link
                    href={`/profile/${member.profile?.handle}`}
                    className="font-headline text-sm font-bold text-mamen-white hover:text-mamen-purple transition-colors"
                >
                    <span className="inline-flex items-center gap-2 flex-wrap">
                        {member.profile?.name || "Anonymous"}
                        <ProfileTrustBadges profile={member.profile} compact />
                    </span>
                </Link>
                <p className="text-xs text-mamen-gray-700">@{member.profile?.handle || "user"}</p>
            </div>
        </div>
    );
}

function UserAvatar({ profile, size }: { profile?: ProfileSnippet | null; size: number }) {
    return (
        <div
            className="rounded-full overflow-hidden border-2 border-mamen-purple bg-mamen-gray-800 shrink-0"
            style={{ width: size, height: size }}
        >
            {profile?.avatar ? (
                <Image
                    src={profile.avatar}
                    alt={profile.name || "User"}
                    width={size}
                    height={size}
                    className="object-cover w-full h-full"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-mamen-gray-700 font-headline font-bold text-xs">
                    {(profile?.name || "?")[0]?.toUpperCase()}
                </div>
            )}
        </div>
    );
}

function hasBarenganEventEnded(post: BarenganPost) {
    const eventEnd = post.concert?.end_datetime || post.concert?.start_datetime;
    if (!eventEnd) return !post.is_active;
    return new Date(eventEnd).getTime() < Date.now();
}
