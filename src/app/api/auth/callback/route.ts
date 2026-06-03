import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
        return NextResponse.redirect(`${origin}/auth/callback?error=auth_callback_error`);
    }

    // Build the response first so cookies set by Supabase are attached to it.
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.headers
                    .get("cookie")
                    ?.split(";")
                    .map((c) => {
                        const [name, ...rest] = c.trim().split("=");
                        return { name, value: rest.join("=") };
                    }) ?? [];
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        return NextResponse.redirect(`${origin}/auth/callback?error=auth_callback_error`);
    }

    // Check if user has a handle; if not, route to setup-profile.
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("handle")
            .eq("id", user.id)
            .single();

        if (!profile?.handle) {
            const setupResponse = NextResponse.redirect(`${origin}/setup-profile`);
            // Carry forward the auth cookies we just set.
            response.cookies.getAll().forEach((c) => {
                setupResponse.cookies.set(c);
            });
            return setupResponse;
        }
    }

    return response;
}
