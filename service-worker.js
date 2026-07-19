const CACHE_NAME = 'auracraft-cache-v8';
const ASSETS_TO_CACHE = [
  './',
  './style.css',
  './script.js',
  './manifest.json',
  './offline.html',
  './duitnow-qr.jpg',
  './images/portfolio-hartanah.jpg',
  './images/portfolio-shahreno.jpg',
  './images/portfolio-kwikezeereno.jpg',
  './images/portfolio-cctv.jpg',
  './images/portfolio-cleaning.jpg',
  './images/portfolio-kekpisang.jpg',
  './images/portfolio-surau.jpg',
  './images/portfolio-misipintar.jpg',
  './images/portfolio-dlekir.jpg',
  './images/portfolio-telekung.jpg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install Event - Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Handle HTML document navigation with Network First strategy
  if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request).then((response) => {
            return response || caches.match('./offline.html');
          });
        })
    );
    return;
  }

  // Cache First for static assets (CSS, JS, images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      });
    })
  );
});
