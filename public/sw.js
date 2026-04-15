// FreelanceHub Service Worker v5
const CACHE = 'fh-v5'
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
    // Delete ALL old caches (v1, v2, v3 …)
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Page can trigger skipWaiting via postMessage({ type: 'SKIP_WAITING' })
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ── Web Push ─────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  if (!e.data) return
  let data = {}
  try { data = e.data.json() } catch { data = { title: 'FreelanceHub', body: e.data.text() } }
  const { title = 'FreelanceHub', body = '', link = '/' } = data
  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/logo-icon.png',
      badge: '/logo-icon.png',
      data: { link },
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const link = e.notification.data?.link ?? '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(link)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(link)
    })
  )
})

// ── Fetch (caching) ───────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // Skip cross-origin, API, auth, and Next.js internal routes
  if (url.origin !== location.origin) return
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/_next/') && !url.pathname.startsWith('/_next/static/')
  ) return

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
