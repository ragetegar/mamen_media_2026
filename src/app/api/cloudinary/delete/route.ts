import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
        return NextResponse.json(
            { error: "Cloudinary credentials not configured" },
            { status: 500 }
        );
    }

    const { public_id } = await request.json();

    if (!public_id) {
        return NextResponse.json({ error: "public_id is required" }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `public_id=${public_id}&timestamp=${timestamp}`;
    const signature = crypto
        .createHash("sha256")
        .update(paramsToSign + apiSecret)
        .digest("hex");

    const formData = new URLSearchParams();
    formData.append("public_id", public_id);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    if (data.result === "ok") {
        return NextResponse.json({ success: true });
    } else {
        return NextResponse.json(
            { error: "Failed to delete image", detail: data },
            { status: 500 }
        );
    }
}
