const CACHE = 'faltrapport-v1'; // höj numret när filerna ändras
const FILER = ['./', 'index.html', 'app.js', 'falt.js', 'export.js', 'manifest.webmanifest', 'ikon.svg', 'ikon-192.png', 'ikon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILER)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request).catch(() => caches.match('index.html'))));
});
