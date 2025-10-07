// DISABLED Service Worker - Clear all caches and unregister
// This Service Worker was causing stale asset 404s by caching old HTML
// that referenced deleted build chunks (e.g., 65c03398df672208.css)

self.addEventListener('install', (event) => {
  console.log('[SW] Installing - clearing all caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All caches cleared, skipping to activate');
      return self.skipWaiting();
    })
  );
});

// Activate immediately and unregister
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating - clearing all caches and unregistering...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] All caches cleared, taking control of clients');
      return self.clients.claim();
    }).then(() => {
      // Tell all clients to unregister this service worker
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ action: 'unregister' });
        });
      });
    })
  );
});

// Don't cache anything - always fetch from network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
