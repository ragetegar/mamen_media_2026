"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CalendarPlus, TicketCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getBrowserSupabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import LoginModal from "@/components/LoginModal";

type ConcertIntent = "interested" | "coming";

export default function ConcertInterestButton({ concertId }: { concertId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [intent, setIntent] = useState<ConcertIntent | null>(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadInterest() {
            if (!user) {
                setIntent(null);
                return;
            }

            const { data } = await getBrowserSupabase()
                .from("concert_interests")
                .select("id, intent")
                .eq("user_id", user.id)
                .eq("concert_id", concertId)
                .maybeSingle();

            const savedIntent = data?.intent === "coming" ? "coming" : data ? "interested" : null;
            if (mounted) setIntent(savedIntent);
        }

        void loadInterest();
        return () => { mounted = false; };
    }, [concertId, user]);

    const handleIntent = async (nextIntent: ConcertIntent) => {
        if (!user) {
            setLoginOpen(true);
            return;
        }

        setLoading(true);
        const supabase = getBrowserSupabase();

        try {
            if (intent === nextIntent) {
                const { error } = await supabase
                    .from("concert_interests")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("concert_id", concertId);

                if (error) throw error;
                setIntent(null);
            } else if (intent) {
                const { error } = await supabase
                    .from("concert_interests")
                    .update({ intent: nextIntent })
                    .eq("user_id", user.id)
                    .eq("concert_id", concertId);

                if (error) throw error;
                setIntent(nextIntent);
            } else {
                const { error } = await supabase
                    .from("concert_interests")
                    .insert({ user_id: user.id, concert_id: concertId, intent: nextIntent });

                if (error) throw error;
                setIntent(nextIntent);
            }

            router.refresh();
        } catch (error) {
            console.error("Error toggling concert interest:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-3">
                <Button
                    variant={intent === "interested" ? "magenta" : "secondary"}
                    size="lg"
                    onClick={() => handleIntent("interested")}
                    disabled={loading}
                >
                    {intent === "interested" ? (
                        <>
                            <Check size={18} className="mr-2" />
                            Interested
                        </>
                    ) : (
                        <>
                            <CalendarPlus size={18} className="mr-2" />
                            I&apos;m Interested
                        </>
                    )}
                </Button>

                <Button
                    variant={intent === "coming" ? "lime" : "primary"}
                    size="lg"
                    onClick={() => handleIntent("coming")}
                    disabled={loading}
                >
                    {intent === "coming" ? (
                        <>
                            <Check size={18} className="mr-2" />
                            Coming
                        </>
                    ) : (
                        <>
                            <TicketCheck size={18} className="mr-2" />
                            I&apos;m Coming
                        </>
                    )}
                </Button>
            </div>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
