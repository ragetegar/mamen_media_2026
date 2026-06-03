"use client";

import { useEffect, useState, useRef } from "react";
import { getBrowserSupabase } from "@/lib/supabase";

/**
 * Hook that subscribes to Supabase Realtime postgres_changes for new inserts.
 * Parent merges newMessages with initial data.
 */
export function useRealtimeMessages(
    table: string,
    filterColumn: string,
    filterValue: string
) {
    const [newMessages, setNewMessages] = useState<any[]>([]);
    const supabase = getBrowserSupabase();
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        if (!filterValue) return;

        const channel = supabase
            .channel(`${table}:${filterColumn}:${filterValue}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table,
                    filter: `${filterColumn}=eq.${filterValue}`,
                },
                (payload) => {
                    setNewMessages((prev) => [...prev, payload.new]);
                }
            )
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [table, filterColumn, filterValue, supabase]);

    const clearNewMessages = () => setNewMessages([]);

    return { newMessages, clearNewMessages };
}
