const CACHE = 'faltrapport-v8'; // höj numret när filerna ändras
const FILER = ['./', 'index.html', 'app.js', 'falt.js', 'export.js', 'manifest.webmanifest', 'ikon.svg', 'ikon-192.png', 'ikon-512.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILER)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Nätet först (så en ny version syns direkt), cachen bara offline.
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const k = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
});
