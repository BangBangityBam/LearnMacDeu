const CACHE_NAME = 'vt-app-v149';
const APP_SHELL = ['./', './index.html', './vocabulary.js?v=149', './learning-courses.js?v=149', './storage.js?v=145', './dialect-atlas.js?v=146', './dialect-localities.js?v=148', './dialects.js?v=148', './study.js?v=145', './learning-tools.js?v=148', './trades.js', './category-vocabulary.js?v=49', './interface.js?v=145', './practice.js?v=147', './manifest.webmanifest', './icon-192.png?v=43', './icon-512.png?v=43'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL.map(path => new Request(new URL(path, self.location.href), { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('vt-app-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if(url.pathname===new URL('./release.json',self.location.href).pathname)return;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
        }
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener('message',event=>{
  if(event.data?.type==='release-version' && event.ports[0])event.ports[0].postMessage({version:Number(CACHE_NAME.split('-v')[1])});
});
