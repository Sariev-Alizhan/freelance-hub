// FreelanceHub Service Worker v6
const CACHE = 'fh-v6'
const STATIC_CACHE = 'fh-static-v6'

self.addEventListener('install', (e) => {
  // Skip waiting immediately so the new SW activates right away
  self.skipWaiting()
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) =>
      c.addAll([
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        '/apple-touch-icon.png',
      ])
    )
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ── Web Push ──────────────────────────────────────────────────────────────────
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

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)

  // Skip cross-origin and API/auth routes
  if (url.origin !== location.origin) return
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) return

  // /_next/static/ — immutable assets, cache-first forever
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(STATIC_CACHE).then((c) => c.put(e.request, clone))
          }
          return res
        })
      })
    )
    return
  }

  // /_next/ internal (non-static) — skip caching
  if (url.pathname.startsWith('/_next/')) return

  // Everything else (HTML pages, images, fonts) — NETWORK FIRST
  // This ensures deploys always serve fresh HTML with correct chunk references
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, clone))
        }
        return res
      })
      .catch(() =>
        caches.match(e.request).then((cached) => cached || caches.match('/'))
      )
  )
})
