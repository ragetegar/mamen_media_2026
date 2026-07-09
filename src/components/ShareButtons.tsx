"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ShareButtonsProps {
    title: string;
    url: string;
    itemType: "article" | "concert";
}

export default function ShareButtons({ title, url, itemType }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const shareText = `${title} ${url}`;

    const trackShare = (channel: string) => {
        trackEvent("share", {
            content_type: itemType,
            method: channel,
            item_url: url,
        });
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            trackShare("copy");
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="flex gap-3 flex-wrap">
            <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackShare("whatsapp")}
                className="px-4 py-2 bg-[#25D366] text-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-black shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
                WhatsApp
            </a>
            <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackShare("x")}
                className="px-4 py-2 bg-mamen-black text-mamen-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-white shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            >
                <span className="flex items-center gap-1.5">
                    <Share2 size={12} /> Post on X
                </span>
            </a>
            <button
                type="button"
                onClick={copyLink}
                className="px-4 py-2 bg-mamen-gray-800 text-mamen-white font-headline text-xs font-bold uppercase tracking-wider border-2 border-mamen-gray-700 shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
                <span className="flex items-center gap-1.5">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied" : "Copy Link"}
                </span>
            </button>
        </div>
    );
}
