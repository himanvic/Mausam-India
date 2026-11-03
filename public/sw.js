// Mausam India — Progressive Web App Service Worker
const CACHE_NAME = "mausam-india-v6";
const TILE_CACHE = "mausam-tiles-v1";
const MAX_TILE_AGE_MS = 24 * 60 * 60 * 1000; // 24-hour maximum retention for map & radar tiles
const MAX_TILES_LIMIT = 60; // Max tiles capped to guarantee < 10MB storage footprint

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
  "./vendor/three/three.min.js",
  "./aqi-worker.js",
  "./widget.html",
  "./widget-view.js",
  "./widget.js",
  "./widgets/card-template.json",
  "./widgets/widget-data.json",
  "./.well-known/assetlinks.json"
];

// Helper: Prune tile cache entries older than 24 hours or exceeding size cap
async function pruneTileCache() {
  try {
    const cache = await caches.open(TILE_CACHE);
    const requests = await cache.keys();
    const now = Date.now();

    // Distinguish tile requests from companion metadata
    const tileRequests = requests.filter((r) => !r.url.includes("#sw-meta"));

    // 1. Delete tiles older than 24 hours based on companion metadata
    for (const req of tileRequests) {
      const metaReq = new Request(req.url + "#sw-meta");
      const metaRes = await cache.match(metaReq);
      let isExpired = false;
      if (metaRes) {
        try {
          const meta = await metaRes.json();
          if (now - meta.timestamp > MAX_TILE_AGE_MS) isExpired = true;
        } catch {
          isExpired = true;
        }
      } else {
        // If no metadata exists, assume expired
        isExpired = true;
      }
      if (isExpired) {
        await cache.delete(req);
        await cache.delete(metaReq);
      }
    }

    // 2. Enforce FIFO cap so total tiles never exceed MAX_TILES_LIMIT (strictly < 10MB)
    const remainingRequests = await cache.keys();
    const remainingTiles = remainingRequests.filter((r) => !r.url.includes("#sw-meta"));
    if (remainingTiles.length > MAX_TILES_LIMIT) {
      const excess = remainingTiles.slice(0, remainingTiles.length - MAX_TILES_LIMIT);
      for (const oldReq of excess) {
        await cache.delete(oldReq);
        await cache.delete(new Request(oldReq.url + "#sw-meta"));
      }
    }
  } catch (e) {
    // Silently continue if cache operations are throttled
  }
}

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== TILE_CACHE)
          .map((k) => caches.delete(k))
      )
    )
    .then(() => pruneTileCache())
    .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "PRUNE_CACHE") {
    e.waitUntil(pruneTileCache());
  }
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = e.request.url;

  // Let all dynamic live weather & AQI numeric APIs bypass service worker cache
  if (
    url.includes("/api/") ||
    url.includes("open-meteo.com") ||
    url.includes("openaq.org") ||
    url.includes("nominatim.openstreetmap.org")
  ) {
    return;
  }

  // Map & Radar Tiles (OpenStreetMap, RainViewer Doppler radar, NASA GIBS satellite):
  // Stale-while-revalidate / cache-first with 24h expiration & cap
  const isTile =
    url.includes("tile.openstreetmap.org") ||
    url.includes("rainviewer.com") ||
    url.includes("earthdata.nasa.gov");

  if (isTile) {
    e.respondWith(
      caches.open(TILE_CACHE).then(async (cache) => {
        const cached = await cache.match(e.request);
        const metaRes = await cache.match(new Request(url + "#sw-meta"));
        let isFresh = false;
        if (cached && metaRes) {
          try {
            const meta = await metaRes.json();
            if (Date.now() - meta.timestamp < MAX_TILE_AGE_MS) {
              isFresh = true;
            }
          } catch {
            isFresh = false;
          }
        }

        if (isFresh && cached) {
          return cached;
        }

        // Fetch fresh tile, cache it with timestamp, prune occasionally
        return fetch(e.request)
          .then((networkRes) => {
            if (networkRes && (networkRes.status === 200 || networkRes.type === "opaque")) {
              const clone = networkRes.clone();
              cache.put(e.request, clone).catch(() => {});
              cache.put(
                new Request(url + "#sw-meta"),
                new Response(JSON.stringify({ timestamp: Date.now() }), {
                  headers: { "content-type": "application/json" }
                })
              ).catch(() => {});

              // Periodic background prune (1 in 10 requests)
              if (Math.random() < 0.1) {
                pruneTileCache();
              }
            }
            return networkRes;
          })
          .catch(() => cached || Response.error());
      })
    );
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

// Windows 11 PWA Widgets Board Lifecycle Event Handlers (Win + W)
self.addEventListener("widgetinstall", (e) => {
  e.waitUntil(
    (async () => {
      if (self.widgets && e.widget) {
        try {
          const template = await (await fetch("./widgets/card-template.json")).text();
          const data = await (await fetch("./widgets/widget-data.json")).text();
          await self.widgets.updateByTag(e.widget.tag, { template, data });
        } catch (_) {}
      }
    })()
  );
});

self.addEventListener("widgetresume", (e) => {
  e.waitUntil(
    (async () => {
      if (self.widgets && e.widget) {
        try {
          const template = await (await fetch("./widgets/card-template.json")).text();
          const data = await (await fetch("./widgets/widget-data.json")).text();
          await self.widgets.updateByTag(e.widget.tag, { template, data });
        } catch (_) {}
      }
    })()
  );
});

self.addEventListener("widgetclick", (e) => {
  if (e.action === "open_app" || !e.action) {
    e.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          if (client.url && "focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow("./index.html");
      })
    );
  }
});
