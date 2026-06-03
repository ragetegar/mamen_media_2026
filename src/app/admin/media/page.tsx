"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Trash2, RefreshCw, Upload, Check, Loader2 } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";

interface CloudinaryImage {
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
    bytes: number;
    format: string;
    created_at: string;
}

export default function AdminMediaPage() {
    const [images, setImages] = useState<CloudinaryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState("");

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/cloudinary/list");
            if (res.ok) {
                const data = await res.json();
                setImages(data.images ?? []);
            }
        } catch (err) {
            console.error("Failed to fetch images", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    // When a new image is uploaded via the uploader, add it to the local list
    const handleNewUpload = (url: string) => {
        setUploadedUrl(url);
        // Re-fetch the gallery to include the new image
        setTimeout(() => fetchImages(), 1000);
    };

    const handleCopy = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(url);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const handleDelete = async (public_id: string) => {
        if (!confirm("Delete this image permanently from Cloudinary?")) return;
        setDeleting(public_id);
        try {
            const res = await fetch("/api/cloudinary/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ public_id }),
            });
            if (res.ok) {
                setImages((prev) => prev.filter((img) => img.public_id !== public_id));
            } else {
                alert("Failed to delete image.");
            }
        } catch {
            alert("Network error.");
        } finally {
            setDeleting(null);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="font-headline text-3xl font-black text-mamen-white">
                    Media Library
                </h1>
                <button
                    onClick={fetchImages}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-mamen-gray-700 text-mamen-gray-200 hover:text-mamen-white hover:border-mamen-gray-600 text-xs font-headline uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Quick Upload Area */}
            <div className="mb-8 p-6 bg-mamen-black border-2 border-mamen-gray-800">
                <p className="text-xs font-headline uppercase tracking-wider text-mamen-gray-200 mb-3">
                    Upload New Image
                </p>
                <div className="max-w-xl">
                    <ImageUploader
                        value={uploadedUrl}
                        onChange={handleNewUpload}
                        folder="mamen"
                        aspect="16/6"
                    />
                </div>
                {uploadedUrl && (
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            readOnly
                            value={uploadedUrl}
                            className="flex-1 px-3 py-2 bg-mamen-gray-800 border border-mamen-gray-700 text-mamen-gray-200 text-xs font-mono"
                        />
                        <button
                            onClick={() => handleCopy(uploadedUrl)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-mamen-purple text-white text-xs font-bold cursor-pointer"
                        >
                            {copied === uploadedUrl ? <Check size={12} /> : <Copy size={12} />}
                            {copied === uploadedUrl ? "Copied!" : "Copy URL"}
                        </button>
                    </div>
                )}
            </div>

            {/* Image Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-mamen-purple" size={36} />
                </div>
            ) : images.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-mamen-gray-800">
                    <Upload className="mx-auto text-mamen-gray-700 mb-3" size={36} />
                    <p className="text-mamen-gray-700 font-headline text-lg">
                        No images uploaded yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {images.map((img) => (
                        <div
                            key={img.public_id}
                            className="group relative bg-mamen-black border border-mamen-gray-800 overflow-hidden"
                        >
                            {/* Thumbnail */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`${img.secure_url.replace("/upload/", "/upload/w_400,h_260,c_fill,q_auto,f_auto/")}`}
                                alt={img.public_id}
                                className="w-full aspect-video object-cover"
                                loading="lazy"
                            />

                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/70 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex justify-end gap-1">
                                    <button
                                        onClick={() => handleCopy(img.secure_url)}
                                        className="p-1.5 bg-mamen-gray-800 text-mamen-white hover:bg-mamen-purple transition-colors cursor-pointer rounded"
                                        title="Copy URL"
                                    >
                                        {copied === img.secure_url ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(img.public_id)}
                                        disabled={deleting === img.public_id}
                                        className="p-1.5 bg-mamen-gray-800 text-mamen-white hover:bg-red-600 transition-colors cursor-pointer rounded disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {deleting === img.public_id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={12} />
                                        )}
                                    </button>
                                </div>
                                <div>
                                    <p className="text-white text-xs font-mono truncate">
                                        {img.public_id.split("/").pop()}
                                    </p>
                                    <p className="text-mamen-gray-400 text-xs mt-0.5">
                                        {img.width}×{img.height} · {formatBytes(img.bytes)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
