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
    ProfileSnippet,
} from "@/lib/types";
import {
    getBarenganMembers,
    getBarenganChatMessages,
    requestToJoinBarengan,
    approveBarenganMember,
    rejectBarenganMember,
    sendBarenganChatMessage,
} from "@/lib/data";
import { Check, X, UserPlus, Users, MessageSquare, Clock } from "lucide-react";

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
    const [joinMessage, setJoinMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [sendingChat, setSendingChat] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const isCreator = userId === post.user_id;
    const isApprovedMember = approvedMembers.some((m) => m.user_id === userId);
    const isPendingMember = pendingMembers.some((m) => m.user_id === userId);
    const hasGroupAccess = isCreator || isApprovedMember;
    const visibleApprovedCount = hasGroupAccess ? approvedMembers.length : post.approved_count || 0;

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
        if (post.profile) profileMap[post.profile.id] = post.profile;

        const realtimeMessages = newMessages as BarenganChatMessage[];
        const merged = realtimeMessages
            .filter((nm) => !chatMessages.some((cm) => cm.id === nm.id))
            .map((nm) => ({
                ...nm,
                sender: profileMap[nm.user_id] || null,
            }));

        return [...chatMessages, ...merged];
    }, [newMessages, chatMessages, approvedMembers, post.profile]);

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

    return (
        <>
            {/* Members Section */}
            <div className="card-frame overflow-hidden mb-8">
                <div className="p-6">
                    <h2 className="font-headline text-lg font-bold text-mamen-white flex items-center gap-2 mb-4">
                        <Users size={18} className="text-mamen-purple" />
                        Members ({visibleApprovedCount}/{post.max_members || post.looking_for})
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
                                                {member.profile?.name || "Anonymous"}
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
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-mamen-purple bg-mamen-gray-800 shrink-0">
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
            <div className="min-w-0">
                <Link
                    href={`/profile/${member.profile?.handle}`}
                    className="font-headline text-sm font-bold text-mamen-white hover:text-mamen-purple transition-colors"
                >
                    {member.profile?.name || "Anonymous"}
                </Link>
                <p className="text-xs text-mamen-gray-700">@{member.profile?.handle || "user"}</p>
            </div>
        </div>
    );
}
