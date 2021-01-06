//service worker allows for offline caching of the website and other enhanced browser features,
//this file must be at the root of the site to have proper scope access to other files

const cacheName = "Offline-Store_v0.1";

// Cache all the files to make a PWA
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json",
        "./js/app.js",
        "./css/normalize.css",
        "./css/skeleton.css",
        "./images/favicon.ico",
      ]);
    })
  );
});

//try to serve from cache by default during any fetch event, attempt to update from network if available
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
