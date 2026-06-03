"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (user && !user.handle) {
                if (pathname !== "/setup-profile" && !pathname.startsWith("/auth/callback")) {
                    router.push("/setup-profile");
                }
            }
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return <>{children}</>;
    }

    if (user && !user.handle && pathname !== "/setup-profile" && !pathname.startsWith("/auth/callback")) {
        return (
            <div className="min-h-screen bg-mamen-black flex items-center justify-center border-t-4 border-mamen-purple">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-purple"></div>
            </div>
        );
    }

    return <>{children}</>;
}
