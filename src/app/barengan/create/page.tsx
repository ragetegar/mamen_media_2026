"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import ConcertPicker from "@/components/ConcertPicker";
import Button from "@/components/ui/Button";
import { Concert, BarenganStatus, BARENGAN_STATUS_OPTIONS } from "@/lib/types";
import { createBarenganPost } from "@/lib/data";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBarenganPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
    const [status, setStatus] = useState<BarenganStatus>("interested_will_come");
    const [message, setMessage] = useState("");
    const [lookingFor, setLookingFor] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    if (!user) {
        return (
            <section className="bg-mamen-black py-20 min-h-screen">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="font-headline text-3xl font-black text-mamen-white mb-4">
                        LOGIN REQUIRED
                    </h1>
                    <p className="text-mamen-gray-200 mb-8">
                        You need to be logged in with a verified email to create a Barengan post.
                    </p>
                    <Link href="/barengan">
                        <Button variant="secondary">← Back to Barengan</Button>
                    </Link>
                </div>
            </section>
        );
    }

    const handleSubmit = async () => {
        if (!selectedConcert) {
            setError("Please select a concert");
            return;
        }
        if (!message.trim()) {
            setError("Please write a message");
            return;
        }

        setSubmitting(true);
        setError("");

        const result = await createBarenganPost({
            user_id: user.id,
            concert_id: selectedConcert.id,
            status,
            message: message.trim(),
            looking_for: lookingFor,
        });

        if (result.success) {
            router.push(`/barengan/${result.id}`);
        } else {
            setError(result.error || "Failed to create post");
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Header */}
            <section className="bg-mamen-black py-8 md:py-12 border-b-4 border-mamen-purple">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/barengan"
                        className="inline-flex items-center gap-2 text-sm text-mamen-gray-200 hover:text-mamen-lime transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back to Barengan
                    </Link>
                    <h1 className="font-headline text-3xl sm:text-4xl font-black text-mamen-white">
                        CREATE <span className="text-mamen-purple">BARENGAN</span>
                    </h1>
                    <p className="mt-2 text-mamen-gray-200 text-sm">
                        Find your concert buddy — post which concert you&apos;re going to!
                    </p>
                </div>
            </section>

            {/* Form */}
            <section className="bg-mamen-black py-8 md:py-12 min-h-[50vh]">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Concert Picker */}
                    <div>
                        <label className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase mb-3 block">
                            Select Concert *
                        </label>
                        <ConcertPicker
                            onSelect={setSelectedConcert}
                            selectedConcert={selectedConcert}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase mb-3 block">
                            Your Status *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {BARENGAN_STATUS_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setStatus(option.value)}
                                    className={`p-3 border-2 text-left transition-all cursor-pointer ${status === option.value
                                        ? "border-mamen-purple bg-mamen-purple/10"
                                        : "border-mamen-gray-700 hover:border-mamen-gray-200"
                                        }`}
                                >
                                    <span className="text-lg block">{option.emoji}</span>
                                    <span className="font-headline text-xs font-bold text-mamen-white block mt-1">
                                        {option.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <label className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase mb-3 block">
                            Message *
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="e.g., Looking for 2 friends to go together! I'm in Tribune section"
                            rows={4}
                            maxLength={500}
                            className="w-full bg-mamen-gray-900 border-2 border-mamen-gray-700 p-3 text-mamen-white text-sm outline-none focus:border-mamen-purple transition-colors resize-none placeholder:text-mamen-gray-700"
                        />
                        <p className="text-xs text-mamen-gray-700 mt-1">{message.length}/500</p>
                    </div>

                    {/* Looking For */}
                    <div>
                        <label className="font-headline text-sm font-bold tracking-widest text-mamen-lime uppercase mb-3 block">
                            Looking for how many people?
                        </label>
                        <div className="flex items-center gap-3">
                            {[1, 2, 3, 5, 10].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setLookingFor(n)}
                                    className={`w-10 h-10 border-2 font-headline font-bold text-sm transition-all cursor-pointer ${lookingFor === n
                                        ? "border-mamen-purple bg-mamen-purple text-mamen-white"
                                        : "border-mamen-gray-700 text-mamen-gray-200 hover:border-mamen-purple"
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="pt-4">
                        <Button
                            variant="lime"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? "Posting..." : "Post Barengan 🎪"}
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
