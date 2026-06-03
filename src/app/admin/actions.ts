"use server";

import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase";
import { Article, ArticleProduct, Concert } from "@/lib/types";

type AdminRole = "admin" | "contributor";

async function getAdminContext() {
    const userSupabase = await createServerSupabase();
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();

    if (userError || !user) {
        throw new Error("You must be logged in to access admin operations");
    }

    const { data: profile, error: profileError } = await userSupabase
        .from("profiles")
        .select("id, name, role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile || !["admin", "contributor"].includes(profile.role)) {
        throw new Error("You do not have permission to access admin operations");
    }

    return {
        supabase: createServiceRoleClient(),
        user,
        profile: profile as { id: string; name: string | null; role: AdminRole },
    };
}

async function assertCanWriteArticle(articleId: string, role: AdminRole, userId: string) {
    if (role === "admin") return;

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
        .from("articles")
        .select("author_id")
        .eq("id", articleId)
        .single();

    if (error || data?.author_id !== userId) {
        throw new Error("Contributors can only edit their own articles");
    }
}

export async function getAdminArticleData() {
    const { supabase, user, profile } = await getAdminContext();

    let articlesQuery = supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

    if (profile.role === "contributor") {
        articlesQuery = articlesQuery.eq("author_id", user.id);
    }

    const [{ data: articles, error: articlesError }, { data: concerts, error: concertsError }, { data: authors, error: authorsError }] = await Promise.all([
        articlesQuery,
        supabase.from("concerts").select("*").order("start_datetime", { ascending: true }),
        supabase.from("profiles").select("id, name, role").in("role", ["admin", "contributor"]).order("name"),
    ]);

    if (articlesError) throw new Error(`Failed to load articles: ${articlesError.message}`);
    if (concertsError) throw new Error(`Failed to load concerts: ${concertsError.message}`);
    if (authorsError) throw new Error(`Failed to load authors: ${authorsError.message}`);

    const articleIds = (articles || []).map((article) => article.id);
    let products: ArticleProduct[] = [];
    if (articleIds.length > 0) {
        const { data: productData, error: productsError } = await supabase
            .from("article_products")
            .select("*")
            .in("article_id", articleIds);

        if (productsError) throw new Error(`Failed to load products: ${productsError.message}`);
        products = (productData || []) as ArticleProduct[];
    }

    return {
        articles: (articles || []) as Article[],
        concerts: (concerts || []) as Concert[],
        products,
        authors: (authors || []) as { id: string; name: string; role: string }[],
    };
}

export async function getAdminDashboardData() {
    const { supabase, user, profile } = await getAdminContext();

    let articlesQuery = supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

    if (profile.role === "contributor") {
        articlesQuery = articlesQuery.eq("author_id", user.id);
    }

    const [{ data: articles, error: articlesError }, { data: concerts, error: concertsError }, { count: productCount, error: productCountError }] = await Promise.all([
        articlesQuery,
        supabase.from("concerts").select("*").order("start_datetime", { ascending: true }),
        supabase.from("article_products").select("*", { count: "exact", head: true }),
    ]);

    if (articlesError) throw new Error(`Failed to load articles: ${articlesError.message}`);
    if (concertsError) throw new Error(`Failed to load concerts: ${concertsError.message}`);
    if (productCountError) throw new Error(`Failed to load products: ${productCountError.message}`);

    return {
        articles: (articles || []) as Article[],
        concerts: (concerts || []) as Concert[],
        productCount: productCount || 0,
    };
}

export async function createArticle(article: Omit<Article, "id" | "created_at" | "updated_at">) {
    const { supabase, user, profile } = await getAdminContext();
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
            author: profile.role === "contributor" ? profile.name || article.author : article.author,
            author_id: profile.role === "contributor" ? user.id : article.author_id,
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
    const { supabase, user, profile } = await getAdminContext();
    await assertCanWriteArticle(id, profile.role, user.id);

    const safeUpdates = { ...updates };
    if (profile.role === "contributor") {
        delete safeUpdates.author_id;
        delete safeUpdates.author;
    }

    const { data, error } = await supabase
        .from("articles")
        .update(safeUpdates)
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
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can delete articles");
    }

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
    const { supabase, user, profile } = await getAdminContext();
    await assertCanWriteArticle(product.article_id, profile.role, user.id);

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
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can delete products");
    }

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
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage concerts");
    }

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
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage concerts");
    }

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
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage concerts");
    }

    const { error } = await supabase
        .from("concerts")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting concert:", error);
        throw new Error("Failed to delete concert");
    }
}
