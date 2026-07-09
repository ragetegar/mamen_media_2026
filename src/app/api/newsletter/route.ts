import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

function normalizeEmail(email: unknown) {
    if (typeof email !== "string") return "";
    return email.trim().toLowerCase();
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        const normalizedEmail = normalizeEmail(email);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
        }

        const { error } = await createServiceRoleClient()
            .from("newsletter_subscribers")
            .upsert(
                { email: normalizedEmail },
                { onConflict: "email", ignoreDuplicates: true },
            );

        if (error) {
            return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
