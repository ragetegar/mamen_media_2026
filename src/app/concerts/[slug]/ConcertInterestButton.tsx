"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getBrowserSupabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import LoginModal from "@/components/LoginModal";

export default function ConcertInterestButton({ concertId }: { concertId: string }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isInterested, setIsInterested] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadInterest() {
            if (!user) {
                setIsInterested(false);
                return;
            }

            const { data } = await getBrowserSupabase()
                .from("concert_interests")
                .select("id")
                .eq("user_id", user.id)
                .eq("concert_id", concertId)
                .maybeSingle();

            if (mounted) setIsInterested(Boolean(data));
        }

        loadInterest();
        return () => { mounted = false; };
    }, [concertId, user]);

    const handleToggle = async () => {
        if (!user) {
            setLoginOpen(true);
            return;
        }

        setLoading(true);
        const supabase = getBrowserSupabase();

        try {
            if (isInterested) {
                const { error } = await supabase
                    .from("concert_interests")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("concert_id", concertId);

                if (error) throw error;
                setIsInterested(false);
            } else {
                const { error } = await supabase
                    .from("concert_interests")
                    .insert({ user_id: user.id, concert_id: concertId });

                if (error) throw error;
                setIsInterested(true);
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
            <Button
                variant={isInterested ? "magenta" : "secondary"}
                size="lg"
                onClick={handleToggle}
                disabled={loading}
            >
                {isInterested ? (
                    <>
                        <Check size={18} className="mr-2" />
                        Interested
                    </>
                ) : (
                    <>
                        <Heart size={18} className="mr-2" />
                        I&apos;m Interested
                    </>
                )}
            </Button>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
