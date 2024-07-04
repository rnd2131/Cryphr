importScripts('/dynamic/dynamic.config.js');
importScripts('/dynamic/dynamic.worker.js');

importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts(__uv$config.sw || '/uv/uv.sw.js');

const sw = new UVServiceWorker();
const dynamic = new Dynamic();

const cacheName = 'v1';
const cacheAssets = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/images/image.jpg',
  '/news.html',
  '/newsSR.html'
];

// Install Event
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName)
      .then(cache => {
        console.log('Caching files');
        return cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', e => {
  // Remove old caches
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Event
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

self.dynamic = dynamic;

self.addEventListener('fetch', event => {
	if (
		event.request.url.startsWith(
			location.origin + self.__dynamic$config.prefix
		)
	) {
		event.respondWith(
			(async function () {
				if (await dynamic.route(event)) {
					return await dynamic.fetch(event);
				}

				return await fetch(event.request);
			})()
		);
	} else if (
		event.request.url.startsWith(location.origin + __uv$config.prefix)
	) {
		event.respondWith(sw.fetch(event));
	}
});
