"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";

export default function NewsletterBlock() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || submitting) return;

        setSubmitting(true);
        setError("");

        try {
            const response = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to subscribe");
            }

            trackEvent("newsletter_signup", { method: "homepage" });
            setSubmitted(true);
            setEmail("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to subscribe");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="relative overflow-hidden">
            {/* Neon background */}
            <div className="bg-mamen-purple">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        {/* Stacked headline */}
                        <h2 className="font-headline text-5xl sm:text-6xl md:text-8xl font-black leading-[0.9] text-mamen-white">
                            JOIN
                            <br />
                            THE
                            <br />
                            <span className="text-mamen-lime">CROWD</span>
                            <span className="text-mamen-magenta">.</span>
                        </h2>

                        <p className="mt-6 text-lg text-white/80">
                            Gig alerts, drops, secret shows — straight to your inbox.
                        </p>

                        {submitted ? (
                            <div className="mt-8 border-4 border-mamen-lime bg-mamen-black p-6 shadow-hard-lime">
                                <p className="font-headline text-xl font-bold text-mamen-lime">
                                    YOU&apos;RE IN!
                                </p>
                                <p className="mt-2 text-sm text-mamen-gray-200">
                                    Welcome to the crowd. Check your inbox for a confirmation.
                                </p>
                            </div>
                        ) : (
                            <>
                                <form
                                    onSubmit={handleSubmit}
                                    className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
                                >
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="flex-1 px-5 py-4 bg-mamen-black border-4 border-mamen-black text-mamen-white placeholder:text-mamen-gray-700 font-medium text-sm shadow-hard focus:outline-none focus:border-mamen-lime focus:shadow-hard-lime transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-8 py-4 bg-mamen-lime text-mamen-black font-headline font-bold text-sm uppercase tracking-wider border-4 border-mamen-black shadow-hard hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Saving..." : "Subscribe"}
                                    </button>
                                </form>
                                {error && (
                                    <p className="mt-3 text-sm font-bold text-white">
                                        {error}
                                    </p>
                                )}
                            </>
                        )}

                        <p className="mt-4 text-xs text-white/50">
                            By subscribing you agree to our Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>

            {/* Diagonal accent at bottom */}
            <div className="h-4 bg-mamen-magenta" />
        </section>
    );
}
