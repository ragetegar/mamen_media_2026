"use client";

import CommentsSection from "@/components/CommentsSection";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";

interface ArticlePageClientProps {
    articleId: string;
}

// Client component boundary — wraps CommentsSection in the server-rendered article page
// Also manages the login modal that CommentsSection may request to open
export default function ArticlePageClient({ articleId }: ArticlePageClientProps) {
    const [loginOpen, setLoginOpen] = useState(false);

    return (
        <>
            <CommentsSection
                articleId={articleId}
                onLoginRequest={() => setLoginOpen(true)}
            />
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
