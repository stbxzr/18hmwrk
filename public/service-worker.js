// const PRECACHE = "precache-v1";
// const RUNTIME = "runtime";
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/styles.css",
  "/manifest.json",
  "/db.js",
  "icons/icon-192x192.png",
  "icons/icon-512x512.png",
];

// install
self.addEventListener("install", function (evt) {
  // pre cache image data
  evt.waitUntil(
    caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/transaction"))
  );
    
  // pre cache all static assets
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );

  // tell the browser to activate this service worker immediately once it
  // has finished installing
  self.skipWaiting();
});

// self.addEventListener("install", (event) => {
//   event.waitUntil(
//     caches
//       .open(PRECACHE)
//       .then((cache) => cache.addAll(FILES_TO_CACHE))
//       .then(self.skipWaiting())
//   );
// });

// self.addEventListener("fetch", (event) => {
//   if (event.request.url.startsWith("/api/transaction")) {
//     event.respondWith(
//       caches.match(event.request).then((cachedResponse) => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }

//         return caches.open(RUNTIME).then((cache) => {
//           return fetch(event.request).then((response) => {
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   }
// });

// fetch
self.addEventListener("fetch", function(evt) {
  if (evt.request.url.includes("/api/transaction")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // If the response was good, clone it and store it in the cache.
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }

            return response;
          })
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(evt.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(evt.request).then(response => {
        return response || fetch(evt.request);
      });
    })
  );
});

// activate
self.addEventListener("activate", function(evt) {
  evt.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});

// ACTIVATE //
//   // The activate handler takes care of cleaning up old caches.
//   self.addEventListener('activate', (event) => {
//     const currentCaches = [PRECACHE, RUNTIME];
//     event.waitUntil(
//       caches
//         .keys()
//         .then((cacheNames) => {
//           return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
//         })
//         .then((cachesToDelete) => {
//           return Promise.all(
//             cachesToDelete.map((cacheToDelete) => {
//               return caches.delete(cacheToDelete);
//             })
//           );
//         })
//         .then(() => self.clients.claim())
//     );
//   });
