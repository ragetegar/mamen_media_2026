"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import { createBrand, deleteBrand, getAdminBrands, updateBrand } from "@/app/admin/actions";
import { FeaturedBrand } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import MediaSelector from "@/components/MediaSelector";

type BrandForm = Omit<FeaturedBrand, "id">;

const emptyForm: BrandForm = {
    name: "",
    image: "",
    link: "/",
    tag: "",
    sort_order: 0,
    is_active: false,
};

export default function AdminBrandsPage() {
    const { user, isLoading: loadingAuth } = useAuth();
    const [brands, setBrands] = useState<FeaturedBrand[]>([]);
    const [form, setForm] = useState<BrandForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (loadingAuth || user?.role !== "admin") return;

        let mounted = true;
        getAdminBrands()
            .then((data) => {
                if (mounted) setBrands(data);
            })
            .catch((err) => {
                if (mounted) setError(err instanceof Error ? err.message : "Failed to load brands");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [user, loadingAuth]);

    if (user?.role === "contributor") {
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-mamen-gray-200">Contributors do not have permission to manage brands.</p>
            </div>
        );
    }

    const openNew = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    const openEdit = (brand: FeaturedBrand) => {
        setForm({
            name: brand.name,
            image: brand.image,
            link: brand.link,
            tag: brand.tag || "",
            sort_order: brand.sort_order || 0,
            is_active: brand.is_active ?? false,
        });
        setEditingId(brand.id);
        setError("");
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || isSaving) return;
        setIsSaving(true);
        setError("");
        try {
            if (editingId) {
                const updated = await updateBrand(editingId, form);
                setBrands((prev) => prev.map((brand) => brand.id === editingId ? updated : brand));
            } else {
                const created = await createBrand(form);
                setBrands((prev) => [...prev, created]);
            }
            setShowForm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save brand");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (brand: FeaturedBrand) => {
        if (!confirm(`Delete ${brand.name}?`)) return;
        setError("");
        try {
            await deleteBrand(brand.id);
            setBrands((prev) => prev.filter((item) => item.id !== brand.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete brand");
        }
    };

    const inputClasses =
        "w-full px-4 py-3 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-magenta transition-colors";
    const labelClasses =
        "block text-xs font-headline tracking-wider uppercase text-mamen-gray-200 mb-1.5";

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-headline text-3xl font-black text-mamen-white">Brands</h1>
                    <p className="text-sm text-mamen-gray-200 mt-1">
                        Active brands appear in Top Brands. Names are matched without capitalization differences.
                    </p>
                </div>
                <button
                    onClick={openNew}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-mamen-magenta text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm disabled:opacity-50"
                >
                    <Plus size={14} /> New Brand
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">{error}</div>
            )}

            {showForm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-mamen-gray-900 border-4 border-mamen-magenta w-full max-w-2xl my-8 shadow-hard-magenta">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-mamen-gray-800">
                            <h2 className="font-headline text-xl font-bold text-mamen-white">
                                {editingId ? "Edit Brand" : "New Brand"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-mamen-gray-200 hover:text-mamen-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-900/30 border-2 border-red-500 text-red-300 text-sm">{error}</div>
                            )}
                            <div>
                                <label className={labelClasses}>Brand Name *</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Adidas"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Brand Image</label>
                                <MediaSelector
                                    value={form.image}
                                    onChange={(image) => setForm({ ...form, image })}
                                    folder="mamen/brands"
                                    aspect="1/1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Link</label>
                                    <input
                                        value={form.link}
                                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                                        className={inputClasses}
                                        placeholder="/media?brand=adidas"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Tag</label>
                                    <input
                                        value={form.tag || ""}
                                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Style"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div>
                                    <label className={labelClasses}>Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sort_order || 0}
                                        onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                                        className={inputClasses}
                                    />
                                </div>
                                <label className="flex items-center gap-3 px-4 py-3 border-2 border-mamen-gray-700 text-sm text-mamen-white">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active ?? false}
                                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                    />
                                    Show in Top Brands
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-mamen-gray-800">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-mamen-gray-200">
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.name.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-mamen-magenta text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black disabled:opacity-50"
                            >
                                <Save size={14} /> {isSaving ? "Saving..." : "Save Brand"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-mamen-black border-2 border-mamen-gray-800 overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-mamen-gray-800">
                            <th className="text-left px-4 py-3 text-mamen-gray-200 uppercase text-xs">Brand</th>
                            <th className="text-left px-4 py-3 text-mamen-gray-200 uppercase text-xs">Top Brands</th>
                            <th className="text-left px-4 py-3 text-mamen-gray-200 uppercase text-xs">Order</th>
                            <th className="text-right px-4 py-3 text-mamen-gray-200 uppercase text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map((brand) => (
                            <tr key={brand.id} className="border-b border-mamen-gray-800">
                                <td className="px-4 py-3 text-mamen-white font-medium">{brand.name}</td>
                                <td className="px-4 py-3">
                                    <span className={brand.is_active ? "text-mamen-lime" : "text-mamen-gray-200"}>
                                        {brand.is_active ? "Visible" : "Hidden"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-mamen-gray-200">{brand.sort_order || 0}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => openEdit(brand)} className="text-mamen-purple hover:text-mamen-magenta">
                                            <Edit size={15} />
                                        </button>
                                        <button onClick={() => handleDelete(brand)} className="text-red-400 hover:text-red-300">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && brands.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-mamen-gray-200">No brands yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
