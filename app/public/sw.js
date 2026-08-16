const CACHE = "mashups-shell-v2"
const SHELL = ["/", "/create", "/discover", "/offline", "/manifest.webmanifest"]
const PRIVATE_PREFIXES = ["/api/", "/auth/", "/admin", "/dashboard", "/operator", "/supply", "/beta", "/licenses"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL.map((path) => new Request(path, { cache: "reload" })))).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin || PRIVATE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then((response) => {
      if (response.ok && ["/", "/create", "/discover", "/offline"].includes(url.pathname)) {
        const copy = response.clone()
        void caches.open(CACHE).then((cache) => cache.put(url.pathname, copy))
      }
      return response
    }).catch(() => caches.match(url.pathname, { ignoreSearch: true }).then((cached) => cached || caches.match("/offline"))))
    return
  }
  if (url.pathname.startsWith("/_next/static/") || url.pathname === "/manifest.webmanifest" || url.pathname === "/icon") event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.ok) { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put(request, copy)) } return response })))
})
