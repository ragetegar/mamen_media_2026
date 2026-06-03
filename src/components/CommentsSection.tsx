"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { MessageCircle, LogIn, Send, Trash2, Reply, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Comment {
    id: string;
    article_id: string;
    parent_id: string | null;
    user_id: string;
    body: string;
    created_at: string;
    user_name: string;
    user_handle: string;
    user_avatar: string | null;
    user_role: "admin" | "contributor" | "user";
}

interface CommentsSectionProps {
    articleId?: string;
    barenganPostId?: string;
    onLoginRequest: () => void;
    requireAuth?: boolean; // If true, non-logged-in users see auth prompt instead of comments
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ── Avatar with optional profile link ──
function AvatarCircle({
    src,
    name,
    handle,
    size = 32,
}: {
    src?: string | null;
    name: string;
    handle?: string;
    size?: number;
}) {
    const circle = src ? (
        <Image
            src={src}
            alt={name}
            width={size}
            height={size}
            className="rounded-full object-cover shrink-0"
            style={{ width: size, height: size }}
        />
    ) : (
        <div
            className="rounded-full bg-mamen-purple flex items-center justify-center font-headline font-black text-white shrink-0"
            style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
            {name[0]?.toUpperCase() || "?"}
        </div>
    );

    if (handle) {
        return (
            <Link href={`/profile/${handle}`} className="shrink-0 hover:opacity-80 transition-opacity">
                {circle}
            </Link>
        );
    }

    return circle;
}

// ── Username with optional profile link ──
function UserName({ name, handle }: { name: string; handle?: string }) {
    if (handle) {
        return (
            <Link
                href={`/profile/${handle}`}
                className="font-headline text-sm font-bold text-mamen-white hover:text-mamen-lime transition-colors"
            >
                {name}
            </Link>
        );
    }
    return <span className="font-headline text-sm font-bold text-mamen-white">{name}</span>;
}

// ── Single comment card (used for top-level and replies) ──
function CommentCard({
    comment,
    user,
    onDelete,
    onReply,
    isReply = false,
}: {
    comment: Comment;
    user: ReturnType<typeof useAuth>["user"];
    onDelete: (id: string) => void;
    onReply: (comment: Comment) => void;
    isReply?: boolean;
}) {
    const canDelete =
        user && (user.id === comment.user_id || user.role === "admin" || user.role === "contributor");

    return (
        <div className={`p-4 bg-mamen-gray-900 border-2 border-mamen-gray-800 group transition-all ${isReply ? "ml-8 md:ml-12 border-l-4 border-l-mamen-purple/40" : ""}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <AvatarCircle
                        src={comment.user_avatar}
                        name={comment.user_name}
                        handle={comment.user_handle}
                        size={isReply ? 28 : 32}
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <UserName name={comment.user_name} handle={comment.user_handle} />
                            {comment.user_role === "admin" && (
                                <span className="text-xs px-1.5 py-0.5 bg-mamen-purple text-white font-bold uppercase tracking-wider">
                                    Admin
                                </span>
                            )}
                            {comment.user_role === "contributor" && (
                                <span className="text-xs px-1.5 py-0.5 bg-mamen-magenta text-white font-bold uppercase tracking-wider">
                                    Contributor
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-mamen-gray-700">
                            {formatDate(comment.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Reply button */}
                    {user && !isReply && (
                        <button
                            onClick={() => onReply(comment)}
                            className="p-1.5 text-mamen-gray-700 hover:text-mamen-lime transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Reply"
                        >
                            <Reply size={14} />
                        </button>
                    )}
                    {/* Delete button */}
                    {canDelete && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="p-1.5 text-mamen-gray-700 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete comment"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>
            <p className="text-mamen-gray-100 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.body}
            </p>
        </div>
    );
}

// ── Main component ──
export default function CommentsSection({ articleId, barenganPostId, onLoginRequest, requireAuth = false }: CommentsSectionProps) {
    const parentId = articleId || barenganPostId;
    const parentColumn = articleId ? "article_id" : "barengan_post_id";
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [replyBody, setReplyBody] = useState("");
    const replyInputRef = useRef<HTMLTextAreaElement>(null);

    // Fetch comments from Supabase
    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from("comments_with_profiles")
                .select("*")
                .eq(parentColumn, parentId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching comments:", error.message);
            } else {
                setComments(data as Comment[]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (parentId) {
            fetchComments();
        }
    }, [parentId]);

    // Focus reply input when replying
    useEffect(() => {
        if (replyingTo && replyInputRef.current) {
            replyInputRef.current.focus();
        }
    }, [replyingTo]);

    // Handle Top-Level Comment Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !body.trim()) return;
        setSubmitting(true);

        const { data, error } = await supabase
            .from("comments")
            .insert({
                [parentColumn]: parentId,
                user_id: user.id,
                body: body.trim(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error posting comment:", error.message);
        } else if (data) {
            await fetchComments();
            setBody("");
        }

        setSubmitting(false);
    };

    // Handle Reply Submission
    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !replyBody.trim() || !replyingTo) return;
        setSubmitting(true);

        const { data, error } = await supabase
            .from("comments")
            .insert({
                [parentColumn]: parentId,
                parent_id: replyingTo.id,
                user_id: user.id,
                body: replyBody.trim(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error posting reply:", error.message);
        } else if (data) {
            // Re-fetch to get joined profile data
            await fetchComments();
            setReplyBody("");
            setReplyingTo(null);
        }

        setSubmitting(false);
    };

    // Handle Delete (with optimistic local update + database sync)
    const handleDelete = async (id: string) => {
        // Optimistically remove from UI
        setComments((prev) => {
            const toDelete = new Set<string>([id]);
            prev.forEach((c) => {
                if (c.parent_id === id) toDelete.add(c.id);
            });
            return prev.filter((c) => !toDelete.has(c.id));
        });

        if (replyingTo?.id === id) setReplyingTo(null);

        // Delete from DB
        const { error } = await supabase
            .from("comments")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting comment:", error.message);
            // Re-fetch to restore state if deletion failed
            await fetchComments();
        }
    };

    // Separate top-level comments and replies for rendering
    const topLevelComments = comments.filter((c) => !c.parent_id);
    const repliesMap = new Map<string, Comment[]>();
    comments.forEach((c) => {
        if (c.parent_id) {
            const existing = repliesMap.get(c.parent_id) || [];
            existing.push(c);
            repliesMap.set(c.parent_id, existing);
        }
    });

    const totalCount = comments.length;

    // Auth gate for barengan comments
    if (requireAuth && !user) {
        return (
            <div className="mt-12 pt-8 border-t-4 border-mamen-purple">
                <h2 className="font-headline text-2xl font-bold text-mamen-white uppercase tracking-wide mb-6 flex items-center gap-3">
                    <MessageCircle className="text-mamen-purple" size={24} />
                    Comments
                </h2>
                <div className="p-8 bg-mamen-gray-900 border-2 border-mamen-gray-800 text-center">
                    <MessageCircle className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                    <p className="text-mamen-gray-200 text-sm mb-4">
                        <span className="font-bold text-mamen-white">Login</span> to see and join the discussion.
                    </p>
                    <button
                        onClick={onLoginRequest}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-mamen-purple text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                    >
                        <LogIn size={12} />
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 pt-8 border-t-4 border-mamen-purple">
            <h2 className="font-headline text-2xl font-bold text-mamen-white uppercase tracking-wide mb-6 flex items-center gap-3">
                <MessageCircle className="text-mamen-purple" size={24} />
                Comments{" "}
                {!loading && totalCount > 0 && (
                    <span className="text-mamen-gray-700 text-lg font-medium">
                        ({totalCount})
                    </span>
                )}
            </h2>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <AvatarCircle src={user.avatar} name={user.name} handle={user.handle} size={36} />
                        <UserName name={user.name} handle={user.handle} />
                        {user.role === "admin" && (
                            <span className="text-xs px-2 py-0.5 bg-mamen-purple text-white font-bold uppercase tracking-wider">
                                Admin
                            </span>
                        )}
                        {user.role === "contributor" && (
                            <span className="text-xs px-2 py-0.5 bg-mamen-magenta text-white font-bold uppercase tracking-wider">
                                Contributor
                            </span>
                        )}
                    </div>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="w-full px-4 py-3 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple transition-colors resize-y placeholder:text-mamen-gray-700"
                        rows={3}
                        required
                    />
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={submitting || !body.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-mamen-purple text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                        >
                            <Send size={12} />
                            {submitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-8 p-5 bg-mamen-gray-900 border-2 border-mamen-gray-800 flex items-center justify-between gap-4">
                    <p className="text-mamen-gray-200 text-sm">
                        <span className="font-bold text-mamen-white">Login</span> to join the conversation and leave a comment.
                    </p>
                    <button
                        onClick={onLoginRequest}
                        className="flex items-center gap-2 px-4 py-2.5 bg-mamen-purple text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer shrink-0"
                    >
                        <LogIn size={12} />
                        Login
                    </button>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="py-10 text-center border-2 border-dashed border-mamen-gray-800 animate-pulse">
                    <MessageCircle className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                    <p className="text-mamen-gray-700 font-headline text-base font-bold">
                        Loading comments...
                    </p>
                </div>
            ) : topLevelComments.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-mamen-gray-800">
                    <MessageCircle className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                    <p className="text-mamen-gray-700 font-headline text-base font-bold">
                        No comments yet. Be the first!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {topLevelComments.map((comment) => {
                        const replies = repliesMap.get(comment.id) || [];
                        return (
                            <div key={comment.id}>
                                {/* Parent comment */}
                                <CommentCard
                                    comment={comment}
                                    user={user}
                                    onDelete={handleDelete}
                                    onReply={(c) => setReplyingTo(c)}
                                />

                                {/* Replies */}
                                {replies.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        {replies.map((reply) => (
                                            <CommentCard
                                                key={reply.id}
                                                comment={reply}
                                                user={user}
                                                onDelete={handleDelete}
                                                onReply={() => { }}
                                                isReply
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Inline reply form */}
                                {replyingTo?.id === comment.id && user && (
                                    <form onSubmit={handleReplySubmit} className="ml-8 md:ml-12 mt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Reply size={14} className="text-mamen-purple" />
                                            <span className="text-xs text-mamen-gray-200 font-headline font-bold">
                                                Replying to <span className="text-mamen-lime">@{replyingTo.user_name}</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => { setReplyingTo(null); setReplyBody(""); }}
                                                className="p-0.5 text-mamen-gray-700 hover:text-red-400 transition-colors cursor-pointer focus:outline-none"
                                                title="Cancel reply"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                        <textarea
                                            ref={replyInputRef}
                                            value={replyBody}
                                            onChange={(e) => setReplyBody(e.target.value)}
                                            placeholder="Write a reply..."
                                            className="w-full px-3 py-2 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple transition-colors resize-y placeholder:text-mamen-gray-700"
                                            rows={2}
                                            required
                                        />
                                        <div className="flex justify-end mt-1.5">
                                            <button
                                                type="submit"
                                                disabled={submitting || !replyBody.trim()}
                                                className="flex items-center gap-2 px-4 py-2 bg-mamen-purple text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                                            >
                                                <Send size={10} />
                                                {submitting ? "Posting..." : "Reply"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
