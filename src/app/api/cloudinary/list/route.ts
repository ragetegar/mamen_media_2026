import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiKey || !apiSecret || !cloudName) {
        return NextResponse.json({ error: "Cloudinary not configured" }, { status: 500 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=mamen&resource_type=image&timestamp=${timestamp}`;
    const signature = crypto
        .createHash("sha256")
        .update(paramsToSign + apiSecret)
        .digest("hex");

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
