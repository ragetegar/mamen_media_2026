import { NextResponse } from "next/server";
import { createDailyPublicVoiceArticle } from "@/lib/public-voice-daily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
    const secret = process.env.CRON_SECRET || process.env.PUBLIC_VOICE_CRON_SECRET;
    if (!secret) return process.env.NODE_ENV !== "production";
    return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await createDailyPublicVoiceArticle();
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create Public Voice article";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
