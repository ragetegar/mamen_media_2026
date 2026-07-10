"use client";

import { useEffect, useState } from "react";
import { Edit, Plus, Save, Trash2, X } from "lucide-react";
import {
    createSponsor,
    deleteSponsor,
    getAdminSponsors,
    updateSponsor,
} from "@/app/admin/actions";
import MediaSelector from "@/components/MediaSelector";
import { useAuth } from "@/lib/auth-context";
import type { HomepageSponsor } from "@/lib/types";

type SponsorForm = Omit<HomepageSponsor, "id" | "created_at" | "updated_at">;

const emptyForm: SponsorForm = {
    name: "",
    image: "",
    link: "/",
    alt_text: "",
    sort_order: 0,
    is_active: false,
};

export default function AdminSponsorsPage() {
    const { user, isLoading: loadingAuth } = useAuth();
    const [sponsors, setSponsors] = useState<HomepageSponsor[]>([]);
    const [form, setForm] = useState<SponsorForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (loadingAuth || user?.role !== "admin") return;

        let mounted = true;
        getAdminSponsors()
            .then((data) => {
                if (mounted) setSponsors(data);
            })
            .catch((err) => {
                if (mounted) setError(err instanceof Error ? err.message : "Failed to load sponsors");
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [user, loadingAuth]);

    const openNew = () => {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setShowForm(true);
    };

    const openEdit = (sponsor: HomepageSponsor) => {
        setForm({
            name: sponsor.name,
            image: sponsor.image,
            link: sponsor.link,
            alt_text: sponsor.alt_text || "",
            sort_order: sponsor.sort_order || 0,
            is_active: sponsor.is_active ?? false,
        });
        setEditingId(sponsor.id);
        setError("");
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.image.trim() || isSaving) return;
        setIsSaving(true);
        setError("");

        try {
            if (editingId) {
                const updated = await updateSponsor(editingId, form);
                setSponsors((current) => current.map((item) => item.id === editingId ? updated : item));
            } else {
                const created = await createSponsor(form);
                setSponsors((current) => [...current, created]);
            }
            setShowForm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save sponsor");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (sponsor: HomepageSponsor) => {
        if (!confirm(`Delete ${sponsor.name}?`)) return;
        setError("");

        try {
            await deleteSponsor(sponsor.id);
            setSponsors((current) => current.filter((item) => item.id !== sponsor.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete sponsor");
        }
    };

    const inputClasses =
        "w-full border-2 border-mamen-gray-700 bg-mamen-gray-800 px-4 py-3 text-sm text-mamen-white transition-colors focus:border-mamen-magenta focus:outline-none";
    const labelClasses =
        "mb-1.5 block font-headline text-xs uppercase tracking-wider text-mamen-gray-200";

    return (
        <div>
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline text-3xl font-black text-mamen-white">Sponsors</h1>
                    <p className="mt-1 text-sm text-mamen-gray-200">
                        Active banners appear below the homepage header and above Top Brands.
                    </p>
                </div>
                <button
                    onClick={openNew}
                    disabled={loading}
                    className="flex shrink-0 items-center gap-2 border-2 border-mamen-black bg-mamen-magenta px-4 py-2 font-headline text-xs font-bold uppercase tracking-wider text-white shadow-hard-sm disabled:opacity-50"
                >
                    <Plus size={14} /> New Sponsor
                </button>
            </div>

            {error && (
                <div className="mb-6 border-2 border-red-500 bg-red-900/30 p-4 text-sm text-red-300">{error}</div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4">
                    <div className="my-8 w-full max-w-2xl border-4 border-mamen-magenta bg-mamen-gray-900 shadow-hard-magenta">
                        <div className="flex items-center justify-between border-b border-mamen-gray-800 px-6 py-4">
                            <h2 className="font-headline text-xl font-bold text-mamen-white">
                                {editingId ? "Edit Sponsor" : "New Sponsor"}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-mamen-gray-200 hover:text-mamen-white" aria-label="Close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 p-6">
                            <div>
                                <label className={labelClasses}>Sponsor Name *</label>
                                <input
                                    value={form.name}
                                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                                    className={inputClasses}
                                    placeholder="Brand or campaign name"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Banner Image *</label>
                                <MediaSelector
                                    value={form.image}
                                    onChange={(image) => setForm({ ...form, image })}
                                    folder="mamen/sponsors"
                                    aspect="5/1"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Destination Link</label>
                                <input
                                    value={form.link}
                                    onChange={(event) => setForm({ ...form, link: event.target.value })}
                                    className={inputClasses}
                                    placeholder="https://brand.com/campaign"
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>Image Description</label>
                                <input
                                    value={form.alt_text || ""}
                                    onChange={(event) => setForm({ ...form, alt_text: event.target.value })}
                                    className={inputClasses}
                                    placeholder="Short description for accessibility"
                                />
                            </div>
                            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClasses}>Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sort_order || 0}
                                        onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })}
                                        className={inputClasses}
                                    />
                                </div>
                                <label className="flex items-center gap-3 border-2 border-mamen-gray-700 px-4 py-3 text-sm text-mamen-white">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active ?? false}
                                        onChange={(event) => setForm({ ...form, is_active: event.target.checked })}
                                    />
                                    Show on homepage
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-mamen-gray-800 px-6 py-4">
                            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-mamen-gray-200">Cancel</button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.name.trim() || !form.image.trim()}
                                className="flex items-center gap-2 border-2 border-mamen-black bg-mamen-magenta px-6 py-2 font-headline text-xs font-bold uppercase tracking-wider text-white disabled:opacity-50"
                            >
                                <Save size={14} /> {isSaving ? "Saving..." : "Save Sponsor"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto border-2 border-mamen-gray-800 bg-mamen-black">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-mamen-gray-800">
                            <th className="px-4 py-3 text-left text-xs uppercase text-mamen-gray-200">Sponsor</th>
                            <th className="px-4 py-3 text-left text-xs uppercase text-mamen-gray-200">Homepage</th>
                            <th className="px-4 py-3 text-left text-xs uppercase text-mamen-gray-200">Order</th>
                            <th className="px-4 py-3 text-right text-xs uppercase text-mamen-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sponsors.map((sponsor) => (
                            <tr key={sponsor.id} className="border-b border-mamen-gray-800">
                                <td className="px-4 py-3 font-medium text-mamen-white">{sponsor.name}</td>
                                <td className={`px-4 py-3 ${sponsor.is_active ? "text-mamen-lime" : "text-mamen-gray-200"}`}>
                                    {sponsor.is_active ? "Visible" : "Hidden"}
                                </td>
                                <td className="px-4 py-3 text-mamen-gray-200">{sponsor.sort_order || 0}</td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => openEdit(sponsor)} className="text-mamen-purple hover:text-mamen-magenta" aria-label={`Edit ${sponsor.name}`}>
                                            <Edit size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(sponsor)} className="text-red-400 hover:text-red-300" aria-label={`Delete ${sponsor.name}`}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && sponsors.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-12 text-center text-mamen-gray-200">No sponsors yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
