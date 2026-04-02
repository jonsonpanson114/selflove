<<<<<<< HEAD
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (!data) return;
=======
const CACHE_NAME = 'selflove-v5';
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: {
      url: data.url || '/'
    }
  };

<<<<<<< HEAD
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data.url)
=======
// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        PRECACHE_ASSETS.map((url) =>
          cache.add(url).catch(() => {})
        )
      );
    })
  );
});

// Activate event
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
  console.log('[SW] Service Worker activated');
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.startsWith('/api/')) return;
  if (url.origin !== self.location.origin) return;

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
>>>>>>> 9c28ec646ae94ca991f7dd4a35002bfb2cbcdda1
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e);
      return;
    }
  }

  const options = {
    body: data.body || 'レン「新しい物語の時間ですよ」',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'selflove', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
