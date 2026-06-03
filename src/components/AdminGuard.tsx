"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/");
            } else if (user.role !== "admin" && user.role !== "contributor") {
                router.push("/");
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-mamen-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-mamen-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || (user.role !== "admin" && user.role !== "contributor")) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
