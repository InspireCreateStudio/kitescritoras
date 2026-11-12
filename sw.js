// Kit Escritoras — funciona sin conexión.
// Sirve los archivos guardados y, si hay internet, se trae la versión nueva para la próxima vez.
// Cuando cambies app.js o app.css, sube también este archivo cambiando VERSION (ks-v4, ks-v5…).
const VERSION = 'ks-v14';
const ARCHIVOS = ['./', './index.html', './version.js', './app.css', './app.js', './manifest.webmanifest', './32.png', './180.png', './192.png', './512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const guardada = await c.match(e.request, { ignoreSearch: true });
    const red = fetch(e.request, { cache: 'no-cache' }).then(r => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return guardada || (await red) || c.match('./index.html');
  }));
});
