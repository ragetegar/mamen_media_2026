"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      // Register the service worker after page load to prevent blocking the main thread
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("MAMEN PWA: ServiceWorker registered successfully with scope: ", registration.scope);
          })
          .catch((error) => {
            console.error("MAMEN PWA: ServiceWorker registration failed: ", error);
          });
      });
    }
  }, []);

  return null;
}
