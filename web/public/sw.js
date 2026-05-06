// Service Worker — Bata, Takbo!
// Basic cache-first strategy for game assets

const CACHE_NAME = 'bata-takbo-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/ui/main-title.png',
  '/assets/ui/chapter-selection/chapter1.png',
  '/assets/ui/chapter-selection/chapter2.png',
  '/assets/ui/chapter-selection/chapter3.png',
  '/assets/fonts/VCRosdNEUE.ttf',
  '/assets/fonts/DirtyHarold.ttf',
  '/assets/ui/game-ui/buttons.png',
  '/assets/ui/game-ui/gui-sprite.png',
];

// Install — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — cache first for assets, network first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // DEV MODE BYPASS: Never intercept requests on Localhost so live-reloading works flawlessly
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Network only for Firebase API calls
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache first for static assets
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        }))
    );
    return;
  }

  // Stale while revalidate for everything else
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetched = fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        });
        return cached || fetched;
      })
  );
});
