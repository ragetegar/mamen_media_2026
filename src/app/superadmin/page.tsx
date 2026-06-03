"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SuperAdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/superadmin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed");
                setLoading(false);
            } else {
                // Instantly redirect to Supabase generated magic link to login
                window.location.href = data.url;
            }
        } catch (err) {
            setError("Network error. Check connection.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-mamen-gray-900 border-4 border-mamen-purple shadow-[8px_8px_0px_var(--shadow-color)] p-8 relative">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-mamen-purple flex items-center justify-center rotate-3 border-4 border-mamen-white shadow-hard-sm">
                        <Lock size={28} className="text-white -rotate-3" />
                    </div>
                </div>

                <h1 className="font-headline text-3xl font-black uppercase text-center text-mamen-white tracking-widest mb-2">
                    Superadmin
                </h1>
                <p className="text-center text-mamen-gray-200 text-sm mb-8 font-medium">
                    Restricted Area
                </p>

                {error && (
                    <div className="mb-6 p-3 border-2 border-mamen-magenta bg-mamen-magenta/10 text-mamen-magenta text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block font-headline text-xs font-bold uppercase tracking-widest text-mamen-gray-200 mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-mamen-black border-2 border-mamen-gray-700 text-mamen-white focus:outline-none focus:border-mamen-purple transition-colors"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block font-headline text-xs font-bold uppercase tracking-widest text-mamen-gray-200 mb-2">
                            Master Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-mamen-black border-2 border-mamen-gray-700 text-mamen-white focus:outline-none focus:border-mamen-purple transition-colors"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-8 py-4 bg-mamen-purple text-mamen-white font-headline text-base font-black uppercase tracking-widest border-2 border-mamen-white shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Authenticating..." : "Login to CMS"}
                    </button>
                    <p className="text-center mt-6 text-xs text-mamen-gray-400">
                        Login via master password for all registered Admin accounts.
                    </p>
                </form>
            </div>
        </div>
    );
}
