const CACHE_NAME = "mamen-pwa-cache-v1";
const OFFLINE_URL = "/offline";

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/apple-icon.png",
];

// Install Event - cache the offline page and essential icons
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - network-first for documents, cache-first/stale-while-revalidate for assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For HTML pages / document navigation, use a network-first strategy
  if (event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, return it
          return response;
        })
        .catch(() => {
          // If network fails, try to return offline page
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For static assets, use cache-first with network fallback (and dynamic caching)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Only cache successful standard GET responses from our own domain
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Cache CSS, JS, fonts, and images on-the-fly
          const contentType = response.headers.get("content-type") || "";
          const isCacheable =
            url.pathname.startsWith("/_next/static/") ||
            contentType.includes("javascript") ||
            contentType.includes("css") ||
            contentType.includes("font") ||
            contentType.includes("image");

          if (isCacheable) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return response;
        })
        .catch(() => {
          // Fallback if network fails and asset is not in cache
          return new Response("Asset offline", { status: 408, headers: { "Content-Type": "text/plain" } });
        })
    })
  );
});
