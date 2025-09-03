const CACHE_NAME = 'openmanus-pwa-v1';
const ASSETS = [
  'index.html',
  'script.js',
  'manifest.webmanifest',
  'assets/logo.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => {
        const fetchPromise = fetch(request)
          .then(response => {
            if (response && response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached || (url.pathname.endsWith('/') ? caches.match('index.html') : undefined));
        return cached || fetchPromise;
      })
    );
  } else {
    event.respondWith(
      fetch(request).catch(() => caches.match('index.html'))
    );
  }
});
