"use server";

import { createServerSupabase, createServiceRoleClient } from "@/lib/supabase";
import { Article, ArticleProduct, BarenganPost, Concert, FeaturedBrand, Merchant, ProfileSnippet } from "@/lib/types";
import { isValidArticleTaxonomy } from "@/lib/article-taxonomy";

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

function normalizeBrandName(name: string) {
    return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("en-US");
}

function assertValidArticleTaxonomy(category: string, subcategory: string) {
    if (!isValidArticleTaxonomy(category, subcategory)) {
        throw new Error("Article category and subcategory do not match the editorial taxonomy");
    }
}

const PROFILE_SNIPPET_SELECT = "id, name, handle, avatar, role, is_verified, official_partner_name, official_partner_logo, official_partner_url, barengan_custom_tag, barengan_trust_score";

async function resolveBrandId(
    supabase: ReturnType<typeof createServiceRoleClient>,
    brandName: string,
) {
    const name = brandName.trim().replace(/\s+/g, " ");
    const normalizedName = normalizeBrandName(name);
    if (!normalizedName) throw new Error("Brand is required");

    const { data: existing, error: findError } = await supabase
        .from("featured_brands")
        .select("id")
        .eq("normalized_name", normalizedName)
        .maybeSingle();

    if (findError) throw new Error(`Failed to find brand: ${findError.message}`);
    if (existing) return existing.id as string;

    const { data: created, error: createError } = await supabase
        .from("featured_brands")
        .insert({
            name,
            normalized_name: normalizedName,
            image: "",
            link: "/",
            sort_order: 0,
            is_active: false,
        })
        .select("id")
        .single();

    if (!createError && created) return created.id as string;

    // A concurrent request may have created the same normalized brand.
    const { data: concurrent, error: concurrentError } = await supabase
        .from("featured_brands")
        .select("id")
        .eq("normalized_name", normalizedName)
        .single();

    if (concurrentError || !concurrent) {
        throw new Error(`Failed to create brand: ${createError?.message || concurrentError?.message}`);
    }
    return concurrent.id as string;
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

    const [{ data: articles, error: articlesError }, { data: concerts, error: concertsError }, { data: authors, error: authorsError }, { data: brands, error: brandsError }] = await Promise.all([
        articlesQuery,
        supabase.from("concerts").select("*").order("start_datetime", { ascending: true }),
        supabase.from("profiles").select("id, name, role").in("role", ["admin", "contributor"]).order("name"),
        supabase.from("featured_brands").select("*").order("name"),
    ]);

    if (articlesError) throw new Error(`Failed to load articles: ${articlesError.message}`);
    if (concertsError) throw new Error(`Failed to load concerts: ${concertsError.message}`);
    if (authorsError) throw new Error(`Failed to load authors: ${authorsError.message}`);
    if (brandsError) throw new Error(`Failed to load brands: ${brandsError.message}`);

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
        brands: (brands || []) as FeaturedBrand[],
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

export async function getAdminUsers() {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage users");
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load users: ${error.message}`);
    return data || [];
}

export async function updateAdminUserRole(targetId: string, newRole: "admin" | "contributor" | "user") {
    const { supabase, user, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage users");
    }
    if (targetId === user.id && newRole !== "admin") {
        throw new Error("You cannot demote yourself from admin.");
    }

    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", targetId);

    if (error) throw new Error(`Failed to update role: ${error.message}`);
}

export async function updateAdminUserBadges(
    targetId: string,
    badges: {
        is_verified?: boolean;
        official_partner_name?: string;
        official_partner_logo?: string;
        official_partner_url?: string;
        barengan_custom_tag?: string;
    },
) {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage users");
    }

    const nullIfEmpty = (value?: string) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : null;
    };

    const updates: {
        is_verified?: boolean;
        official_partner_name?: string | null;
        official_partner_logo?: string | null;
        official_partner_url?: string | null;
        barengan_custom_tag?: string | null;
    } = {};

    if (badges.is_verified !== undefined) updates.is_verified = Boolean(badges.is_verified);
    if (badges.official_partner_name !== undefined) updates.official_partner_name = nullIfEmpty(badges.official_partner_name);
    if (badges.official_partner_logo !== undefined) updates.official_partner_logo = nullIfEmpty(badges.official_partner_logo);
    if (badges.official_partner_url !== undefined) updates.official_partner_url = nullIfEmpty(badges.official_partner_url);
    if (badges.barengan_custom_tag !== undefined) {
        const customTag = nullIfEmpty(badges.barengan_custom_tag);
        if (customTag && customTag.length > 24) {
            throw new Error("Custom tag must be 24 characters or fewer");
        }
        updates.barengan_custom_tag = customTag;
    }

    const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", targetId);

    if (error) throw new Error(`Failed to update profile badges: ${error.message}`);
}

export async function createArticle(article: Omit<Article, "id" | "created_at" | "updated_at">) {
    const { supabase, user, profile } = await getAdminContext();
    assertValidArticleTaxonomy(article.category, article.subcategory);
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

    if (safeUpdates.category || safeUpdates.subcategory) {
        const { data: existing, error: existingError } = await supabase
            .from("articles")
            .select("category, subcategory")
            .eq("id", id)
            .single();
        if (existingError || !existing) throw new Error("Failed to validate article taxonomy");
        assertValidArticleTaxonomy(
            safeUpdates.category || existing.category,
            safeUpdates.subcategory || existing.subcategory,
        );
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

export async function getAdminBarenganPosts() {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can manage Barengan posts");
    }

    const { data, error } = await supabase
        .from("barengan_posts")
        .select("*, concert:concerts(*)")
        .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load Barengan posts: ${error.message}`);

    const posts = (data || []) as BarenganPost[];
    if (posts.length === 0) return [];

    const postIds = posts.map((post) => post.id);
    const userIds = [...new Set(posts.map((post) => post.user_id))];

    const [profilesResult, approvedResult, pendingResult] = await Promise.all([
        supabase.from("profiles").select(PROFILE_SNIPPET_SELECT).in("id", userIds),
        supabase.from("barengan_members").select("barengan_post_id").eq("status", "approved").in("barengan_post_id", postIds),
        supabase.from("barengan_members").select("barengan_post_id").eq("status", "pending").in("barengan_post_id", postIds),
    ]);

    if (profilesResult.error) throw new Error(`Failed to load Barengan creators: ${profilesResult.error.message}`);
    if (approvedResult.error) throw new Error(`Failed to load approved Barengan members: ${approvedResult.error.message}`);
    if (pendingResult.error) throw new Error(`Failed to load pending Barengan members: ${pendingResult.error.message}`);

    const profileMap: Record<string, ProfileSnippet> = {};
    profilesResult.data?.forEach((creator) => {
        profileMap[creator.id] = creator as ProfileSnippet;
    });

    const approvedCountMap: Record<string, number> = {};
    approvedResult.data?.forEach((member) => {
        approvedCountMap[member.barengan_post_id] = (approvedCountMap[member.barengan_post_id] || 0) + 1;
    });

    const pendingCountMap: Record<string, number> = {};
    pendingResult.data?.forEach((member) => {
        pendingCountMap[member.barengan_post_id] = (pendingCountMap[member.barengan_post_id] || 0) + 1;
    });

    return posts.map((post) => ({
        ...post,
        profile: profileMap[post.user_id] || undefined,
        approved_count: approvedCountMap[post.id] || 0,
        member_count: (approvedCountMap[post.id] || 0) + (pendingCountMap[post.id] || 0),
        response_count: approvedCountMap[post.id] || 0,
    }));
}

export async function deleteBarenganPost(id: string) {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") {
        throw new Error("Only admins can delete Barengan posts");
    }

    const { error } = await supabase
        .from("barengan_posts")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting Barengan post:", error);
        throw new Error("Failed to delete Barengan post");
    }
}

export async function createArticleProduct(product: {
    article_id: string;
    brand_name: string;
    merchant: Merchant;
    title: string;
    image: string;
    price_display: string;
    affiliate_url: string;
    sort_order: number;
}) {
    const { supabase, user, profile } = await getAdminContext();
    await assertCanWriteArticle(product.article_id, profile.role, user.id);
    const brandId = await resolveBrandId(supabase, product.brand_name);

    const { data, error } = await supabase
        .from("article_products")
        .insert({
            article_id: product.article_id,
            brand_id: brandId,
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

export async function getAdminBrands() {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") throw new Error("Only admins can manage brands");

    const { data, error } = await supabase
        .from("featured_brands")
        .select("*")
        .order("sort_order")
        .order("name");

    if (error) throw new Error(`Failed to load brands: ${error.message}`);
    return (data || []) as FeaturedBrand[];
}

export async function createBrand(brand: Omit<FeaturedBrand, "id">) {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") throw new Error("Only admins can manage brands");

    const name = brand.name.trim().replace(/\s+/g, " ");
    const { data, error } = await supabase
        .from("featured_brands")
        .insert({
            ...brand,
            name,
            normalized_name: normalizeBrandName(name),
            image: brand.image || "",
            link: brand.link || "/",
            sort_order: brand.sort_order || 0,
            is_active: brand.is_active ?? false,
        })
        .select()
        .single();

    if (error) throw new Error(error.code === "23505" ? "That brand already exists" : `Failed to create brand: ${error.message}`);
    return data as FeaturedBrand;
}

export async function updateBrand(id: string, brand: Omit<FeaturedBrand, "id">) {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") throw new Error("Only admins can manage brands");

    const name = brand.name.trim().replace(/\s+/g, " ");
    const { data, error } = await supabase
        .from("featured_brands")
        .update({
            ...brand,
            name,
            normalized_name: normalizeBrandName(name),
            image: brand.image || "",
            link: brand.link || "/",
            sort_order: brand.sort_order || 0,
            is_active: brand.is_active ?? false,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.code === "23505" ? "That brand already exists" : `Failed to update brand: ${error.message}`);
    return data as FeaturedBrand;
}

export async function deleteBrand(id: string) {
    const { supabase, profile } = await getAdminContext();
    if (profile.role !== "admin") throw new Error("Only admins can manage brands");

    const { count, error: countError } = await supabase
        .from("article_products")
        .select("*", { count: "exact", head: true })
        .eq("brand_id", id);

    if (countError) throw new Error(`Failed to check brand products: ${countError.message}`);
    if (count) throw new Error("This brand is used by affiliate products and cannot be deleted");

    const { error } = await supabase.from("featured_brands").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete brand: ${error.message}`);
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
