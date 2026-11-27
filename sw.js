// Despegue: guarda la app en el celular para que abra sin internet
const VERSION = 'despegue-478a9d61d6';
const ASSETS = ["./", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const conTiempo = (p, ms) => new Promise((ok, ko) => {
  const t = setTimeout(() => ko(new Error('tiempo')), ms);
  p.then(v => { clearTimeout(t); ok(v); }, err => { clearTimeout(t); ko(err); });
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    // Primero la red (para recibir capítulos nuevos); sin señal, la copia guardada
    e.respondWith(conTiempo(fetch(r), 5000).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(VERSION).then(c => c.put('./', copia)); }
      return res;
    }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r)));
});
