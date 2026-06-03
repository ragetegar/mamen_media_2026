import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { mockArticles, mockConcerts, mockProducts } from "../src/lib/data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Key in environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Starting Supabase Seed...");

    // 1. Clear existing data
    await supabase.from("article_products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("articles").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("concerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("Cleared existing data.");

    // 2. Insert Concerts
    const concertIdMap: Record<string, string> = {}; // Map local string IDs to Supabase UUIDs

    for (const concert of mockConcerts) {
        const { id, interested_count, ...rest } = concert;
        const { data, error } = await supabase
            .from("concerts")
            .insert({ ...rest, interested_count: interested_count || 0 })
            .select("id")
            .single();

        if (error) {
            console.error(`Error inserting concert ${rest.slug}:`, error.message);
            continue;
        }
        concertIdMap[id] = data.id;
    }
    console.log(`Successfully inserted ${Object.keys(concertIdMap).length} concerts.`);

    // 3. Insert Articles
    const articleIdMap: Record<string, string> = {};

    for (const article of mockArticles) {
        const { id, linked_concert_ids, ...rest } = article;

        // Map local concert IDs to Supabase UUIDs
        const newLinkedConcertIds = (linked_concert_ids || [])
            .map(cid => concertIdMap[cid])
            .filter(Boolean);

        const { data, error } = await supabase
            .from("articles")
            .insert({ ...rest, linked_concert_ids: newLinkedConcertIds })
            .select("id")
            .single();

        if (error) {
            console.error(`Error inserting article ${rest.slug}:`, error.message);
            continue;
        }
        articleIdMap[id] = data.id;
    }
    console.log(`Successfully inserted ${Object.keys(articleIdMap).length} articles.`);

    // 4. Insert Products
    let productCount = 0;
    for (const product of mockProducts) {
        const { id, article_id, ...rest } = product;
        const newArticleId = articleIdMap[article_id];

        if (!newArticleId) {
            console.warn(`Skipping product ${rest.title} because parent article not found.`);
            continue;
        }

        const { error } = await supabase
            .from("article_products")
            .insert({ ...rest, article_id: newArticleId });

        if (error) {
            console.error(`Error inserting product ${rest.title}:`, error.message);
            continue;
        }
        productCount++;
    }
    console.log(`Successfully inserted ${productCount} article products.`);

    console.log("Seeding complete!");
}

seed().catch(console.error);
