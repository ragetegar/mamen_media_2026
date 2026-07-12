"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
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

const initializedAds = new WeakSet<HTMLElement>();

function isAdsExcluded(pathname: string | null) {
    if (!pathname) return false;
    return EXCLUDED_AD_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
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
    const adRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        const adElement = adRef.current;
        if (
            !ADSENSE_CLIENT
            || !slot
            || !adElement
            || isAdsExcluded(pathname)
            || initializedAds.has(adElement)
            || adElement.dataset.adsbygoogleStatus
        ) return;

        initializedAds.add(adElement);

        try {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({});
        } catch {
            // Ad blockers can throw while the element remains safe to skip.
        }
    }, [pathname, slot]);

    if (!ADSENSE_CLIENT || !slot || isAdsExcluded(pathname)) return null;

    return (
        <aside
            className={`relative overflow-hidden border border-mamen-gray-800 bg-mamen-gray-900/65 ${className}`}
            aria-label="Advertisement"
        >
            <ins
                ref={adRef}
                className="adsbygoogle block min-h-[120px]"
                style={{ display: "block", ...style }}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </aside>
    );
}
