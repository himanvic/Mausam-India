// Mausam India — Progressive Web App Service Worker
const CACHE_NAME = "mausam-india-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./manifest.json",
  "./assets/mausam-logo.svg",
  "./vendor/leaflet/leaflet.css",
  "./vendor/leaflet/leaflet.js",
  "./vendor/three/three.min.js"
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

  // Let all dynamic weather & map API requests bypass service worker cache
  if (
    url.includes("/api/") ||
    url.includes("open-meteo.com") ||
    url.includes("openaq.org") ||
    url.includes("rainviewer.com") ||
    url.includes("nominatim.openstreetmap.org") ||
    url.includes("tile.openstreetmap.org") ||
    url.includes("earthdata.nasa.gov")
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

  // Stale-while-revalidate / cache-first for static local assets
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
