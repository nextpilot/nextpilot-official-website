/* global self, caches, clients, fetch */
self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('activate', function (e) {
  e.waitUntil(clients.claim())
})

self.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (r) {
      return (
        r ||
        fetch(e.request).then(function (response) {
          return caches.open('v1').then(function (cache) {
            cache.put(e.request, response.clone())
            return response
          })
        })
      )
    }),
  )
})
