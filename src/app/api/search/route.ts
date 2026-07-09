import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
        return NextResponse.json({ articles: [], concerts: [] });
    }

    const term = `%${query.replace(/[%_]/g, "\\$&")}%`;
    const supabase = await createServerSupabase();

    const [articlesResult, concertsResult] = await Promise.all([
        supabase
            .from("articles")
            .select("id, slug, title, category, subcategory, cover_image, excerpt, author, tags, published_at")
            .eq("status", "published")
            .or(`title.ilike.${term},excerpt.ilike.${term},author.ilike.${term}`)
            .order("published_at", { ascending: false })
            .limit(6),
        supabase
            .from("concerts")
            .select("id, slug, title, poster_image, venue, city, start_datetime")
            .or(`title.ilike.${term},venue.ilike.${term},city.ilike.${term}`)
            .order("start_datetime", { ascending: true })
            .limit(4),
    ]);

    if (articlesResult.error || concertsResult.error) {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    return NextResponse.json({
        articles: articlesResult.data || [],
        concerts: concertsResult.data || [],
    });
}
