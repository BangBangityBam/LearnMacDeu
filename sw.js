const CACHE_NAME = 'vt-app-v48';
const APP_SHELL = ['./', './index.html', './vocabulary.js', './learning-courses.js', './storage.js?v=45', './study.js?v=47', './learning-tools.js?v=48', './trades.js', './category-vocabulary.js?v=48', './interface.js?v=42', './practice.js?v=42', './manifest.webmanifest', './icon-192.png?v=43', './icon-512.png?v=43'];

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
