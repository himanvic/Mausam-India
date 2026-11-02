// Mausam India — Progressive Web App Service Worker
const CACHE_NAME = "mausam-india-v4";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./404.html",
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

// Native Notification Interaction Handler
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const targetUrl = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Push Notification Receiver
self.addEventListener("push", (e) => {
  let payload = {
    title: "Mausam India Alert",
    body: "Significant weather or air quality update.",
    tag: "mausam-hazard",
    data: { url: "./" }
  };
  if (e.data) {
    try {
      const json = e.data.json();
      payload = Object.assign(payload, json);
    } catch {
      payload.body = e.data.text();
    }
  }
  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "./assets/mausam-logo.svg",
      badge: "./assets/mausam-logo.svg",
      tag: payload.tag || "mausam-hazard",
      renotify: true,
      vibrate: [200, 100, 200],
      data: payload.data
    })
  );
});
