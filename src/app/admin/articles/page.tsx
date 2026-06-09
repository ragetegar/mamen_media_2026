"use client";

import { useState, useEffect } from "react";
import { Article, ArticleCategory, ARTICLE_CATEGORIES, ArticleProduct, ArticleSubcategory, Concert, FeaturedBrand } from "@/lib/types";
import { ARTICLE_TAXONOMY, getArticleHref } from "@/lib/article-taxonomy";
import { Trash2, Edit, Plus, X, Save, ExternalLink, RefreshCw } from "lucide-react";
import {
    getAdminArticleData,
    createArticle,
    updateArticle,
    deleteArticle,
    createArticleProduct,
    deleteArticleProduct
} from "@/app/admin/actions";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth-context";
import MediaSelector from "@/components/MediaSelector";

// Dynamically import RichTextEditor to avoid SSR issues with TipTap
const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
    ssr: false,
    loading: () => (
        <div className="border-2 border-mamen-gray-700 bg-mamen-gray-800 h-64 flex items-center justify-center">
            <span className="text-mamen-gray-700 text-sm">Loading editor...</span>
        </div>
    ),
});

interface ArticleFormData {
    title: string;
    slug: string;
    category: ArticleCategory;
    cover_image: string;
    excerpt: string;
    body_html: string;
    author: string;
    seo_title: string;
    seo_description: string;
    tags: string;
    status: "published" | "draft";
    published_at: string;
    linked_concert_ids: string[];
    subcategory: ArticleSubcategory;
}

const emptyForm: ArticleFormData = {
    title: "",
    slug: "",
    category: "music",
    subcategory: "review",
    cover_image: "",
    excerpt: "",
    body_html: "",
    author: "Mamen Editorial",
    seo_title: "",
    seo_description: "",
    tags: "",
    status: "draft",
    published_at: "",
    linked_concert_ids: [],
};

export default function AdminArticlesPage() {
    const { user, isLoading: loadingAuth } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [products, setProducts] = useState<ArticleProduct[]>([]);
    const [brands, setBrands] = useState<FeaturedBrand[]>([]);
    const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
    const [authors, setAuthors] = useState<{ id: string; name: string; role: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ArticleFormData>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    // Search & Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterSortBy, setFilterSortBy] = useState("latest");

    useEffect(() => {
        // Wait for auth to finish loading
        if (loadingAuth) return;

        let isMounted = true;
        async function loadData() {
            setLoading(true);
            setLoadError("");
            try {
                const data = await getAdminArticleData();

                if (isMounted) {
                    setArticles(data.articles);
                    setAllConcerts(data.concerts);
                    setProducts(data.products);
                    setBrands(data.brands);
                    setAuthors(data.authors);
                }
            } catch (err) {
                console.error("Failed to load admin data:", err);
                if (isMounted) {
                    setLoadError(err instanceof Error ? err.message : "Failed to load admin data");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadData();
        return () => { isMounted = false; };
    }, [user, loadingAuth]);

    // Product form for current article
    const [showProductForm, setShowProductForm] = useState(false);
    const [productForm, setProductForm] = useState({
        merchant: "shopee" as "shopee" | "tokopedia" | "tiktok",
        brand_name: "",
        title: "",
        image: "",
        price_display: "",
        affiliate_url: "",
    });

    const generateSlug = (title: string) =>
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    const handleNew = () => {
        setForm({
            ...emptyForm,
            author: user?.name || "Mamen Editorial"
        });
        setEditingId(null);
        setShowForm(true);
    };

    const handleEdit = (article: Article) => {
        setForm({
            title: article.title,
            slug: article.slug,
            category: article.category,
            subcategory: article.subcategory,
            cover_image: article.cover_image,
            excerpt: article.excerpt,
            body_html: article.body_html,
            author: article.author,
            seo_title: article.seo_title,
            seo_description: article.seo_description,
            tags: (article.tags || []).join(", "),
            status: article.status || "published",
            published_at: article.published_at ? new Date(article.published_at).toISOString().slice(0, 16) : "",
            linked_concert_ids: article.linked_concert_ids || [],
        });
        setEditingId(article.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.subcategory || isSaving) return;

        const parsedTags = form.tags
            .split(",")
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);

        setIsSaving(true);
        try {
            if (editingId) {
                const updated = await updateArticle(editingId, {
                    ...form,
                    tags: parsedTags,
                    published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
                    linked_concert_ids: form.linked_concert_ids,
                    updated_at: new Date().toISOString(),
                });
                setArticles((prev) =>
                    prev.map((a) => (a.id === editingId ? updated : a))
                );
            } else {
                // If admin selected a different author, use their id
                const selectedAuthor = authors.find(a => a.name === form.author);
                const authorId = selectedAuthor ? selectedAuthor.id : user?.id;

                const created = await createArticle({
                    ...form,
                    author_id: authorId,
                    tags: parsedTags,
                    linked_concert_ids: form.linked_concert_ids,
                    published_at: form.published_at
                        ? new Date(form.published_at).toISOString()
                        : (form.status === "published" ? new Date().toISOString() : undefined),
                });
                setArticles((prev) => [created, ...prev]);
            }

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
        } catch {
            alert("Error saving article. Check console for details.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this article?")) {
            try {
                await deleteArticle(id);
                setArticles((prev) => prev.filter((a) => a.id !== id));
                setProducts((prev) => prev.filter((p) => p.article_id !== id));
            } catch {
                alert("Failed to delete article.");
            }
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: "published" | "draft" | undefined) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";
        if (confirm(`Are you sure you want to ${newStatus === "published" ? "publish" : "unpublish"} this article?`)) {
            try {
                const updated = await updateArticle(id, { status: newStatus, updated_at: new Date().toISOString() });
                setArticles((prev) =>
                    prev.map((a) => (a.id === id ? updated : a))
                );
            } catch {
                alert("Failed to toggle status.");
            }
        }
    };

    const handleAddProduct = async () => {
        if (!editingId || !productForm.brand_name.trim() || !productForm.title || !productForm.affiliate_url) return;
        try {
            const newProduct = await createArticleProduct({
                article_id: editingId,
                brand_name: productForm.brand_name,
                merchant: productForm.merchant,
                title: productForm.title,
                image: productForm.image,
                price_display: productForm.price_display,
                affiliate_url: productForm.affiliate_url,
                sort_order: products.filter((p) => p.article_id === editingId).length + 1,
            });
            setProducts((prev) => [...prev, newProduct]);
            setBrands((prev) => {
                if (prev.some((brand) => brand.id === newProduct.brand_id)) return prev;
                return [
                    ...prev,
                    {
                        id: newProduct.brand_id || "",
                        name: productForm.brand_name.trim().replace(/\s+/g, " "),
                        image: "",
                        link: "/",
                        sort_order: 0,
                        is_active: false,
                    },
                ];
            });
            setProductForm({
                merchant: "shopee",
                brand_name: "",
                title: "",
                image: "",
                price_display: "",
                affiliate_url: "",
            });
            setShowProductForm(false);
        } catch {
            alert("Failed to add product.");
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteArticleProduct(productId);
            setProducts((prev) => prev.filter((p) => p.id !== productId));
        } catch {
            alert("Failed to delete product.");
        }
    };

    const toggleConcert = (concertId: string) => {
        setForm((prev) => ({
            ...prev,
            linked_concert_ids: prev.linked_concert_ids.includes(concertId)
                ? prev.linked_concert_ids.filter((id) => id !== concertId)
                : [...prev.linked_concert_ids, concertId],
        }));
    };

    const currentProducts = editingId
        ? products.filter((p) => p.article_id === editingId)
        : [];

    const displayedArticles = articles
        .filter(a => user?.role === "contributor" ? a.author_id === user.id : true)
        .filter(a => filterCategory ? a.category === filterCategory : true)
        .filter(a => searchQuery ? a.title.toLowerCase().includes(searchQuery.toLowerCase()) : true)
        .sort((a, b) => {
            if (filterSortBy === "latest") {
                return new Date(b.created_at || b.published_at || 0).getTime() - new Date(a.created_at || a.published_at || 0).getTime();
            } else if (filterSortBy === "popular") {
                // Mock popular logic (since no views count exists): arbitrary stable ordering
                return (b.title.length + (b.category === "music" ? 5 : 0)) - (a.title.length + (a.category === "music" ? 5 : 0));
            }
            return 0;
        });

    const inputClasses =
        "w-full px-4 py-3 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple transition-colors";
    const labelClasses =
        "block text-xs font-headline tracking-wider uppercase text-mamen-gray-200 mb-1.5";

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-headline text-3xl font-black text-mamen-white">
                    Articles
                </h1>
                <button
                    onClick={handleNew}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-mamen-purple text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50"
                >
                    <Plus size={14} /> New Article
                </button>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-lime"></div>
                </div>
            )}

            {!loading && loadError && (
                <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">
                    <p className="font-headline font-bold uppercase tracking-wider mb-1">Could not load articles</p>
                    <p>{loadError}</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-mamen-gray-900 border-4 border-mamen-purple w-full max-w-4xl my-8 shadow-hard-purple">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-mamen-gray-800">
                            <h2 className="font-headline text-xl font-bold text-mamen-white">
                                {editingId ? "Edit Article" : "New Article"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="text-mamen-gray-200 hover:text-mamen-white cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div>
                                <label className={labelClasses}>Title *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                            slug: generateSlug(e.target.value),
                                        });
                                    }}
                                    className={inputClasses}
                                    placeholder="Article title"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Slug</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    className={inputClasses}
                                    placeholder="article-slug"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Category *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            {
                                                const category = e.target.value as ArticleCategory;
                                                setForm({ ...form, category, subcategory: ARTICLE_TAXONOMY[category][0].value });
                                            }
                                        }
                                        className={inputClasses}
                                    >
                                        {ARTICLE_CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mt-4">
                                        <label className={labelClasses}>Subcategory *</label>
                                        <select
                                            value={form.subcategory}
                                            onChange={(e) => setForm({ ...form, subcategory: e.target.value as ArticleSubcategory })}
                                            className={inputClasses}
                                        >
                                            {ARTICLE_TAXONOMY[form.category].map((sub) => (
                                                <option key={sub.value} value={sub.value}>
                                                    {sub.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                <div>
                                    <label className={labelClasses}>Author</label>
                                    {user?.role === "admin" && authors.length > 0 ? (
                                        <select
                                            value={form.author}
                                            onChange={(e) => {
                                                setForm({ ...form, author: e.target.value });
                                                // Note: author_id will be set on save from the selected profile
                                            }}
                                            className={inputClasses}
                                        >
                                            <option value="">Select author…</option>
                                            {authors.map((a) => (
                                                <option key={a.id} value={a.name}>
                                                    {a.name} ({a.role})
                                                </option>
                                            ))}
                                            {/* Allow custom name too if needed */}
                                            {form.author && !authors.find(a => a.name === form.author) && (
                                                <option value={form.author}>{form.author} (custom)</option>
                                            )}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={form.author}
                                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                                            className={inputClasses}
                                            placeholder="Author name"
                                            disabled={user?.role === "contributor"}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Status *</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({ ...form, status: e.target.value as "published" | "draft" })
                                        }
                                        className={inputClasses}
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft (Unpublished)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Published Date (Optional)</label>
                                    <input
                                        type="datetime-local"
                                        value={form.published_at}
                                        onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Cover Image</label>
                                <MediaSelector
                                    value={form.cover_image}
                                    onChange={(url) => setForm({ ...form, cover_image: url })}
                                    folder="mamen/articles"
                                    aspect="16/9"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Excerpt</label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                    className={`${inputClasses} resize-y`}
                                    rows={2}
                                    placeholder="Short description for listing pages"
                                />
                            </div>

                            {/* Rich Text Editor */}
                            <div>
                                <label className={labelClasses}>Body Content</label>
                                <RichTextEditor
                                    value={form.body_html}
                                    onChange={(html) => setForm({ ...form, body_html: html })}
                                />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className={labelClasses}>Tags</label>
                                <input
                                    type="text"
                                    value={form.tags}
                                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                    className={inputClasses}
                                    placeholder="indie, review, concert (comma-separated)"
                                />
                                <p className="text-xs text-mamen-gray-700 mt-1">Separate tags with commas</p>
                            </div>

                            {/* Related Concerts */}
                            <div>
                                <label className={labelClasses}>Related Concerts</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    {allConcerts.map((concert) => {
                                        const checked = form.linked_concert_ids.includes(concert.id);
                                        return (
                                            <button
                                                key={concert.id}
                                                type="button"
                                                onClick={() => toggleConcert(concert.id)}
                                                className={`flex items-center gap-2 px-3 py-2.5 text-left border-2 transition-all cursor-pointer ${checked
                                                    ? "border-mamen-magenta bg-mamen-magenta/10 text-mamen-white"
                                                    : "border-mamen-gray-700 bg-mamen-gray-800 text-mamen-gray-200 hover:border-mamen-gray-600"
                                                    }`}
                                            >
                                                <div
                                                    className={`w-4 h-4 border-2 shrink-0 flex items-center justify-center ${checked ? "border-mamen-magenta bg-mamen-magenta" : "border-mamen-gray-600"
                                                        }`}
                                                >
                                                    {checked && <span className="text-white text-xs font-bold">✓</span>}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate">{concert.title}</p>
                                                    <p className="text-xs text-mamen-gray-700">
                                                        {concert.city} · {concert.concert_type}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>SEO Title</label>
                                    <input
                                        type="text"
                                        value={form.seo_title}
                                        onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                                        className={inputClasses}
                                        placeholder="SEO title"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>SEO Description</label>
                                    <input
                                        type="text"
                                        value={form.seo_description}
                                        onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                                        className={inputClasses}
                                        placeholder="SEO description"
                                    />
                                </div>
                            </div>

                            {/* Affiliate Products Section (only when editing and user is admin) */}
                            {editingId && user?.role === "admin" && (
                                <div className="border-t-2 border-mamen-gray-700 pt-4 mt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-headline text-sm font-bold tracking-wider uppercase text-mamen-lime">
                                            Affiliate Products
                                        </h3>
                                        <button
                                            onClick={() => setShowProductForm(!showProductForm)}
                                            className="flex items-center gap-1 text-xs text-mamen-purple hover:text-mamen-magenta cursor-pointer font-bold"
                                        >
                                            <Plus size={12} /> Add Product
                                        </button>
                                    </div>

                                    {/* Existing products */}
                                    {currentProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-3 bg-mamen-gray-800 border border-mamen-gray-700 mb-2"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-mamen-white">{product.title}</p>
                                                <p className="text-xs text-mamen-gray-200">
                                                    {brands.find((brand) => brand.id === product.brand_id)?.name || "Unknown brand"} · {product.merchant} · {product.price_display}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-400 hover:text-red-300 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add product form */}
                                    {showProductForm && (
                                        <div className="p-4 bg-mamen-gray-800 border-2 border-mamen-purple mt-2 space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelClasses}>Brand *</label>
                                                    <input
                                                        type="text"
                                                        list="affiliate-brand-options"
                                                        value={productForm.brand_name}
                                                        onChange={(e) =>
                                                            setProductForm({ ...productForm, brand_name: e.target.value })
                                                        }
                                                        className={inputClasses}
                                                        placeholder="Adidas"
                                                    />
                                                    <datalist id="affiliate-brand-options">
                                                        {brands.map((brand) => (
                                                            <option key={brand.id} value={brand.name} />
                                                        ))}
                                                    </datalist>
                                                    <p className="mt-1 text-xs text-mamen-gray-200">
                                                        Existing brands match regardless of capitalization.
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Product Title *</label>
                                                    <input
                                                        type="text"
                                                        value={productForm.title}
                                                        onChange={(e) =>
                                                            setProductForm({ ...productForm, title: e.target.value })
                                                        }
                                                        className={inputClasses}
                                                        placeholder="Product name"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className={labelClasses}>Merchant *</label>
                                                    <select
                                                        value={productForm.merchant}
                                                        onChange={(e) =>
                                                            setProductForm({
                                                                ...productForm,
                                                                merchant: e.target.value as "shopee" | "tokopedia" | "tiktok",
                                                            })
                                                        }
                                                        className={inputClasses}
                                                    >
                                                        <option value="shopee">Shopee</option>
                                                        <option value="tokopedia">Tokopedia</option>
                                                        <option value="tiktok">TikTok Shop</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelClasses}>Price Display</label>
                                                    <input
                                                        type="text"
                                                        value={productForm.price_display}
                                                        onChange={(e) =>
                                                            setProductForm({ ...productForm, price_display: e.target.value })
                                                        }
                                                        className={inputClasses}
                                                        placeholder="Rp 450.000"
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Image URL</label>
                                                    <input
                                                        type="text"
                                                        value={productForm.image}
                                                        onChange={(e) =>
                                                            setProductForm({ ...productForm, image: e.target.value })
                                                        }
                                                        className={inputClasses}
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelClasses}>Affiliate URL *</label>
                                                <input
                                                    type="text"
                                                    value={productForm.affiliate_url}
                                                    onChange={(e) =>
                                                        setProductForm({ ...productForm, affiliate_url: e.target.value })
                                                    }
                                                    className={inputClasses}
                                                    placeholder="https://shopee.co.id/..."
                                                />
                                            </div>
                                            <button
                                                onClick={handleAddProduct}
                                                className="px-4 py-2 bg-mamen-lime text-mamen-black font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black cursor-pointer"
                                            >
                                                Add Product
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-mamen-gray-800">
                            <button
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="px-4 py-2 text-sm text-mamen-gray-200 hover:text-mamen-white cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-mamen-purple text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
                            >
                                <Save size={14} /> {isSaving ? "Saving..." : (editingId ? "Update" : "Create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            {!showForm && (
                <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-mamen-gray-900 border-2 border-mamen-gray-800 rounded-sm">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white placeholder:text-mamen-gray-700 text-sm focus:outline-none focus:border-mamen-purple"
                        />
                    </div>
                    <div className="flex gap-4">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple"
                        >
                            <option value="">All Categories</option>
                            {ARTICLE_CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterSortBy}
                            onChange={(e) => setFilterSortBy(e.target.value)}
                            className="px-4 py-2 bg-mamen-black border border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple"
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Popular</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Articles Table */}
            <div className="bg-mamen-black border-2 border-mamen-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-mamen-gray-800">
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Title
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Category
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Has Product
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Published
                            </th>
                            <th className="text-center px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Status
                            </th>
                            <th className="text-right px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedArticles.map((article) => {
                            return (
                                <tr
                                    key={article.id}
                                    className="border-b border-mamen-gray-800 hover:bg-mamen-gray-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-mamen-white font-medium max-w-[300px]">
                                        <p className="truncate">{article.title}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-xs font-bold uppercase tracking-wider text-mamen-purple">
                                            {article.category} {article.subcategory ? `/ ${article.subcategory}` : ''}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        {products.some(p => p.article_id === article.id) ? (
                                            <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider text-mamen-black bg-mamen-lime shadow-hard-sm">
                                                Yes
                                            </span>
                                        ) : (
                                            <span className="text-xs text-mamen-gray-700">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-mamen-gray-200 text-xs hidden md:table-cell">
                                        {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-4 py-3 text-center hidden md:table-cell">
                                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${article.status === 'draft' ? 'text-mamen-gray-400 bg-mamen-gray-800' : 'text-mamen-lime bg-mamen-lime/10'}`}>
                                            {article.status || 'published'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {article.status !== "draft" && (
                                                <a
                                                    href={getArticleHref(article)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-mamen-gray-200 hover:text-mamen-lime transition-colors cursor-pointer"
                                                    title="View on site"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleToggleStatus(article.id, article.status)}
                                                className="p-1.5 text-mamen-gray-200 hover:text-mamen-blue transition-colors cursor-pointer"
                                                title={article.status === 'draft' ? "Publish" : "Unpublish"}
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(article)}
                                                className="p-1.5 text-mamen-gray-200 hover:text-mamen-purple transition-colors cursor-pointer"
                                                title="Edit"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            {user?.role === "admin" && (
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-1.5 text-mamen-gray-200 hover:text-red-400 transition-colors cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {!loading && displayedArticles.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-mamen-gray-800 mt-8">
                    <p className="text-mamen-gray-700 font-headline text-lg">No articles discovered yet.</p>
                </div>
            )}
        </div>
    );
}
