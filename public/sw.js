const CACHE_NAME = 'selflove-v4';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/breathe',
  '/chapters',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // addAll fails if any request fails, so use individual adds
      return Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {}) // ignore individual failures
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes — always network
  if (url.pathname.startsWith('/api/')) return;

  // Skip cross-origin requests (fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // For HTML navigation: Network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // For static assets (JS, CSS, images): Cache-first, update in background
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached || networkFetch;
      })
    )
  );
});
