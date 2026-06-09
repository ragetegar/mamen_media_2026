"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getArticleHref } from "@/lib/article-taxonomy";
import { MessageCircle } from "lucide-react";
import { getArticles } from "@/lib/data";
import { Article } from "@/lib/types";

interface Comment {
    id: string;
    articleId: string;
    userId: string;
    userName: string;
    userRole: string;
    body: string;
    createdAt: string;
}

export default function ProfileComments({ userId }: { userId: string }) {
    const [comments] = useState<Comment[]>(() => {
        if (!userId || typeof window === "undefined") return [];
        try {
            const raw = localStorage.getItem("mamen_comments");
            if (!raw) return [];
            const all: Comment[] = JSON.parse(raw);
            return all
                .filter((comment) => comment.userId === userId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch {
            return [];
        }
    });
    const [articles, setArticles] = useState<Article[]>([]);

    useEffect(() => {
        async function fetchArticles() {
            try {
                const data = await getArticles();
                setArticles(data);
            } catch (err) {
                console.error("Failed to load articles", err);
            }
        }
        fetchArticles();
    }, []);

    if (comments.length === 0) {
        return (
            <div className="py-12 text-center border-2 border-dashed border-mamen-gray-800">
                <MessageCircle className="mx-auto text-mamen-gray-700 mb-3" size={32} />
                <p className="text-mamen-gray-700 font-headline text-base font-bold">
                    No comments found across articles yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => {
                const article = articles.find(a => a.id === comment.articleId);
                const title = article ? article.title : "Unknown Article";
                const href = article ? getArticleHref(article) : "/";

                return (
                    <div key={comment.id} className="p-4 bg-mamen-gray-900 border border-mamen-gray-800">
                        <div className="flex justify-between items-start mb-2 gap-3">
                            <Link
                                href={href}
                                title={title}
                                className="text-sm font-bold text-mamen-purple hover:underline truncate flex-1 block"
                            >
                                {title}
                            </Link>
                            <span className="text-xs text-mamen-gray-400 shrink-0">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="text-mamen-gray-200 text-sm whitespace-pre-wrap">{comment.body}</p>
                    </div>
                );
            })}
        </div>
    );
}
