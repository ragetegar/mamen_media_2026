"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Article, Concert } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { getAdminDashboardData } from "@/app/admin/actions";

export default function AdminDashboard() {
    const { user, isLoading: loadingAuth } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [productCount, setProductCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    useEffect(() => {
        if (loadingAuth) return;

        async function loadData() {
            setLoadError("");
            try {
                const data = await getAdminDashboardData();
                setArticles(data.articles);
                setConcerts(data.concerts);
                setProductCount(data.productCount);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                setLoadError(err instanceof Error ? err.message : "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user, loadingAuth]);

    const stats = [
        {
            label: "Total Articles",
            value: loading ? "…" : articles.length,
            color: "border-mamen-purple",
            bg: "bg-mamen-purple/10",
            icon: "📝",
            href: "/admin/articles",
        },
        {
            label: "Total Concerts",
            value: loading ? "…" : concerts.length,
            color: "border-mamen-magenta",
            bg: "bg-mamen-magenta/10",
            icon: "🎤",
            href: "/admin/concerts",
        },
        {
            label: "Affiliate Products",
            value: loading ? "…" : productCount,
            color: "border-mamen-lime",
            bg: "bg-mamen-lime/10",
            icon: "🛒",
            href: "/admin/articles",
        },
        {
            label: "Total Clicks",
            value: "—",
            color: "border-mamen-purple",
            bg: "bg-mamen-purple/10",
            icon: "📊",
            href: "/admin",
        },
    ];

    return (
        <div>
            <h1 className="font-headline text-3xl font-black text-mamen-white mb-8">
                Dashboard
            </h1>

            {!loading && loadError && (
                <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">
                    <p className="font-headline font-bold uppercase tracking-wider mb-1">Could not load dashboard</p>
                    <p>{loadError}</p>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                {stats.map((stat) => (
                    <Link key={stat.label} href={stat.href}>
                        <div
                            className={`${stat.bg} border-2 ${stat.color} p-6 transition-all hover:translate-y-[-2px]`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{stat.icon}</span>
                                <span className="font-headline text-3xl font-black text-mamen-white">
                                    {stat.value}
                                </span>
                            </div>
                            <p className="text-sm text-mamen-gray-200 font-medium">{stat.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 className="font-headline text-xl font-bold text-mamen-white mb-4">
                Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                    href="/admin/articles?new=true"
                    className="flex items-center gap-3 p-4 bg-mamen-purple/10 border-2 border-mamen-purple text-mamen-white hover:bg-mamen-purple/20 transition-colors"
                >
                    <span className="text-xl">✏️</span>
                    <span className="font-medium text-sm">New Article</span>
                </Link>
                <Link
                    href="/admin/concerts?new=true"
                    className="flex items-center gap-3 p-4 bg-mamen-magenta/10 border-2 border-mamen-magenta text-mamen-white hover:bg-mamen-magenta/20 transition-colors"
                >
                    <span className="text-xl">🎵</span>
                    <span className="font-medium text-sm">New Concert</span>
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-3 p-4 bg-mamen-lime/10 border-2 border-mamen-lime text-mamen-white hover:bg-mamen-lime/20 transition-colors"
                >
                    <span className="text-xl">🌐</span>
                    <span className="font-medium text-sm">View Live Site</span>
                </Link>
            </div>

            {/* Recent Articles */}
            <h2 className="font-headline text-xl font-bold text-mamen-white mt-12 mb-4">
                Recent Articles
            </h2>
            <div className="bg-mamen-black border-2 border-mamen-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-mamen-gray-800">
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Title
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Category
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Status
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Date
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-mamen-gray-700">
                                    Loading…
                                </td>
                            </tr>
                        ) : articles.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-mamen-gray-700">
                                    No articles yet. Create your first one!
                                </td>
                            </tr>
                        ) : (
                            articles.slice(0, 8).map((article) => (
                                <tr
                                    key={article.id}
                                    className="border-b border-mamen-gray-800 hover:bg-mamen-gray-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-mamen-white font-medium">
                                        <Link href={`/admin/articles?edit=${article.id}`} className="hover:text-mamen-purple transition-colors">
                                            {article.title}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-xs font-bold uppercase tracking-wider text-mamen-purple">
                                            {article.category} / {article.subcategory}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className={`text-xs font-bold uppercase tracking-wider ${article.status === "published" ? "text-mamen-lime" : "text-mamen-gray-700"}`}>
                                            {article.status || "published"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-mamen-gray-200 hidden md:table-cell">
                                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
