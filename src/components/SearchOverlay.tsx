"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import { getArticles } from "@/lib/data";
import { Article } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [articles, setArticles] = useState<Article[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const results = useMemo(() => {
        if (!query.trim()) return [];

        const lower = query.toLowerCase();
        return articles.filter(
            (a) =>
                a.title.toLowerCase().includes(lower) ||
                a.excerpt.toLowerCase().includes(lower) ||
                a.category.toLowerCase().includes(lower) ||
                a.author.toLowerCase().includes(lower) ||
                (a.tags && a.tags.some((t) => t.toLowerCase().includes(lower)))
        ).slice(0, 6);
    }, [articles, query]);

    useEffect(() => {
        if (isOpen) {
            getArticles().then(setArticles).catch(() => setArticles([]));
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

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
                        {results.length === 0 ? (
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
                                {results.map((article, i) => (
                                    <li
                                        key={article.id}
                                        className={`border-b border-mamen-gray-800 last:border-b-0 ${i === 0 ? "" : ""}`}
                                    >
                                        <Link
                                            href={`/${article.category}/${article.slug}`}
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
                                                        {article.category}
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
                            </ul>
                        )}
                        <div className="px-5 py-2.5 border-t border-mamen-gray-800 bg-mamen-black/50">
                            <p className="text-xs text-mamen-gray-700 font-headline tracking-wider uppercase">
                                {results.length} result{results.length !== 1 ? "s" : ""} found
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
