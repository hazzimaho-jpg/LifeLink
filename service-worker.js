const CACHE_NAME = "lifelink-cache-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/services.html",
  "/provider.html",
  "/map.html",
  "/healthcare.html",
  "/alerts.html",
  "/profile.html",
  "/become-provider.html",
  "/login.html",
  "/admin-login.html",
  "/admin.html",
  "/css/style.css",
  "/js/app.js",
  "/js/chatbot.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Network-first for API-like/external calls, cache-first for app shell
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
