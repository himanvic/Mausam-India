// Mausam India — Progressive Web App Service Worker
const CACHE_NAME = "mausam-india-v2";
const ASSETS_TO_CACHE = [
  "./manifest.json",
  "./assets/mausam-logo.svg"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;

  // Let all API requests bypass service worker cache
  if (
    url.includes("/api/") ||
    url.includes("open-meteo.com") ||
    url.includes("openaq.org") ||
    url.includes("rainviewer.com") ||
    url.includes("nominatim.openstreetmap.org")
  ) {
    return;
  }

  // Network-first strategy for navigation / HTML document
  if (e.request.mode === "navigate" || url.endsWith(".html") || url.endsWith("/")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  // Stale-while-revalidate / cache-first for static icons & manifest
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
