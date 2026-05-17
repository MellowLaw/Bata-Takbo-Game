// Service Worker — Bata, Takbo!
// Network-first strategy — always serve fresh assets, cache only as offline fallback

const CACHE_NAME = 'bata-takbo-v7';

// Install — activate immediately, no pre-caching
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate — wipe ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass for dev/tunnel hosts
  if (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.endsWith('.ngrok-free.app') ||
    url.hostname.endsWith('.ngrok-free.dev') ||
    url.hostname.endsWith('.ngrok.io')
  ) return;

  // Bypass for Firebase / Google APIs
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) return;

  // Bypass API routes — always fetch live
  if (['/auth', '/api', '/leaderboard', '/admin'].some(p => url.pathname.startsWith(p))) return;

  // HTML pages — network first (always get latest app shell)
  if (url.pathname === '/' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Assets (images, fonts, audio, JS, CSS) — stale-while-revalidate:
  // Serve cache instantly for speed, fetch fresh in background to update cache.
  // On cache miss, fetch from network normally.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
        // Return cached instantly if available, otherwise wait for network
        return cached || fetchPromise;
      })
    )
  );
});
