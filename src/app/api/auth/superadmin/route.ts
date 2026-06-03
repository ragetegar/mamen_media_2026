import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // The requested shared password for all admins
        if (password !== "P@ssw0rd") {
            return NextResponse.json({ error: "Invalid master password" }, { status: 401 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id, role")
            .eq("email", email)
            .single();

        if (!profile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (profile.role !== "admin") {
            return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 });
        }

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
        });

        if (linkError) {
            return NextResponse.json({ error: "Failed to generate session link" }, { status: 500 });
        }

        return NextResponse.json({ url: linkData.properties.action_link });
    } catch (err) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
