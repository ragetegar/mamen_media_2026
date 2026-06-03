"use client";

import { useState } from "react";
import CommentsSection from "@/components/CommentsSection";
import LoginModal from "@/components/LoginModal";

export default function BarenganComments({ barenganPostId }: { barenganPostId: string }) {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <>
            <CommentsSection
                barenganPostId={barenganPostId}
                onLoginRequest={() => setShowLogin(true)}
                requireAuth
            />
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </>
    );
}
