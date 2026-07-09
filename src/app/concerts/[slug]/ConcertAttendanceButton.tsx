"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Users, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getBrowserSupabase } from "@/lib/supabase";
import LoginModal from "@/components/LoginModal";

export default function ConcertAttendanceButton({ concertId }: { concertId: string }) {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [isAttending, setIsAttending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [proofOpen, setProofOpen] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        const supabase = getBrowserSupabase();

        async function loadAttendance() {
            setLoading(true);
            setError("");

            const { count } = await supabase
                .from("concert_attendees")
                .select("*", { count: "exact", head: true })
                .eq("concert_id", concertId);

            if (mounted) setAttendeeCount(count || 0);

            if (!user) {
                if (mounted) {
                    setIsAttending(false);
                    setLoading(false);
                }
                return;
            }

            const { data } = await supabase
                .from("concert_attendees")
                .select("id")
                .eq("user_id", user.id)
                .eq("concert_id", concertId)
                .maybeSingle();

            if (mounted) {
                setIsAttending(Boolean(data));
                setLoading(false);
            }
        }

        void loadAttendance();
        return () => { mounted = false; };
    }, [concertId, user]);

    const handleClick = () => {
        setError("");

        if (!user) {
            setLoginOpen(true);
            return;
        }

        if (isAttending || saving) return;
        setProofOpen(true);
    };

    const handleProofSelected = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setProofFile(file);
        setError("");
    };

    const closeProofModal = () => {
        if (saving) return;
        setProofOpen(false);
        setProofFile(null);
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleConfirmProof = async () => {
        if (!user) return;
        if (!proofFile) {
            setError("Please upload at least one image from the show.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const { error: insertError } = await getBrowserSupabase()
                .from("concert_attendees")
                .insert({
                    user_id: user.id,
                    concert_id: concertId,
                    source: "proof_gimmick",
                });

            if (insertError) {
                if (insertError.code === "23505") {
                    setIsAttending(true);
                    setProofOpen(false);
                    setProofFile(null);
                    return;
                }
                throw insertError;
            }

            setIsAttending(true);
            setAttendeeCount((current) => current + 1);
            setProofOpen(false);
            setProofFile(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to mark attendance");
        } finally {
            setSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={handleClick}
                disabled={loading || saving}
                className={`inline-flex items-center justify-center gap-2 border-[3px] border-mamen-black px-6 py-4 font-headline text-base font-bold uppercase tracking-wider shadow-hard transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                    isAttending
                        ? "bg-mamen-purple text-white"
                        : "bg-mamen-black text-mamen-white hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#000000]"
                }`}
            >
                {isAttending ? <Check size={18} /> : <ImagePlus size={18} />}
                {isAttending ? "Attended" : "Prove Attendance"}
                <span className="inline-flex items-center gap-1 text-mamen-lime">
                    <Users size={16} />
                    {attendeeCount}
                </span>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProofSelected}
            />
            {error && <p className="text-xs text-red-300">{error}</p>}
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />

            {proofOpen && (
                <div
                    className="fixed inset-0 z-[190] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) closeProofModal();
                    }}
                >
                    <div className="w-full max-w-md border-4 border-mamen-purple bg-mamen-gray-900 shadow-hard-purple">
                        <div className="flex items-start justify-between gap-4 border-b border-mamen-gray-800 px-6 py-5">
                            <div>
                                <h2 className="font-headline text-xl font-black uppercase text-mamen-white">
                                    Prove Attendance
                                </h2>
                                <p className="mt-1 text-xs text-mamen-gray-200">
                                    Are you sure you came? Please upload an image of you at the show to prove it.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeProofModal}
                                className="text-mamen-gray-200 hover:text-white"
                                aria-label="Close proof modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            {error && (
                                <div className="border-2 border-red-500 bg-red-900/30 px-4 py-3 text-sm text-red-300">
                                    {error}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={saving}
                                className="flex w-full items-center justify-center gap-2 border-2 border-mamen-gray-700 bg-mamen-gray-800 px-4 py-5 font-headline text-sm font-bold uppercase tracking-wider text-mamen-white transition-colors hover:border-mamen-purple disabled:opacity-50"
                            >
                                <ImagePlus size={18} />
                                {proofFile ? proofFile.name : "Upload show image"}
                            </button>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeProofModal}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm text-mamen-gray-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmProof}
                                    disabled={saving}
                                    className="border-2 border-mamen-black bg-mamen-lime px-5 py-2 font-headline text-xs font-bold uppercase tracking-wider text-mamen-black shadow-hard-sm disabled:opacity-50"
                                >
                                    {saving ? "Checking..." : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
