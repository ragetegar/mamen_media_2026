"use client";

import { ReactNode, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import LoginModal from "@/components/LoginModal";
import { LogIn } from "lucide-react";

interface AuthWallProps {
    children: ReactNode;
    fallback?: ReactNode;
    blurContent?: boolean;
}

export default function AuthWall({ children, fallback, blurContent }: AuthWallProps) {
    const { user, isLoading } = useAuth();
    const [loginOpen, setLoginOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-mamen-purple"></div>
            </div>
        );
    }

    if (user) {
        return <>{children}</>;
    }

    // Not logged in
    if (blurContent) {
        return (
            <div className="relative">
                <div className="blur-sm pointer-events-none select-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-mamen-black/60">
                    <div className="bg-mamen-gray-900 border-2 border-mamen-purple p-6 text-center max-w-sm shadow-hard-purple">
                        <LogIn size={28} className="mx-auto text-mamen-purple mb-3" />
                        <h3 className="font-headline text-lg font-black text-mamen-white mb-2">
                            LOGIN TO <span className="text-mamen-purple">VIEW</span>
                        </h3>
                        <p className="text-sm text-mamen-gray-200 mb-4">
                            Sign in to see who&apos;s attending and join the community.
                        </p>
                        <button
                            onClick={() => setLoginOpen(true)}
                            className="px-6 py-2.5 bg-mamen-purple text-white font-headline text-sm font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                        >
                            Login
                        </button>
                    </div>
                </div>
                <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
            </div>
        );
    }

    // No blur — show fallback or default card
    return (
        <>
            {fallback || (
                <div className="bg-mamen-gray-900 border-2 border-mamen-gray-800 p-8 text-center">
                    <LogIn size={28} className="mx-auto text-mamen-purple mb-3" />
                    <h3 className="font-headline text-lg font-black text-mamen-white mb-2">
                        LOGIN <span className="text-mamen-purple">REQUIRED</span>
                    </h3>
                    <p className="text-sm text-mamen-gray-200 mb-4">
                        You need to be logged in to access this content.
                    </p>
                    <button
                        onClick={() => setLoginOpen(true)}
                        className="px-6 py-2.5 bg-mamen-purple text-white font-headline text-sm font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
                    >
                        Login
                    </button>
                </div>
            )}
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
