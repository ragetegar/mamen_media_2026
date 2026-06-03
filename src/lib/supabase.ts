import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// ── Browser client (for "use client" components) ──
// Uses cookies for session storage — persists across page refreshes
export function createBrowserSupabase() {
    return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Singleton browser client for use in client components
let browserClient: ReturnType<typeof createBrowserSupabase> | null = null;
export function getBrowserSupabase() {
    if (!browserClient) {
        browserClient = createBrowserSupabase();
    }
    return browserClient;
}

// ── Server client (for server components, route handlers) ──
// Reads/writes cookies via next/headers
export async function createServerSupabase() {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();

    return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // setAll is called from Server Components where cookies can't be set.
                    // This can be ignored if middleware refreshes sessions.
                }
            },
        },
    });
}

// ── Service role client (for admin operations) ──
export function createServiceRoleClient() {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
    return createClient(supabaseUrl, serviceRoleKey);
}

// ── Backward-compatible export ──
// Used by data.ts and other files that import `supabase` directly.
// In client components, this uses the cookie-backed browser client.
// In server contexts (data fetching in server components), use createServerSupabase() instead.
export const supabase = typeof window !== "undefined"
    ? getBrowserSupabase()
    : createClient(supabaseUrl, supabaseAnonKey);
