// FreelanceHub Service Worker v2
const CACHE = 'fh-v2'
const OFFLINE_URL = '/'

const PRECACHE = [
  '/',
  '/orders',
  '/freelancers',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE))
    // Do NOT skipWaiting automatically — let the UI prompt the user
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Allow the page to trigger skipWaiting via postMessage
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  // Skip cross-origin, API, auth routes
  if (url.origin !== location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached
      return fetch(e.request).then((res) => {
        if (!res || res.status !== 200 || res.type !== 'basic') return res
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(e.request, clone))
        return res
      }).catch(() => caches.match(OFFLINE_URL))
    })
  )
})
