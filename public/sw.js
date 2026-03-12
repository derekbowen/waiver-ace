// Service Worker for offline-capable signing pages
const CACHE_NAME = "rw-offline-v1";
const OFFLINE_URLS = [
  "/offline.html",
];

// Pre-cache the offline fallback
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy for signing pages, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // For signing pages (/sign/*), try network first, fall back to cache
  if (url.pathname.startsWith("/sign/") || url.pathname.startsWith("/waiver/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses for offline use
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  // For static assets (js, css, images), cache-first
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
      )
    );
    return;
  }
});

// Queue signed waivers for sync when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-waivers") {
    event.waitUntil(syncPendingWaivers());
  }
});

async function syncPendingWaivers() {
  // Retrieve pending waivers from IndexedDB and POST them
  // This is a placeholder — the actual implementation would
  // store waiver data in IndexedDB when offline and sync here
  console.log("[SW] Syncing pending waivers...");
}
