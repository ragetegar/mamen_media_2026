import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase";

export type AdminRole = "admin" | "contributor";

export async function getAdminContext() {
    const userSupabase = await createServerSupabase();
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();

    if (userError || !user) {
        throw new Error("You must be logged in to access admin operations");
    }

    const { data: profile, error: profileError } = await userSupabase
        .from("profiles")
        .select("id, name, role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile || !["admin", "contributor"].includes(profile.role)) {
        throw new Error("You do not have permission to access admin operations");
    }

    return {
        supabase: createServiceRoleClient(),
        user,
        profile: profile as { id: string; name: string | null; role: AdminRole },
    };
}

export async function requireAdminRole(allowedRoles: AdminRole[] = ["admin", "contributor"]) {
    const context = await getAdminContext();

    if (!allowedRoles.includes(context.profile.role)) {
        throw new Error("You do not have permission to access this resource");
    }

    return context;
}
