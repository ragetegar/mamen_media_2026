"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFollow } from "@/lib/hooks/useFollow";
import LoginModal from "./LoginModal";

interface FollowButtonProps {
    targetUserId: string;
    size?: "sm" | "md";
}

export default function FollowButton({ targetUserId, size = "md" }: FollowButtonProps) {
    const { user } = useAuth();
    const { isFollowing, toggle, loading } = useFollow(targetUserId);
    const [showLogin, setShowLogin] = useState(false);
    const [hovered, setHovered] = useState(false);

    // Don't show follow button for own profile
    if (user?.id === targetUserId) return null;

    const handleClick = () => {
        if (!user) {
            setShowLogin(true);
            return;
        }
        toggle();
    };

    const sizeClasses = size === "sm"
        ? "px-3 py-1 text-xs"
        : "px-4 py-1.5 text-sm";

    const label = isFollowing
        ? hovered ? "Unfollow" : "Following"
        : "Follow";

    const bgClass = isFollowing
        ? hovered
            ? "bg-red-600/80 border-red-500 text-white"
            : "bg-mamen-gray-700 border-mamen-gray-600 text-mamen-white"
        : "bg-purple-600 border-purple-500 text-white hover:bg-purple-500";

    return (
        <>
            <button
                onClick={handleClick}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                disabled={loading}
                className={`font-headline font-bold uppercase tracking-wider border-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${bgClass}`}
            >
                {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    label
                )}
            </button>
            <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </>
    );
}
