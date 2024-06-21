const CACHE_NAME = 'offline-cache'+'2.0';
const urlsToCache = [
  './',
  './index.html',
  './register.html',
  './authentication.html',
  './output.html',
  './css/styles.css',
  './css/authentication.css',
  './css/bottom-window.css',
  './css/my-code.css',
  './css/top-bar.css',
  './css/util.css',

  './js/authentication.js',
  './js/bottom-window.js',
  './js/code-format.js',
  './js/code-manage.js',
  './js/eruda.min.js',
  './js/firebaseService.js',
  './js/jszip.min.js',
  './js/offline-manage.js',
  './js/output.js',
  './js/register.js',
  './js/shared-data.js',
  './js/store-offline.js',
  './js/store-online.js',
  './js/top-bar.js',


  './assets/add-file.svg',
  './assets/arrow-maximize.svg',
  '.assets/code-editor-run.svg',
  '.assets/code.svg',
  './assets/dark-theme.svg',
  './assets/file-add.svg',
  './assets/file-upload.svg',
  '.assets/icon-192x192.png',
  '.assets/icon-512x512.png',
  '.assets/line-horizontal-3.svg',
  '.assets/more-vertical.svg',
  '.assets/person-team.svg',
  '.assets/person-circle.svg',
  '.assets/question-circle.svg',
  './assets/search.svg',
  './assets/send.svg',

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
