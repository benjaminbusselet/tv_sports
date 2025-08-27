// Service Worker pour TV Sports
self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const CACHE = "tv-sports-v1";
const STATIC = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Mise en cache à l'installation
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC)));
});

// Stratégie de cache : Cache First pour les statiques, Network First pour l'API
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Cache First pour les ressources statiques
  if (STATIC.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
    return;
  }

  // Network First pour l'API et autres ressources
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
