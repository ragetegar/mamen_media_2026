import { NextRequest, NextResponse } from "next/server";
import { getProductById } from "@/lib/data";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Log affiliate click
    // TODO: When connected to Supabase, insert into affiliate_clicks table:
    // await supabase.from('affiliate_clicks').insert({
    //   article_id: product.article_id,
    //   article_product_id: product.id,
    //   merchant: product.merchant,
    //   referrer: request.headers.get('referer'),
    //   user_agent: request.headers.get('user-agent'),
    // });

    console.log(`[Affiliate Click] Product: ${product.title} | Merchant: ${product.merchant} | ID: ${product.id}`);

    // Redirect to affiliate URL
    return NextResponse.redirect(product.affiliate_url);
}
