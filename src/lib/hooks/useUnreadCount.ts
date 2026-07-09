"use client";

import { useState, useEffect, useCallback } from "react";
import { getBrowserSupabase } from "@/lib/supabase";
import { getUnreadMessageCount } from "@/lib/data";
import { useAuth } from "@/lib/auth-context";

export function useUnreadCount() {
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const supabase = getBrowserSupabase();

    const refresh = useCallback(async () => {
        if (!user) {
            setUnreadCount(0);
            return;
        }
        const count = await getUnreadMessageCount(user.id);
        setUnreadCount(count);
    }, [user]);

    useEffect(() => {
        if (!user) {
            Promise.resolve().then(() => setUnreadCount(0));
            return;
        }

        Promise.resolve().then(refresh);

        window.addEventListener("mamen:unread-refresh", refresh);

        // Subscribe to new direct messages
        const channel = supabase
            .channel("dm-unread-count")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "direct_messages",
                },
                (payload) => {
                    // Only increment if the message is from someone else
                    if (payload.new && payload.new.sender_id !== user.id) {
                        setUnreadCount((prev) => prev + 1);
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    setUnreadCount((prev) => prev + 1);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${user.id}`,
                },
                () => {
                    refresh();
                }
            )
            .subscribe();

        return () => {
            window.removeEventListener("mamen:unread-refresh", refresh);
            supabase.removeChannel(channel);
        };
    }, [user, supabase, refresh]);

    return { unreadCount, refresh };
}
