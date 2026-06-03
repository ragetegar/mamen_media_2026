"use client";

import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, Link as LinkIcon, Loader2, X, Check } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface Props {
    value?: string;
    onChange: (url: string) => void;
    folder?: string;
    aspect?: string;
}

export default function MediaSelector({
    value,
    onChange,
    folder = "mamen",
    aspect = "16/9",
}: Props) {
    const [tab, setTab] = useState<"upload" | "gallery" | "url">("upload");
    const [galleryImages, setGalleryImages] = useState<any[]>([]);
    const [loadingGallery, setLoadingGallery] = useState(false);
    const [urlInput, setUrlInput] = useState("");

    // Load gallery on tab switch
    useEffect(() => {
        if (tab === "gallery" && galleryImages.length === 0) {
            setLoadingGallery(true);
            fetch("/api/cloudinary/list")
                .then((res) => res.json())
                .then((data) => {
                    if (data.images) setGalleryImages(data.images);
                })
                .catch((err) => console.error("Gallery fetch error:", err))
                .finally(() => setLoadingGallery(false));
        }
    }, [tab]);

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
            setUrlInput("");
        }
    };

    const handleClear = () => {
        onChange("");
    };

    const tabClasses = (currentTab: string) =>
        `flex-1 py-2 text-xs font-headline font-bold uppercase tracking-wider text-center transition-colors cursor-pointer border-b-2 ${tab === currentTab
            ? "border-mamen-purple text-mamen-white bg-mamen-gray-800"
            : "border-transparent text-mamen-gray-400 hover:text-mamen-gray-200 hover:bg-mamen-gray-800/50"
        }`;

    return (
        <div className="border-2 border-mamen-gray-700 bg-mamen-gray-900 rounded-sm overflow-hidden">
            {/* Header Tabs */}
            <div className="flex bg-mamen-black border-b border-mamen-gray-800">
                <button
                    type="button"
                    onClick={() => setTab("upload")}
                    className={tabClasses("upload")}
                >
                    <div className="flex items-center justify-center gap-1.5">
                        <Upload size={14} /> Upload
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setTab("gallery")}
                    className={tabClasses("gallery")}
                >
                    <div className="flex items-center justify-center gap-1.5">
                        <ImageIcon size={14} /> Gallery
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setTab("url")}
                    className={tabClasses("url")}
                >
                    <div className="flex items-center justify-center gap-1.5">
                        <LinkIcon size={14} /> Link
                    </div>
                </button>
            </div>

            {/* Selection Area */}
            <div className="p-3 bg-mamen-gray-900">
                {/* Active Selection Preview Wrapper */}
                {value ? (
                    <div className="relative border-2 border-mamen-magenta bg-mamen-gray-800 mb-2 overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Selected media"
                            className="w-full object-cover"
                            style={{ aspectRatio: aspect }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs font-headline uppercase tracking-wider cursor-pointer"
                            >
                                <X size={14} /> Remove Image
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[160px]">
                        {/* Upload Tab */}
                        {tab === "upload" && (
                            <ImageUploader
                                value={value}
                                onChange={onChange}
                                folder={folder}
                                aspect={aspect}
                            />
                        )}

                        {/* Gallery Tab */}
                        {tab === "gallery" && (
                            <div className="h-64 overflow-y-auto pr-1">
                                {loadingGallery ? (
                                    <div className="flex flex-col items-center justify-center h-full text-mamen-gray-400">
                                        <Loader2 size={24} className="animate-spin mb-2 text-mamen-purple" />
                                        <span className="text-xs uppercase tracking-wider font-headline">Loading gallery...</span>
                                    </div>
                                ) : galleryImages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-mamen-gray-400 text-xs uppercase tracking-wider font-headline">
                                        No images found
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {galleryImages.map((img: any) => (
                                            <button
                                                key={img.public_id || img.secure_url}
                                                type="button"
                                                onClick={() => onChange(img.secure_url)}
                                                className="relative border border-mamen-gray-700 hover:border-mamen-purple overflow-hidden group aspect-video bg-mamen-black cursor-pointer"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={img.secure_url}
                                                    alt="Gallery thumbnail"
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                                    <span className="text-[9px] text-mamen-gray-400 truncate block">
                                                        {img.format ? `.${img.format}` : ""} {img.width}x{img.height}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* URL Tab */}
                        {tab === "url" && (
                            <div className="flex flex-col gap-3 py-4">
                                <p className="text-xs text-mamen-gray-400 font-headline uppercase tracking-wider">
                                    Paste direct image link
                                </p>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        placeholder="https://example.com/image.jpg"
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUrlSubmit())}
                                        className="flex-1 px-3 py-2 bg-mamen-gray-800 border-2 border-mamen-gray-700 text-mamen-white text-sm focus:outline-none focus:border-mamen-purple"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleUrlSubmit}
                                        disabled={!urlInput.trim()}
                                        className="px-4 bg-mamen-purple text-white font-headline font-bold text-xs uppercase tracking-wider hover:bg-mamen-magenta transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                                    >
                                        <Check size={14} /> Set
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
