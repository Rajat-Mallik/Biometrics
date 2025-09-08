
const CACHE_NAME = 'punch-v1';
const FILES = ['/', '/index.html', '/css/style.css', '/js/app.js', '/manifest.json', '/assets/fingerprint.svg'];
self.addEventListener('install', evt => { evt.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', evt => { evt.waitUntil(clients.claim()); });
self.addEventListener('fetch', evt => { evt.respondWith(caches.match(evt.request).then(resp=>resp||fetch(evt.request))); });
