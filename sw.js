// Estadística Senior CBA — funcionamiento sin conexión
var CACHE = "senior-cba-v6";
var FILES = ["./", "index.html", "sync.js", "manifest.webmanifest", "icons/cba-192.png", "icons/cba-512.png", "icons/cba-touch-180.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k.indexOf("alevin-a-") === 0 && k.indexOf("senior-cba-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Red primero (para recibir actualizaciones); si no hay conexión, copia guardada.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, new URL(e.request.url).origin === location.origin ? { cache: "no-cache" } : {}).then(function (r) {
      if (r && r.ok && new URL(e.request.url).origin === location.origin) {
        var copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return r;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match("index.html"); });
    })
  );
});
