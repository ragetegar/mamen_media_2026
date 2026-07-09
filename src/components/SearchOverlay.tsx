"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Article, Concert } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { getArticleCategoryLabel, getArticleHref, getArticleSubcategoryLabel } from "@/lib/article-taxonomy";
import { formatDate } from "@/lib/format";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const [concerts, setConcerts] = useState<Pick<Concert, "id" | "slug" | "title" | "poster_image" | "venue" | "city" | "start_datetime">[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || query.trim().length < 2) {
            setArticles([]);
            setConcerts([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timer = window.setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
                    signal: controller.signal,
                });
                const data = await response.json();
                setArticles(data.articles || []);
                setConcerts(data.concerts || []);
            } catch (error) {
                if (!(error instanceof DOMException && error.name === "AbortError")) {
                    setArticles([]);
                    setConcerts([]);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 220);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [isOpen, query]);

    const handleClose = useCallback(() => {
        setQuery("");
        onClose();
    }, [onClose]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [handleClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col items-center pt-[10vh] px-4"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            {/* Search Box */}
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-3 bg-mamen-gray-900 border-4 border-mamen-purple px-5 py-4 shadow-hard-purple">
                    <Search className="text-mamen-purple shrink-0" size={22} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search articles, concerts, categories..."
                        className="flex-1 bg-transparent text-mamen-white text-lg placeholder:text-mamen-gray-700 focus:outline-none font-body"
                    />
                    <button
                        onClick={handleClose}
                        className="text-mamen-gray-200 hover:text-mamen-white transition-colors cursor-pointer shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Quick hint */}
                {!query && (
                    <p className="text-mamen-gray-700 text-xs font-headline tracking-widest uppercase mt-4 text-center">
                        Press ESC to close
                    </p>
                )}

                {/* Results */}
                {query && (
                    <div className="mt-3 bg-mamen-gray-900 border-4 border-mamen-purple overflow-hidden shadow-hard-purple">
                        {loading ? (
                            <div className="px-6 py-10 text-center">
                                <p className="font-headline text-xl font-bold text-mamen-gray-700">
                                    Searching...
                                </p>
                            </div>
                        ) : articles.length === 0 && concerts.length === 0 ? (
                            <div className="px-6 py-10 text-center">
                                <p className="font-headline text-xl font-bold text-mamen-gray-700">
                                    No results for &ldquo;{query}&rdquo;
                                </p>
                                <p className="text-sm text-mamen-gray-700 mt-2">
                                    Try searching for a category, artist, or topic.
                                </p>
                            </div>
                        ) : (
                            <ul>
                                {articles.map((article, i) => (
                                    <li
                                        key={article.id}
                                        className={`border-b border-mamen-gray-800 last:border-b-0 ${i === 0 ? "" : ""}`}
                                    >
                                        <Link
                                            href={getArticleHref(article)}
                                            onClick={handleClose}
                                            className="flex items-center gap-4 px-5 py-4 hover:bg-mamen-gray-800 transition-colors group"
                                        >
                                            <div className="relative w-16 h-12 shrink-0 overflow-hidden">
                                                <Image
                                                    src={article.cover_image}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-headline text-sm font-bold text-mamen-white group-hover:text-mamen-lime transition-colors line-clamp-1">
                                                    {article.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-mamen-purple font-bold uppercase tracking-wider">
                                                        {getArticleCategoryLabel(article.category)} / {getArticleSubcategoryLabel(article)}
                                                    </span>
                                                    <span className="text-mamen-gray-700 text-xs">•</span>
                                                    <span className="text-xs text-mamen-gray-200">
                                                        {article.author}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-mamen-gray-700 group-hover:text-mamen-lime transition-colors shrink-0">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                                {concerts.map((concert) => (
                                    <li key={concert.id} className="border-b border-mamen-gray-800 last:border-b-0">
                                        <Link
                                            href={`/concerts/${concert.slug}`}
                                            onClick={handleClose}
                                            className="flex items-center gap-4 px-5 py-4 hover:bg-mamen-gray-800 transition-colors group"
                                        >
                                            <div className="relative w-16 h-12 shrink-0 overflow-hidden">
                                                <Image
                                                    src={concert.poster_image}
                                                    alt={concert.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="64px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-headline text-sm font-bold text-mamen-white group-hover:text-mamen-lime transition-colors line-clamp-1">
                                                    {concert.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-mamen-purple font-bold uppercase tracking-wider">
                                                        Concert / {concert.city}
                                                    </span>
                                                    <span className="text-mamen-gray-700 text-xs">•</span>
                                                    <span className="text-xs text-mamen-gray-200">
                                                        {formatDate(concert.start_datetime, { day: "numeric", month: "short", year: "numeric" })}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-mamen-gray-700 group-hover:text-mamen-lime transition-colors shrink-0">
                                                →
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="px-5 py-2.5 border-t border-mamen-gray-800 bg-mamen-black/50">
                            <p className="text-xs text-mamen-gray-700 font-headline tracking-wider uppercase">
                                {articles.length + concerts.length} result{articles.length + concerts.length !== 1 ? "s" : ""} found
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
