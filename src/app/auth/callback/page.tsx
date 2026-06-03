"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase";
import { Suspense } from "react";

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check for error from route handler redirect
        const urlError = searchParams.get("error");
        const urlErrorDesc = searchParams.get("error_description");
        if (urlError) {
            setError(urlErrorDesc || urlError);
            return;
        }

        // Handle hash-based auth (magic link with #access_token=)
        const hash = window.location.hash;
        if (hash && hash.includes("access_token=")) {
            const supabase = getBrowserSupabase();
            // Supabase client will automatically parse the hash
            supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
                if (sessionError || !session) {
                    setError(sessionError?.message || "Failed to establish session");
                    return;
                }
                // Check profile and redirect
                supabase
                    .from("profiles")
                    .select("handle")
                    .eq("id", session.user.id)
                    .single()
                    .then(({ data: profile }) => {
                        if (!profile?.handle) {
                            router.push("/setup-profile");
                        } else {
                            router.push("/");
                        }
                    });
            });
            return;
        }

        // If we got here with no hash and no error, maybe the session is already set via cookie
        // (from the route handler). Just redirect home.
        router.push("/");
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen bg-mamen-black flex flex-col items-center justify-center p-4">
                <div className="bg-red-900/30 border-2 border-red-500 text-red-300 p-6 max-w-md w-full text-center">
                    <h2 className="font-headline font-bold mb-2">Authentication Error</h2>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-4 px-4 py-2 bg-mamen-gray-800 text-white text-xs hover:bg-mamen-gray-700 uppercase font-headline font-bold tracking-widest transition-colors"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mamen-black flex flex-col items-center justify-center border-t-4 border-mamen-purple">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-purple mb-4"></div>
            <p className="text-mamen-gray-400 font-headline uppercase tracking-widest text-xs">Completing sign in...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-mamen-black flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-purple mb-4"></div>
            </div>
        }>
            <CallbackContent />
        </Suspense>
    );
}
