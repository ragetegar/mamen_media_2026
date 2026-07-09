import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/data";
import { createServiceRoleClient } from "@/lib/supabase";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    const { error } = await createServiceRoleClient()
        .from("affiliate_clicks")
        .insert({
            article_id: product.article_id,
            article_product_id: product.id,
            merchant: product.merchant,
            referrer: request.headers.get("referer"),
            user_agent: request.headers.get("user-agent"),
        });

    if (error) {
        console.error("Failed to log affiliate click:", error.message);
    }

    // Redirect to affiliate URL
    return NextResponse.redirect(product.affiliate_url);
}
