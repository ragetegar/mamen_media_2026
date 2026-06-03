"use client";

import { useState, useEffect } from "react";
import { Concert, ConcertType, CONCERT_TYPES } from "@/lib/types";
import { Trash2, Edit, Plus, X, Save, ExternalLink } from "lucide-react";
import { getConcerts } from "@/lib/data";
import { createConcert, updateConcert, deleteConcert } from "@/app/admin/actions";
import { useAuth } from "@/lib/auth-context";
import MediaSelector from "@/components/MediaSelector";

interface ConcertFormData {
    title: string;
    slug: string;
    concert_type: ConcertType;
    start_datetime: string;
    end_datetime: string;
    venue: string;
    city: string;
    poster_image: string;
    ticket_url: string;
    genre_tags: string;
    description: string;
}

const emptyForm: ConcertFormData = {
    title: "",
    slug: "",
    concert_type: "local",
    start_datetime: "",
    end_datetime: "",
    venue: "",
    city: "",
    poster_image: "",
    ticket_url: "",
    genre_tags: "",
    description: "",
};

export default function AdminConcertsPage() {
    const { user, isLoading: loadingAuth } = useAuth();
    const [concerts, setConcerts] = useState<Concert[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ConcertFormData>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (loadingAuth) return;

        let isMounted = true;
        async function loadConcerts() {
            setLoading(true);
            try {
                const data = await getConcerts();
                if (isMounted) setConcerts(data);
            } catch (err) {
                console.error("Failed to load concerts", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        loadConcerts();
        return () => { isMounted = false; };
    }, [user, loadingAuth]);

    if (user?.role === "contributor") {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-mamen-gray-200">Contributors do not have permission to manage concerts.</p>
            </div>
        );
    }

    const generateSlug = (title: string) =>
        title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

    const handleNew = () => {
        setForm(emptyForm);
        setEditingId(null);
        setShowForm(true);
    };

    const handleEdit = (concert: Concert) => {
        setForm({
            title: concert.title,
            slug: concert.slug,
            concert_type: concert.concert_type,
            start_datetime: concert.start_datetime.slice(0, 16),
            end_datetime: concert.end_datetime?.slice(0, 16) || "",
            venue: concert.venue,
            city: concert.city,
            poster_image: concert.poster_image,
            ticket_url: concert.ticket_url,
            genre_tags: concert.genre_tags.join(", "),
            description: concert.description || "",
        });
        setEditingId(concert.id);
        setShowForm(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.slug || !form.venue || !form.city || isSaving) return;

        const concertData = {
            title: form.title,
            slug: form.slug,
            concert_type: form.concert_type,
            start_datetime: form.start_datetime
                ? new Date(form.start_datetime).toISOString()
                : new Date().toISOString(),
            end_datetime: form.end_datetime
                ? new Date(form.end_datetime).toISOString()
                : undefined,
            venue: form.venue,
            city: form.city,
            poster_image: form.poster_image,
            ticket_url: form.ticket_url,
            genre_tags: form.genre_tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            description: form.description,
        };

        setIsSaving(true);
        try {
            if (editingId) {
                const updated = await updateConcert(editingId, { ...concertData, updated_at: new Date().toISOString() });
                setConcerts((prev) =>
                    prev.map((c) => (c.id === editingId ? updated : c))
                );
            } else {
                const created = await createConcert({
                    ...concertData,
                    interested_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
                setConcerts((prev) => [created, ...prev]);
            }

            setShowForm(false);
            setEditingId(null);
            setForm(emptyForm);
        } catch (err) {
            alert("Failed to save concert.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this concert?")) {
            try {
                await deleteConcert(id);
                setConcerts((prev) => prev.filter((c) => c.id !== id));
            } catch (err) {
                alert("Failed to delete concert.");
            }
        }
    };

    const inputClasses =
        "w-full px-4 py-3 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-magenta transition-colors";
    const labelClasses =
        "block text-xs font-headline tracking-wider uppercase text-mamen-gray-200 mb-1.5";

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-headline text-3xl font-black text-mamen-white">
                    Concerts
                </h1>
                <button
                    onClick={handleNew}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-mamen-magenta text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer disabled:opacity-50"
                >
                    <Plus size={14} /> New Concert
                </button>
            </div>

            {loading && (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mamen-magenta"></div>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-mamen-gray-900 border-4 border-mamen-magenta w-full max-w-3xl my-8 shadow-hard-magenta">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-mamen-gray-800">
                            <h2 className="font-headline text-xl font-bold text-mamen-white">
                                {editingId ? "Edit Concert" : "New Concert"}
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

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                                    placeholder="Concert / Event title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Slug</label>
                                    <input
                                        type="text"
                                        value={form.slug}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        className={inputClasses}
                                        placeholder="concert-slug"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>Concert Type *</label>
                                    <select
                                        value={form.concert_type}
                                        onChange={(e) =>
                                            setForm({ ...form, concert_type: e.target.value as ConcertType })
                                        }
                                        className={inputClasses}
                                    >
                                        {CONCERT_TYPES.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Start Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        value={form.start_datetime}
                                        onChange={(e) => setForm({ ...form, start_datetime: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>End Date & Time</label>
                                    <input
                                        type="datetime-local"
                                        value={form.end_datetime}
                                        onChange={(e) => setForm({ ...form, end_datetime: e.target.value })}
                                        className={inputClasses}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClasses}>Venue *</label>
                                    <input
                                        type="text"
                                        value={form.venue}
                                        onChange={(e) => setForm({ ...form, venue: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Venue name"
                                    />
                                </div>
                                <div>
                                    <label className={labelClasses}>City *</label>
                                    <input
                                        type="text"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                        className={inputClasses}
                                        placeholder="Jakarta, Bandung, etc."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Poster Image</label>
                                <MediaSelector
                                    value={form.poster_image}
                                    onChange={(url) => setForm({ ...form, poster_image: url })}
                                    folder="mamen/concerts"
                                    aspect="3/4"
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Ticket URL</label>
                                <input
                                    type="text"
                                    value={form.ticket_url}
                                    onChange={(e) => setForm({ ...form, ticket_url: e.target.value })}
                                    className={inputClasses}
                                    placeholder="https://tiket.com/..."
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Optional Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={form.genre_tags}
                                    onChange={(e) => setForm({ ...form, genre_tags: e.target.value })}
                                    className={inputClasses}
                                    placeholder="Indie, Pop, Rock..."
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className={`${inputClasses} resize-y`}
                                    rows={4}
                                    placeholder="Concert description..."
                                />
                            </div>
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
                                className="flex items-center gap-2 px-6 py-2 bg-mamen-magenta text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
                            >
                                <Save size={14} /> {isSaving ? "Saving..." : (editingId ? "Update" : "Create")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Concerts Table */}
            <div className="bg-mamen-black border-2 border-mamen-gray-800 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-mamen-gray-800">
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Title
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Type
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                Date
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden lg:table-cell">
                                Venue
                            </th>
                            <th className="text-left px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200 hidden md:table-cell">
                                City
                            </th>
                            <th className="text-right px-4 py-3 font-headline text-xs tracking-wider uppercase text-mamen-gray-200">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {concerts.map((concert) => (
                            <tr
                                key={concert.id}
                                className="border-b border-mamen-gray-800 hover:bg-mamen-gray-800/50 transition-colors"
                            >
                                <td className="px-4 py-3 text-mamen-white font-medium max-w-[250px]">
                                    <p className="truncate">{concert.title}</p>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                    <span className="text-xs font-bold uppercase tracking-wider text-mamen-purple">
                                        {
                                            CONCERT_TYPES.find((t) => t.value === concert.concert_type)
                                                ?.label
                                        }
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-mamen-gray-200 text-xs hidden md:table-cell">
                                    {new Date(concert.start_datetime).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-mamen-gray-200 text-xs hidden lg:table-cell">
                                    {concert.venue}
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell">
                                    <span className="text-xs font-bold uppercase tracking-wider text-mamen-magenta">
                                        {concert.city}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <a
                                            href={`/concerts/${concert.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-mamen-gray-200 hover:text-mamen-lime transition-colors cursor-pointer"
                                            title="View on site"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                        <button
                                            onClick={() => handleEdit(concert)}
                                            className="p-1.5 text-mamen-gray-200 hover:text-mamen-magenta transition-colors cursor-pointer"
                                            title="Edit"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(concert.id)}
                                            className="p-1.5 text-mamen-gray-200 hover:text-red-400 transition-colors cursor-pointer"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!loading && concerts.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-mamen-gray-800 mt-8">
                    <p className="text-mamen-gray-700 font-headline text-lg">No concerts found.</p>
                </div>
            )}
        </div>
    );
}
