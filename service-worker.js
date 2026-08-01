'use strict';

// Network-first keeps a deployed portfolio fresh while the cached response
// remains available whenever the device is offline.
const CACHE_NAME = 'malkit-portfolio-v1';
const APP_SHELL = [
  './',
  './index.html',
  './about.html',
  './projects.html',
  './skills.html',
  './experience.html',
  './certificates.html',
  './contact.html',
  './style.css',
  './main.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './malkit.jpeg',
  './image.png',
  './image%20copy.png',
  './ml.png',
  './resume.pdf',
  './claude.pdf',
  './deloit.pdf',
  './forage.pdf',
  './NkaC7knWtjSbi6aYv_32A6DqtsbF7LbKdcq_69c11970ed907290e0159dcd_1774437064419_completion_certificate%20(1).pdf'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('malkit-portfolio-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Cache successful same-origin responses and opaque CDN image/font responses.
    if (response.ok || response.type === 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    if (request.mode === 'navigate') {
      return (await caches.match('./index.html')) || Response.error();
    }

    return Response.error();
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // Pages and local files are cached. Cross-origin images, styles, fonts, and
  // media used by the portfolio are cached after their first successful load.
  const cacheableDestinations = ['style', 'script', 'image', 'font', 'video', 'audio'];
  if (
    request.mode === 'navigate' ||
    request.url.startsWith(self.location.origin) ||
    cacheableDestinations.includes(request.destination)
  ) {
    event.respondWith(networkFirst(request));
  }
});
