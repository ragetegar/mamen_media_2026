"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { deleteBarenganPost, getAdminBarenganPosts } from "@/app/admin/actions";
import { BARENGAN_STATUS_OPTIONS, BarenganPost } from "@/lib/types";
import { getBarenganCapacity, getBarenganMemberTotal } from "@/lib/barengan";
import { useAuth } from "@/lib/auth-context";

export default function AdminBarenganPage() {
    const { user, isLoading: loadingAuth } = useAuth();
    const [posts, setPosts] = useState<BarenganPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const stats = useMemo(() => {
        const active = posts.filter((post) => post.is_active).length;
        const inactive = posts.length - active;
        return { active, inactive, total: posts.length };
    }, [posts]);

    const loadPosts = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAdminBarenganPosts();
            setPosts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load Barengan posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loadingAuth || user?.role !== "admin") return;
        void loadPosts();
    }, [user?.role, loadingAuth]);

    const handleDelete = async (post: BarenganPost) => {
        const creator = post.profile?.name || post.profile?.handle || "this user";
        const eventTitle = post.concert?.title || "this event";
        if (!confirm(`Delete Barengan post by ${creator} for ${eventTitle}? This cannot be undone.`)) return;

        setDeletingId(post.id);
        setError("");
        try {
            await deleteBarenganPost(post.id);
            setPosts((current) => current.filter((item) => item.id !== post.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete Barengan post");
        } finally {
            setDeletingId(null);
        }
    };

    if (loadingAuth) {
        return <div className="py-20 text-center text-mamen-gray-200">Loading admin session...</div>;
    }

    if (user?.role !== "admin") {
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-mamen-gray-200">Only admins can manage Barengan posts.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="font-headline text-3xl font-black text-mamen-white">Barengan</h1>
                    <p className="text-sm text-mamen-gray-200 mt-1">
                        Review and delete Barengan posts from the admin panel.
                    </p>
                </div>
                <button
                    onClick={loadPosts}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-mamen-gray-800 text-mamen-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-gray-700 hover:border-mamen-purple disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <StatBox label="Total Posts" value={stats.total} color="border-mamen-purple" />
                <StatBox label="Active" value={stats.active} color="border-mamen-lime" />
                <StatBox label="Inactive" value={stats.inactive} color="border-mamen-magenta" />
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-mamen-black border-2 border-mamen-gray-800 overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                    <thead>
                        <tr className="border-b-2 border-mamen-gray-800">
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Creator
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Event
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Message
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Status
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Members
                            </th>
                            <th className="text-right px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-mamen-gray-200">
                                    Loading Barengan posts...
                                </td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-12 text-center text-mamen-gray-200">
                                    No Barengan posts yet.
                                </td>
                            </tr>
                        ) : (
                            posts.map((post) => {
                                const statusInfo = BARENGAN_STATUS_OPTIONS.find((status) => status.value === post.status);
                                return (
                                    <tr key={post.id} className="border-b border-mamen-gray-800 align-top hover:bg-mamen-gray-900/70">
                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-mamen-white">{post.profile?.name || "Anonymous"}</p>
                                            <p className="text-xs text-mamen-gray-200">@{post.profile?.handle || "user"}</p>
                                            <p className="text-xs text-mamen-gray-700 mt-1">{formatDate(post.created_at)}</p>
                                        </td>
                                        <td className="px-4 py-4 max-w-[220px]">
                                            <p className="font-semibold text-mamen-white line-clamp-2">{post.concert?.title || "Unknown event"}</p>
                                            <p className="text-xs text-mamen-gray-200 mt-1">
                                                {post.concert?.start_datetime ? formatDate(post.concert.start_datetime) : "No date"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 max-w-[280px]">
                                            <p className="text-mamen-gray-100 line-clamp-3">{post.message || "No message."}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`inline-flex px-2 py-1 border text-xs font-headline font-bold uppercase tracking-wider ${post.is_active ? "border-mamen-lime text-mamen-lime" : "border-mamen-gray-700 text-mamen-gray-200"}`}>
                                                {post.is_active ? "Active" : "Inactive"}
                                            </span>
                                            <p className="text-xs text-mamen-purple mt-2">{statusInfo?.label || post.status}</p>
                                        </td>
                                        <td className="px-4 py-4 text-mamen-gray-100">
                                            {getBarenganMemberTotal(post)}/{getBarenganCapacity(post)}
                                            <p className="text-xs text-mamen-gray-700 mt-1">
                                                {post.member_count || 0} requests total
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/barengan/${post.id}`}
                                                    className="inline-flex items-center justify-center text-mamen-purple hover:text-mamen-magenta"
                                                    title="Open Barengan post"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post)}
                                                    disabled={deletingId === post.id}
                                                    className="inline-flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-50"
                                                    title="Delete Barengan post"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className={`bg-mamen-black border-2 ${color} p-5`}>
            <p className="text-xs font-headline font-bold uppercase tracking-wider text-mamen-gray-200">{label}</p>
            <p className="font-headline text-3xl font-black text-mamen-white mt-2">{value}</p>
        </div>
    );
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
