const CACHE_NAME = 'selflove-v5';
const NOTIFICATION_TIME = '22:30';
const NOTIFICATION_DB = 'selflove-notifications';
const NOTIFICATION_STORE = 'flags';

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

// IndexedDB helper for notification flags
const NotificationDB = {
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(NOTIFICATION_DB, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(NOTIFICATION_STORE)) {
          db.createObjectStore(NOTIFICATION_STORE);
        }
      };
    });
  },

  async getLastNotificationDate() {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTIFICATION_STORE, 'readonly');
      const store = transaction.objectStore(NOTIFICATION_STORE);
      const request = store.get('lastNotification');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async setLastNotificationDate(date) {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(NOTIFICATION_STORE, 'readwrite');
      const store = transaction.objectStore(NOTIFICATION_STORE);
      const request = store.put(date, 'lastNotification');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// Check if notification should be shown
async function checkAndShowNotification() {
  try {
    const now = new Date();
    const [hours, minutes] = NOTIFICATION_TIME.split(':').map(Number);

    // Check if current time is within the notification window (30 minutes)
    const isInNotificationWindow =
      now.getHours() === hours &&
      now.getMinutes() >= minutes &&
      now.getMinutes() < minutes + 30;

    if (!isInNotificationWindow) {
      return; // Not time yet
    }

    const today = now.toISOString().split('T')[0];
    const lastNotification = await NotificationDB.getLastNotificationDate();

    // Only show if we haven't notified today
    if (lastNotification !== today) {
      await self.registration.showNotification("selflove: 新しい物語", {
        body: "レン「やれやれ、新しい物語を書き始めたよ。君の今日の話を聞かせてくれないか？」",
        icon: "/icons/icon-192.png",
        tag: "daily-reminder",
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: {
          url: '/'
        }
      });

      await NotificationDB.setLastNotificationDate(today);
      console.log('[SW] Notification sent for', today);
    }
  } catch (error) {
    console.error('[SW] Notification check failed:', error);
  }
}

// Start periodic notification check
function startNotificationCheck() {
  // Check every 30 seconds
  setInterval(checkAndShowNotification, 30000);

  // Also check immediately on SW activation
  setTimeout(checkAndShowNotification, 1000);
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
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

  // Start notification checking after activation
  startNotificationCheck();
  console.log('[SW] Service Worker activated and notification checking started');
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

// --- Notification Logic ---

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_NOTIFICATION_CHECK') {
    console.log('[SW] Received request to start notification check');
    checkAndShowNotification(); // Check immediately
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window if no existing window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

