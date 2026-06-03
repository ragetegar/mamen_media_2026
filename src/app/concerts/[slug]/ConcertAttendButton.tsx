"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { loadUserConcertIds, saveUserConcert, removeUserConcert } from "@/app/profile/[handle]/ProfileConcerts";
import Button from "@/components/ui/Button";
import { Users, Check } from "lucide-react";
import LoginModal from "@/components/LoginModal";

export default function ConcertAttendButton({ concertId }: { concertId: string }) {
    const { user } = useAuth();
    const [isAttending, setIsAttending] = useState(false);
    const [loginOpen, setLoginOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadUserConcertIds(user.id).then((ids) => {
                setIsAttending(ids.includes(concertId));
            });
        } else {
            setIsAttending(false);
        }
    }, [user, concertId]);

    const handleToggle = async () => {
        if (!user) {
            setLoginOpen(true);
            return;
        }

        setLoading(true);
        try {
            if (isAttending) {
                await removeUserConcert(user.id, concertId);
                setIsAttending(false);
            } else {
                await saveUserConcert(user.id, concertId);
                setIsAttending(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                variant={isAttending ? "lime" : "secondary"}
                size="lg"
                onClick={handleToggle}
                disabled={loading}
            >
                {isAttending ? (
                    <>
                        <Check size={18} className="mr-2" />
                        I&apos;m Attending
                    </>
                ) : (
                    <>
                        <Users size={18} className="mr-2" />
                        I&apos;m Interested
                    </>
                )}
            </Button>

            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
