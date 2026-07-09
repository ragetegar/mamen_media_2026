"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ProfileSnippet } from "@/lib/types";
import { ProfileTrustBadges } from "@/components/ProfileBadges";
import { Send } from "lucide-react";
import { formatDate } from "@/lib/format";

interface ChatMessage {
    id: string;
    body: string;
    created_at: string;
    sender?: ProfileSnippet;
}

interface ChatThreadProps {
    messages: ChatMessage[];
    currentUserId: string;
    onSend: (body: string) => void;
    sending: boolean;
    readOnly?: boolean;
    emptyText?: string;
}

export default function ChatThread({
    messages,
    currentUserId,
    onSend,
    sending,
    readOnly = false,
    emptyText = "No messages yet. Start the conversation!",
}: ChatThreadProps) {
    const [text, setText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = () => {
        if (!text.trim() || sending) return;
        onSend(text.trim());
        setText("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Message list */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px] max-h-[400px]"
            >
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-mamen-gray-700">{emptyText}</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isSelf = msg.sender?.id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex items-end gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                            >
                                {/* Avatar */}
                                <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 shrink-0">
                                    {msg.sender?.avatar ? (
                                        <Image
                                            src={msg.sender.avatar}
                                            alt={msg.sender.name || "User"}
                                            width={28}
                                            height={28}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500 font-headline font-bold text-[10px]">
                                            {(msg.sender?.name || "?")[0]?.toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Bubble */}
                                <div
                                    className={`max-w-[70%] px-3 py-2 text-sm leading-relaxed ${
                                        isSelf
                                            ? "bg-mamen-purple/20 border border-mamen-purple/40 text-mamen-white"
                                            : "bg-zinc-900 border border-zinc-800 text-mamen-gray-100"
                                    }`}
                                >
                                    {!isSelf && (
                                        <div className="mb-0.5 flex items-center gap-1.5 flex-wrap">
                                            <p className="text-[10px] font-headline font-bold text-mamen-purple">
                                                {msg.sender?.name || "Anonymous"}
                                            </p>
                                            <ProfileTrustBadges profile={msg.sender} compact />
                                        </div>
                                    )}
                                    <p>{msg.body}</p>
                                    <p className={`text-[10px] mt-1 ${isSelf ? "text-mamen-gray-200" : "text-zinc-600"}`}>
                                        {getRelativeTime(new Date(msg.created_at))}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input bar or read-only banner */}
            {readOnly ? (
                <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 text-center">
                    <p className="text-xs text-mamen-gray-700">This chat has ended.</p>
                </div>
            ) : (
                <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        maxLength={500}
                        className="flex-1 bg-mamen-black border-2 border-zinc-700 px-3 py-2 text-sm text-mamen-white outline-none focus:border-mamen-purple transition-colors placeholder:text-zinc-600"
                    />
                    <button
                        onClick={handleSend}
                        disabled={sending || !text.trim()}
                        className="px-3 py-2 bg-mamen-purple text-mamen-white border-2 border-mamen-black font-headline font-bold text-xs uppercase tracking-wider transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <Send size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}

function getRelativeTime(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return formatDate(date, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
