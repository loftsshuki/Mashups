const CACHE = "mashups-shell-v1"
const SHELL = ["/", "/create", "/discover", "/manifest.webmanifest"]
const CACHEABLE_PAGES = new Set(["/", "/create", "/discover"])

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()))
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return
  if (request.mode === "navigate") {
    if (!CACHEABLE_PAGES.has(url.pathname)) return
    event.respondWith(fetch(request).then((response) => { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put(request, copy)); return response }).catch(() => caches.match(request).then((cached) => cached || caches.match("/create"))))
    return
  }
  if (url.pathname.startsWith("/_next/static/")) event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { const copy = response.clone(); void caches.open(CACHE).then((cache) => cache.put(request, copy)); return response })))
})
