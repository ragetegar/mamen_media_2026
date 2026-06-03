"use server";

import { createServerSupabase } from "@/lib/supabase";
import { Article, ArticleProduct, Concert } from "@/lib/types";

export async function createArticle(article: Omit<Article, "id" | "created_at" | "updated_at">) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from("articles")
        .insert({
            title: article.title,
            slug: article.slug,
            category: article.category,
            subcategory: article.subcategory,
            cover_image: article.cover_image,
            excerpt: article.excerpt,
            body_html: article.body_html,
            author: article.author,
            author_id: article.author_id,
            seo_title: article.seo_title,
            seo_description: article.seo_description,
            tags: article.tags,
            status: article.status,
            linked_concert_ids: article.linked_concert_ids || [],
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating article:", error);
        throw new Error("Failed to create article");
    }
    return data as Article;
}

export async function updateArticle(id: string, updates: Partial<Article>) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from("articles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating article:", error);
        throw new Error("Failed to update article");
    }
    return data as Article;
}

export async function deleteArticle(id: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting article:", error);
        throw new Error("Failed to delete article");
    }
}

export async function createArticleProduct(product: Omit<ArticleProduct, "id">) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from("article_products")
        .insert({
            article_id: product.article_id,
            merchant: product.merchant,
            title: product.title,
            image: product.image,
            price_display: product.price_display,
            affiliate_url: product.affiliate_url,
            sort_order: product.sort_order,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product");
    }
    return data as ArticleProduct;
}

export async function deleteArticleProduct(id: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from("article_products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting product:", error);
        throw new Error("Failed to delete product");
    }
}

export async function createConcert(concert: Omit<Concert, "id">) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from("concerts")
        .insert({
            title: concert.title,
            slug: concert.slug,
            description: concert.description,
            poster_image: concert.poster_image,
            start_datetime: concert.start_datetime,
            end_datetime: concert.end_datetime,
            venue: concert.venue,
            city: concert.city,
            concert_type: concert.concert_type,
            genre_tags: concert.genre_tags,
            ticket_url: concert.ticket_url,
            interested_count: concert.interested_count,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating concert:", error);
        throw new Error("Failed to create concert");
    }
    return data as Concert;
}

export async function updateConcert(id: string, updates: Partial<Concert>) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from("concerts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error("Error updating concert:", error);
        throw new Error("Failed to update concert");
    }
    return data as Concert;
}

export async function deleteConcert(id: string) {
    const supabase = await createServerSupabase();
    const { error } = await supabase
        .from("concerts")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting concert:", error);
        throw new Error("Failed to delete concert");
    }
}
