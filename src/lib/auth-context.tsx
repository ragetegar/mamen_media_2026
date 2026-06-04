"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
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

type ProfileRow = {
    id: string;
    email?: string | null;
    name?: string | null;
    handle?: string | null;
    role?: "admin" | "contributor" | "user" | null;
    avatar?: string | null;
    banner_image?: string | null;
    social_instagram?: string | null;
    social_tiktok?: string | null;
    social_x?: string | null;
    favorite_concert_ids?: string[] | null;
};

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Something went wrong";
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = getBrowserSupabase();

    useEffect(() => {
        let mounted = true;

        const buildUser = (data: ProfileRow, email: string): AuthUser => ({
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

        const fetchProfile = async (authUser: User) => {
            try {
                const email = authUser.email || "";
                const metadata = authUser.user_metadata || {};
                const { data, error } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", authUser.id)
                    .maybeSingle();

                if (error) {
                    console.error("Error fetching profile:", error);
                    if (mounted) {
                        setUser({
                            id: authUser.id,
                            email,
                            name: metadata.full_name || metadata.name || email.split("@")[0] || "",
                            handle: "",
                            role: "user",
                            avatar: metadata.avatar_url || metadata.picture || "",
                        });
                    }
                    if (mounted) setIsLoading(false);
                    return;
                }

                let profile = data;
                if (!profile) {
                    const fallbackName =
                        metadata.full_name ||
                        metadata.name ||
                        email.split("@")[0] ||
                        "Mamen User";

                    const { data: insertedProfile, error: insertError } = await supabase
                        .from("profiles")
                        .insert({
                            id: authUser.id,
                            email,
                            name: fallbackName,
                            avatar: metadata.avatar_url || metadata.picture || "",
                        })
                        .select("*")
                        .single();

                    if (insertError) {
                        console.error("Error creating profile:", insertError);
                    } else {
                        profile = insertedProfile;
                    }
                }

                if (mounted) {
                    setUser(
                        profile
                            ? buildUser(profile, email)
                            : {
                                id: authUser.id,
                                email,
                                name: metadata.full_name || metadata.name || email.split("@")[0] || "",
                                handle: "",
                                role: "user",
                                avatar: metadata.avatar_url || metadata.picture || "",
                            }
                    );
                }
            } catch (err) {
                console.error("Unexpected error fetching profile:", err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        // Validate the cookie-backed session on first load so hard refreshes restore auth.
        supabase.auth.getUser().then(({ data: { user: authUser } }) => {
            if (authUser) {
                fetchProfile(authUser);
            } else if (mounted) {
                setUser(null);
                setIsLoading(false);
            }
        }).catch((error) => {
            console.error("Error restoring auth session:", error);
            if (mounted) {
                setUser(null);
                setIsLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "INITIAL_SESSION") return;

                if (session?.user) {
                    void fetchProfile(session.user);
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
    }, [supabase]);

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
        } catch (error: unknown) {
            return { success: false, error: getErrorMessage(error) };
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
        } catch (error: unknown) {
            return { success: false, error: getErrorMessage(error) };
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
            const updates: Partial<Omit<AuthUser, "id" | "email" | "role">> = {};
            if (fields.name !== undefined) updates.name = fields.name;
            if (fields.handle !== undefined) updates.handle = fields.handle;
            if (fields.avatar !== undefined) updates.avatar = fields.avatar;
            if (fields.banner_image !== undefined) updates.banner_image = fields.banner_image;
            if (fields.social_instagram !== undefined) updates.social_instagram = fields.social_instagram;
            if (fields.social_tiktok !== undefined) updates.social_tiktok = fields.social_tiktok;
            if (fields.social_x !== undefined) updates.social_x = fields.social_x;
            if (fields.favorite_concert_ids !== undefined) updates.favorite_concert_ids = fields.favorite_concert_ids;

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
        } catch (error: unknown) {
            return { success: false, error: getErrorMessage(error) };
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
