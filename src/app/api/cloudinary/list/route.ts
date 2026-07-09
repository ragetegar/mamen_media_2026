import { NextResponse } from "next/server";
import { requireAdminRole } from "@/lib/admin-auth";

export async function GET() {
    try {
        await requireAdminRole(["admin", "contributor"]);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unauthorized";
        return NextResponse.json({ error: message }, { status: message.includes("logged in") ? 401 : 403 });
    }

    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
        return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?type=upload&prefix=mamen&max_results=500`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ images: data.resources ?? [] });
}
