"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRealtimeMessages } from "@/lib/hooks/useRealtimeMessages";
import ChatThread from "@/components/ChatThread";
import {
    getConversations,
    getConversationMessages,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    sendDirectMessage,
    markMessagesAsRead,
} from "@/lib/data";
import { DmConversation, DirectMessage, ProfileSnippet, SystemNotification } from "@/lib/types";
import { ArrowLeft, Bell, CheckCheck, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function MessagesClient() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedConvId = searchParams.get("conv");

    const [activeTab, setActiveTab] = useState<"notifications" | "messages">(preselectedConvId ? "messages" : "notifications");
    const [conversations, setConversations] = useState<DmConversation[]>([]);
    const [selectedConvId, setSelectedConvId] = useState<string | null>(preselectedConvId);
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [messages, setMessages] = useState<DirectMessage[]>([]);
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [sending, setSending] = useState(false);
    const [mobileShowThread, setMobileShowThread] = useState(!!preselectedConvId);

    const unreadNotificationCount = notifications.filter((notification) => !notification.read_at).length;

    // Load conversations
    useEffect(() => {
        if (!user) return;
        let mounted = true;

        const load = async () => {
            setLoadingConvs(true);
            const data = await getConversations(user.id);
            if (mounted) {
                setConversations(data);
                setLoadingConvs(false);

                // Auto-select preselected or first conversation
                if (preselectedConvId && data.some((c) => c.id === preselectedConvId)) {
                    setSelectedConvId(preselectedConvId);
                    setMobileShowThread(true);
                }
            }
        };

        load();
        return () => { mounted = false; };
    }, [user, preselectedConvId]);

    // Load MAMEN system notifications
    useEffect(() => {
        if (!user) return;
        let mounted = true;

        const load = async () => {
            setLoadingNotifications(true);
            const data = await getNotifications(user.id);
            if (mounted) {
                setNotifications(data);
                setLoadingNotifications(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [user]);

    // Load messages when conversation is selected
    useEffect(() => {
        if (!selectedConvId || !user) {
            setMessages([]);
            return;
        }
        let mounted = true;

        const load = async () => {
            const data = await getConversationMessages(selectedConvId);
            if (mounted) {
                setMessages(data);
            }
            // Mark as read
            await markMessagesAsRead(selectedConvId, user.id);
            // Update unread count in conversation list
            if (mounted) {
                setConversations((prev) =>
                    prev.map((c) => c.id === selectedConvId ? { ...c, unread_count: 0 } : c)
                );
            }
        };

        load();
        return () => { mounted = false; };
    }, [selectedConvId, user]);

    // Realtime messages for selected conversation
    const { newMessages, clearNewMessages } = useRealtimeMessages(
        "direct_messages",
        "conversation_id",
        selectedConvId || ""
    );

    // Merge realtime messages
    useEffect(() => {
        if (newMessages.length === 0 || !user) return;

        const mergeMessages = async () => {
            // Fetch sender profiles for new messages
            const { getBrowserSupabase } = await import("@/lib/supabase");
            const supabase = getBrowserSupabase();

            const enriched: DirectMessage[] = [];
            for (const raw of newMessages) {
                // Skip if already in messages
                if (messages.some((m) => m.id === raw.id)) continue;

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("id, name, handle, avatar")
                    .eq("id", raw.sender_id)
                    .single();

                enriched.push({
                    ...raw,
                    sender: profile as ProfileSnippet | undefined,
                } as DirectMessage);
            }

            if (enriched.length > 0) {
                setMessages((prev) => {
                    const ids = new Set(prev.map((m) => m.id));
                    const newOnes = enriched.filter((m) => !ids.has(m.id));
                    return [...prev, ...newOnes];
                });

                // Mark new messages as read if they're from someone else
                if (selectedConvId) {
                    await markMessagesAsRead(selectedConvId, user.id);
                }

                // Update conversation list preview
                const latest = enriched[enriched.length - 1];
                setConversations((prev) =>
                    prev.map((c) =>
                        c.id === selectedConvId
                            ? { ...c, last_message_preview: latest.body, last_message_at: latest.created_at, unread_count: 0 }
                            : c
                    )
                );
            }

            clearNewMessages();
        };

        mergeMessages();
    }, [newMessages, user, selectedConvId, messages, clearNewMessages]);

    const handleSend = useCallback(async (body: string) => {
        if (!user || !selectedConvId) return;

        setSending(true);
        const result = await sendDirectMessage(selectedConvId, user.id, body);
        setSending(false);

        if (result.success) {
            // Update conversation list preview
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedConvId
                        ? { ...c, last_message_preview: body, last_message_at: new Date().toISOString() }
                        : c
                ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
            );
        }
    }, [user, selectedConvId]);

    const selectConversation = (convId: string) => {
        setActiveTab("messages");
        setSelectedConvId(convId);
        setMobileShowThread(true);
    };

    const handleNotificationClick = async (notification: SystemNotification) => {
        if (!user) return;

        if (!notification.read_at) {
            await markNotificationAsRead(notification.id, user.id);
            setNotifications((prev) =>
                prev.map((item) => item.id === notification.id
                    ? { ...item, read_at: new Date().toISOString() }
                    : item)
            );
            window.dispatchEvent(new Event("mamen:unread-refresh"));
        }

        if (notification.href) {
            router.push(notification.href);
        }
    };

    const handleMarkAllNotificationsRead = async () => {
        if (!user || unreadNotificationCount === 0) return;
        await markAllNotificationsAsRead(user.id);
        const now = new Date().toISOString();
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read_at: notification.read_at || now })));
        window.dispatchEvent(new Event("mamen:unread-refresh"));
    };

    const selectedConv = conversations.find((c) => c.id === selectedConvId);

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return d.toLocaleDateString([], { month: "short", day: "numeric" });
    };

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-64px)]">
            <div className="flex h-full border-x border-mamen-gray-800">
                {/* Left panel — Conversation list */}
                <div className={`w-full md:w-[340px] lg:w-[380px] border-r border-mamen-gray-800 flex flex-col shrink-0 ${mobileShowThread ? "hidden md:flex" : "flex"}`}>
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-mamen-gray-800 space-y-4">
                        <h1 className="font-headline text-lg font-black text-mamen-white tracking-wider uppercase">
                            Center
                        </h1>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => { setActiveTab("notifications"); setMobileShowThread(false); }}
                                className={`flex items-center justify-center gap-2 border-2 px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider ${
                                    activeTab === "notifications"
                                        ? "border-mamen-purple bg-mamen-purple text-white"
                                        : "border-mamen-gray-700 text-mamen-gray-200"
                                }`}
                            >
                                <Bell size={14} />
                                Notif
                                {unreadNotificationCount > 0 && (
                                    <span className="rounded-full bg-red-500 px-1.5 text-[10px] text-white">
                                        {unreadNotificationCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab("messages")}
                                className={`flex items-center justify-center gap-2 border-2 px-3 py-2 font-headline text-xs font-bold uppercase tracking-wider ${
                                    activeTab === "messages"
                                        ? "border-mamen-purple bg-mamen-purple text-white"
                                        : "border-mamen-gray-700 text-mamen-gray-200"
                                }`}
                            >
                                <MessageCircle size={14} />
                                Messages
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {activeTab === "notifications" ? (
                            loadingNotifications ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mamen-purple"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <Bell size={40} className="text-mamen-gray-700 mb-4" />
                                    <p className="text-mamen-gray-400 text-sm">
                                        No MAMEN notifications yet.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {unreadNotificationCount > 0 && (
                                        <button
                                            onClick={handleMarkAllNotificationsRead}
                                            className="flex w-full items-center justify-center gap-2 border-b border-mamen-gray-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-mamen-purple hover:bg-mamen-gray-800/30"
                                        >
                                            <CheckCheck size={13} />
                                            Mark all read
                                        </button>
                                    )}
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left ${
                                                !notification.read_at
                                                    ? "bg-mamen-purple/10 hover:bg-mamen-purple/20"
                                                    : "hover:bg-mamen-gray-800/30"
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-mamen-purple flex items-center justify-center text-xs font-headline font-black text-white shrink-0">
                                                M
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-headline text-sm font-bold text-mamen-white truncate">
                                                        {notification.title || "MAMEN"}
                                                    </span>
                                                    <span className="text-[10px] text-mamen-gray-500 shrink-0">
                                                        {formatTime(notification.created_at)}
                                                    </span>
                                                </div>
                                                <p className={`text-xs line-clamp-2 ${notification.read_at ? "text-mamen-gray-500" : "text-mamen-gray-200 font-medium"}`}>
                                                    {notification.body}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )
                        ) : loadingConvs ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mamen-purple"></div>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                <MessageCircle size={40} className="text-mamen-gray-700 mb-4" />
                                <p className="text-mamen-gray-400 text-sm">
                                    No messages yet. Follow someone and start chatting!
                                </p>
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => selectConversation(conv.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left ${
                                        selectedConvId === conv.id
                                            ? "bg-mamen-gray-800/60"
                                            : "hover:bg-mamen-gray-800/30"
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-mamen-purple flex items-center justify-center text-sm font-bold text-white shrink-0 overflow-hidden">
                                        {conv.other_user?.avatar ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={conv.other_user.avatar}
                                                alt={conv.other_user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            conv.other_user?.name?.[0] || "?"
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`font-headline text-sm font-bold truncate ${
                                                conv.unread_count && conv.unread_count > 0
                                                    ? "text-mamen-white"
                                                    : "text-mamen-gray-200"
                                            }`}>
                                                {conv.other_user?.name || "Unknown"}
                                            </span>
                                            <span className="text-[10px] text-mamen-gray-500 shrink-0">
                                                {formatTime(conv.last_message_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className={`text-xs truncate ${
                                                conv.unread_count && conv.unread_count > 0
                                                    ? "text-mamen-gray-200 font-medium"
                                                    : "text-mamen-gray-500"
                                            }`}>
                                                {conv.last_message_preview || "No messages yet"}
                                            </p>
                                            {conv.unread_count !== undefined && conv.unread_count > 0 && (
                                                <span className="min-w-[18px] h-[18px] rounded-full bg-mamen-purple text-[10px] font-bold text-white flex items-center justify-center px-1 shrink-0">
                                                    {conv.unread_count}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right panel — Chat thread */}
                <div className={`flex-1 flex flex-col ${mobileShowThread ? "flex" : "hidden md:flex"}`}>
                    {activeTab === "notifications" ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <Bell size={48} className="text-mamen-purple mb-4" />
                            <h2 className="font-headline text-lg font-bold text-mamen-white mb-2">
                                MAMEN Notifications
                            </h2>
                            <p className="text-sm text-mamen-gray-500 max-w-xs">
                                System reminders from MAMEN show up here. Proof reminders open the related concert page.
                            </p>
                        </div>
                    ) : selectedConvId && selectedConv ? (
                        <>
                            {/* Thread header */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-mamen-gray-800">
                                {/* Back button (mobile) */}
                                <button
                                    onClick={() => setMobileShowThread(false)}
                                    className="md:hidden text-mamen-gray-200 hover:text-mamen-white transition-colors cursor-pointer"
                                >
                                    <ArrowLeft size={20} />
                                </button>

                                {/* Avatar */}
                                <div className="w-8 h-8 rounded-full bg-mamen-purple flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden">
                                    {selectedConv.other_user?.avatar ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={selectedConv.other_user.avatar}
                                            alt={selectedConv.other_user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        selectedConv.other_user?.name?.[0] || "?"
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <p className="font-headline text-sm font-bold text-mamen-white truncate">
                                        {selectedConv.other_user?.name}
                                    </p>
                                    <p className="text-[11px] text-mamen-gray-500">
                                        @{selectedConv.other_user?.handle}
                                    </p>
                                </div>
                            </div>

                            {/* Chat thread */}
                            <div className="flex-1 overflow-hidden">
                                <ChatThread
                                    messages={messages.map((m) => ({
                                        id: m.id,
                                        body: m.body,
                                        created_at: m.created_at,
                                        sender: m.sender,
                                    }))}
                                    currentUserId={user.id}
                                    onSend={handleSend}
                                    sending={sending}
                                    emptyText={`Start a conversation with ${selectedConv.other_user?.name || "this user"}`}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                            <MessageCircle size={48} className="text-mamen-gray-700 mb-4" />
                            <h2 className="font-headline text-lg font-bold text-mamen-gray-400 mb-2">
                                Your Messages
                            </h2>
                            <p className="text-sm text-mamen-gray-500 max-w-xs">
                                Select a conversation to start chatting, or message someone from their profile.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
