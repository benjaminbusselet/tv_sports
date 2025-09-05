// TV Sports - Service Worker basique
// Version minimaliste pour éviter les erreurs console

const CACHE_NAME = "tv-sports-v1";
const urlsToCache = ["/tv_sports/", "/tv_sports/manifest.webmanifest"];

// Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((error) => console.log("Cache install failed:", error))
  );
});

// Activation
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
});

// Fetch - stratégie network-first pour les données JSON
self.addEventListener("fetch", (event) => {
  // Laisser passer les requêtes normalement pour l'instant
  return;
});
