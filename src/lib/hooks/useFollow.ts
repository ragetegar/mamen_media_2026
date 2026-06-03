"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth-context";
import { getBrowserSupabase } from "../supabase";

export function useFollow(targetUserId: string) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [isMutualFollow, setIsMutualFollow] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !targetUserId || user.id === targetUserId) {
            setLoading(false);
            return;
        }

        let mounted = true;
        const supabase = getBrowserSupabase();

        const checkFollowStatus = async () => {
            try {
                const [followResult, reverseResult] = await Promise.all([
                    supabase
                        .from("follows")
                        .select("id")
                        .eq("follower_id", user.id)
                        .eq("following_id", targetUserId)
                        .maybeSingle(),
                    supabase
                        .from("follows")
                        .select("id")
                        .eq("follower_id", targetUserId)
                        .eq("following_id", user.id)
                        .maybeSingle(),
                ]);

                if (mounted) {
                    const following = !!followResult.data;
                    const followsBack = !!reverseResult.data;
                    setIsFollowing(following);
                    setIsMutualFollow(following && followsBack);
                }
            } catch {
                // Silently handle errors
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkFollowStatus();

        return () => {
            mounted = false;
        };
    }, [user, targetUserId]);

    const toggle = useCallback(async () => {
        if (!user || !targetUserId || user.id === targetUserId) return;

        const supabase = getBrowserSupabase();
        setLoading(true);

        try {
            if (isFollowing) {
                const { error } = await supabase
                    .from("follows")
                    .delete()
                    .eq("follower_id", user.id)
                    .eq("following_id", targetUserId);

                if (!error) {
                    setIsFollowing(false);
                    setIsMutualFollow(false);
                }
            } else {
                const { error } = await supabase
                    .from("follows")
                    .insert({ follower_id: user.id, following_id: targetUserId });

                if (!error) {
                    setIsFollowing(true);
                    // Check if the target also follows us (mutual)
                    const { data } = await supabase
                        .from("follows")
                        .select("id")
                        .eq("follower_id", targetUserId)
                        .eq("following_id", user.id)
                        .maybeSingle();
                    setIsMutualFollow(!!data);
                }
            }
        } catch {
            // Silently handle errors
        } finally {
            setLoading(false);
        }
    }, [user, targetUserId, isFollowing]);

    return { isFollowing, isMutualFollow, toggle, loading };
}
