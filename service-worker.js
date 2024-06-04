const CACHE_NAME = 'offline-cache'+'2.0';
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/code-area.js',
  './js/code-run.js',
  './js/offline-manage.js',
  './js/file-manager.js',
  './assets/add-file.svg',
  './assets/file-upload.svg',
  './icon-192x192.png',
  './icon-512x512.png',
  './favicon.ico',
  './service-worker.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
      caches.keys().then((cacheNames) => {
          return Promise.all(
              cacheNames.map((cacheName) => {
                  if (!cacheWhitelist.includes(cacheName)) {
                      return caches.delete(cacheName);
                  }
              })
          );
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
