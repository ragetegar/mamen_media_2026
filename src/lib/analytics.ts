"use client";

type GtagWindow = Window & {
    gtag?: (command: "event", eventName: string, params?: Record<string, unknown>) => void;
};

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    (window as GtagWindow).gtag?.("event", eventName, params);
}
