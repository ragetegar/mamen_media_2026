"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { CSSProperties } from "react";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const EXCLUDED_AD_PATHS = [
    "/profile",
    "/barengan",
    "/admin",
    "/messages",
    "/setup-profile",
    "/auth",
    "/offline",
];

type AdPlacement = "feed" | "article" | "rail";

const adSlots: Record<AdPlacement, string | undefined> = {
    feed: process.env.NEXT_PUBLIC_ADSENSE_FEED_SLOT || process.env.NEXT_PUBLIC_ADSENSE_SLOT,
    article: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || process.env.NEXT_PUBLIC_ADSENSE_SLOT,
    rail: process.env.NEXT_PUBLIC_ADSENSE_RAIL_SLOT || process.env.NEXT_PUBLIC_ADSENSE_SLOT,
};

declare global {
    interface Window {
        adsbygoogle?: unknown[];
    }
}

function isAdsExcluded(pathname: string | null) {
    if (!pathname) return false;
    return EXCLUDED_AD_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function GoogleAdsenseScript() {
    const pathname = usePathname();

    if (!ADSENSE_CLIENT || isAdsExcluded(pathname)) return null;

    return (
        <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}

interface GoogleAdUnitProps {
    placement: AdPlacement;
    className?: string;
    format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
    style?: CSSProperties;
}

export function GoogleAdUnit({
    placement,
    className = "",
    format = "auto",
    style,
}: GoogleAdUnitProps) {
    const pathname = usePathname();
    const slot = adSlots[placement];

    useEffect(() => {
        if (!ADSENSE_CLIENT || !slot || isAdsExcluded(pathname)) return;

        try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch {
            // Ad blockers and duplicate initializations can throw here.
        }
    }, [pathname, slot]);

    if (!ADSENSE_CLIENT || !slot || isAdsExcluded(pathname)) return null;

    return (
        <aside
            className={`relative overflow-hidden border border-mamen-gray-800 bg-mamen-gray-900/65 ${className}`}
            aria-label="Sponsored"
        >
            <span className="absolute left-3 top-2 z-10 font-headline text-[10px] font-bold uppercase text-mamen-gray-700">
                Sponsored
            </span>
            <ins
                className="adsbygoogle block min-h-[120px] pt-6"
                style={{ display: "block", ...style }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </aside>
    );
}
