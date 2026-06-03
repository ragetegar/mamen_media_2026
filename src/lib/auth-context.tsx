"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getBrowserSupabase } from "./supabase";

export interface AuthUser {
    id: string;
    name: string;
    handle: string;
    email: string;
    role: "admin" | "contributor" | "user";
    avatar?: string;
    banner_image?: string;
    social_instagram?: string;
    social_tiktok?: string;
    social_x?: string;
    favorite_concert_ids?: string[];
}

interface AuthContextType {
    user: AuthUser | null;
    loginWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (fields: Partial<Omit<AuthUser, "id" | "email" | "role">>) => Promise<{ success: boolean; error?: string }>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = getBrowserSupabase();

    useEffect(() => {
        let mounted = true;

        const buildUser = (data: any, email: string): AuthUser => ({
            id: data.id,
            email: data.email || email,
            name: data.name || "",
            handle: data.handle || "",
            role: data.role || "user",
            avatar: data.avatar || "",
            banner_image: data.banner_image || "",
            social_instagram: data.social_instagram || "",
            social_tiktok: data.social_tiktok || "",
            social_x: data.social_x || "",
            favorite_concert_ids: data.favorite_concert_ids || [],
        });

        const fetchProfile = async (authUserId: string, email: string) => {
            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", authUserId)
                    .single();

                if (error) {
                    console.error("Error fetching profile:", error);
                    if (mounted) setIsLoading(false);
                    return;
                }

                if (mounted && data) {
                    setUser(buildUser(data, email));
                }
            } catch (err) {
                console.error("Unexpected error fetching profile:", err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        // Use onAuthStateChange as the single source of truth for auth state.
        // INITIAL_SESSION fires after the client reads cookies and restores the session.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (session?.user) {
                    await fetchProfile(session.user.id, session.user.email || "");
                } else {
                    if (mounted) {
                        setUser(null);
                        setIsLoading(false);
                    }
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const loginWithMagicLink = async (email: string) => {
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/api/auth/callback`,
                },
            });
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/api/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                },
            });
            if (error) throw error;
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const updateProfile = async (fields: Partial<Omit<AuthUser, "id" | "email" | "role">>) => {
        if (!user) return { success: false, error: "Not logged in" };

        if (fields.handle && !fields.handle.match(/^[a-zA-Z0-9_]+$/)) {
            return { success: false, error: "Handle can only contain letters, numbers, and underscores" };
        }

        try {
            const updates: Record<string, any> = {};
            for (const [key, value] of Object.entries(fields)) {
                if (value !== undefined) {
                    updates[key] = value;
                }
            }

            const { error } = await supabase
                .from("profiles")
                .update(updates)
                .eq("id", user.id);

            if (error) {
                if (error.code === "23505") {
                    return { success: false, error: "Handle is already taken" };
                }
                throw error;
            }

            setUser({ ...user, ...updates });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loginWithMagicLink, loginWithGoogle, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
