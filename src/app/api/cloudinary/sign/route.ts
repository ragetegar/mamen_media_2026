import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { requireAdminRole } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
    try {
        await requireAdminRole(["admin", "contributor"]);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unauthorized";
        return NextResponse.json({ error: message }, { status: message.includes("logged in") ? 401 : 403 });
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
        return NextResponse.json(
            { error: "Cloudinary credentials not configured" },
            { status: 500 }
        );
    }

    const body = await request.json();
    const folder = body.folder ?? "mamen";

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;

    const signature = crypto
        .createHash("sha256")
        .update(paramsToSign + apiSecret)
        .digest("hex");

    return NextResponse.json({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
    });
}
