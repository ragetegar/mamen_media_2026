"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface Props {
    /** Current image URL (if any). Displayed as preview. */
    value?: string;
    /** Called with the new Cloudinary URL after a successful upload. */
    onChange: (url: string) => void;
    /** Cloudinary folder to upload into. Defaults to "mamen". */
    folder?: string;
    /** Aspect-ratio hint for the preview box, e.g. "16/9" or "1/1". Default "16/9". */
    aspect?: string;
}

export default function ImageUploader({
    value,
    onChange,
    folder = "mamen",
    aspect = "16/9",
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file.");
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setError("File is too large (max 20 MB).");
            return;
        }

        setError(null);
        setLoading(true);
        setProgress(10);

        try {
            // Step 1: get signed params from our server
            const signRes = await fetch("/api/cloudinary/sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ folder }),
            });
            if (!signRes.ok) throw new Error("Failed to get upload signature.");
            const { signature, timestamp, apiKey, cloudName } = await signRes.json();

            setProgress(30);

            // Step 2: upload directly to Cloudinary
            const form = new FormData();
            form.append("file", file);
            form.append("api_key", apiKey);
            form.append("timestamp", String(timestamp));
            form.append("signature", signature);
            form.append("folder", folder);

            const xhr = new XMLHttpRequest();
            xhr.open(
                "POST",
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
            );

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const pct = 30 + Math.round((e.loaded / e.total) * 60);
                    setProgress(pct);
                }
            };

            const uploadResult = await new Promise<any>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    } else {
                        reject(new Error("Upload failed: " + xhr.responseText));
                    }
                };
                xhr.onerror = () => reject(new Error("Network error during upload."));
                xhr.send(form);
            });

            setProgress(100);
            onChange(uploadResult.secure_url);
        } catch (err: any) {
            setError(err.message ?? "Upload failed.");
        } finally {
            setLoading(false);
            setTimeout(() => setProgress(0), 600);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleClear = () => {
        onChange("");
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="space-y-2">
            {/* Preview or drop zone */}
            <div
                className={`relative border-2 transition-colors overflow-hidden cursor-pointer ${dragOver
                        ? "border-mamen-lime bg-mamen-lime/5"
                        : value
                            ? "border-mamen-gray-700"
                            : "border-dashed border-mamen-gray-700 hover:border-mamen-purple bg-mamen-gray-800/50"
                    }`}
                style={{ aspectRatio: aspect }}
                onClick={() => !loading && !value && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {value ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover"
                        />
                        {/* Clear button */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleClear(); }}
                            className="absolute top-2 right-2 bg-black/70 rounded-full p-1 text-white hover:bg-black transition-colors"
                            title="Remove image"
                        >
                            <X size={14} />
                        </button>
                        {/* Replace button overlay */}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                            className="absolute bottom-2 right-2 flex items-center gap-1.5 px-3 py-1.5 bg-black/70 text-white text-xs font-bold hover:bg-black transition-colors"
                        >
                            <Upload size={12} /> Replace
                        </button>
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-mamen-gray-700">
                        {loading ? (
                            <Loader2 size={28} className="animate-spin text-mamen-purple" />
                        ) : (
                            <>
                                <ImageIcon size={28} />
                                <span className="text-xs font-headline tracking-wider uppercase">
                                    {dragOver ? "Drop to upload" : "Click or drag to upload"}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {/* Progress bar */}
                {loading && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-mamen-gray-800">
                        <div
                            className="h-full bg-mamen-lime transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            {error && (
                <p className="text-red-400 text-xs">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                }}
            />
        </div>
    );
}
