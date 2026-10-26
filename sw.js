// Service worker do Fiado do Cartão
// - Arquivos do app: tenta a rede primeiro (pega sempre a versão nova) e cai no cache se estiver offline.
// - Bibliotecas versionadas (Firebase SDK, Chart.js): cache primeiro.
// - Chamadas ao Firebase (login e banco) NÃO passam por aqui; o próprio Firestore cuida do modo offline.
const CACHE = 'fiado-v2';
const ARQUIVOS = [
  './',
  './index.html',
  './firebase-config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function guardar(req, res) {
  if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req).then(r => guardar(req, r))
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  const lib = (url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'))
           || url.hostname === 'cdnjs.cloudflare.com';
  if (lib) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => guardar(req, res))));
  }
});
