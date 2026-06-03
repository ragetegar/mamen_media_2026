"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function SetupProfilePage() {
    const { user, updateProfile, isLoading } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Redirect if they aren't logged in, or if they ALREADY have a handle
        if (!isLoading) {
            if (!user) {
                router.push("/");
            } else if (user.handle) {
                router.push("/");
            } else {
                // Prefill name if available from Google
                if (user.name) setName(user.name);
            }
        }
    }, [user, isLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        const result = await updateProfile({ name, handle });
        setSubmitting(false);

        if (result.success) {
            router.push("/");
            router.refresh();
        } else {
            setError(result.error || "Failed to update profile");
        }
    };

    if (isLoading || !user || user.handle) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-mamen-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-purple"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mamen-black flex items-center justify-center p-4">
            <div className="bg-mamen-gray-900 border-4 border-mamen-purple w-full max-w-md shadow-hard-purple p-8">
                <h1 className="font-headline text-3xl font-black text-mamen-white mb-2">
                    WELCOME TO <span className="text-mamen-purple">MAMEN</span>
                </h1>
                <p className="text-mamen-gray-200 mb-8 text-sm">
                    Complete your profile to join the culture.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="px-4 py-3 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-headline tracking-wider uppercase text-mamen-gray-200 mb-1.5">
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple transition-colors"
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-headline tracking-wider uppercase text-mamen-gray-200 mb-1.5">
                            Unique Handle
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-mamen-gray-400 font-bold">@</span>
                            <input
                                type="text"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase())}
                                className="w-full pl-9 pr-4 py-3 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple transition-colors"
                                placeholder="username"
                                required
                                minLength={3}
                                maxLength={20}
                            />
                        </div>
                        <p className="text-xs text-mamen-gray-500 mt-1">Letters, numbers, and underscores only</p>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || !name || !handle || handle.length < 3}
                        className="w-full flex items-center justify-center py-3 bg-mamen-lime text-mamen-black font-headline text-sm font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {submitting ? "Saving..." : "Complete Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
}
