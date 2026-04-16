// FreelanceHub Service Worker v7
// Push-notifications only — no fetch caching (browser HTTP cache handles assets)
const CACHE_NAME = 'fh-v7'

self.addEventListener('install', () => {
  // Activate immediately — no stale cache to worry about
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  // Remove all old caches from previous SW versions
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// ── Web Push ───────────────────────────────────────────────────────────────────
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

// No fetch handler — let the browser's HTTP cache manage assets naturally.
// This prevents stale JS chunk SRI integrity failures after deploys.
