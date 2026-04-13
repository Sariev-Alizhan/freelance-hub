'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

const APP_VERSION = '1.3.0'

export default function UpdateNotification() {
  const [show, setShow] = useState(false)
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    function trackWaiting(sw: ServiceWorker) {
      setWaiting(sw)
      setShow(true)
    }

    navigator.serviceWorker.ready.then((registration) => {
      // Already waiting (e.g. page refreshed after update found)
      if (registration.waiting) {
        trackWaiting(registration.waiting)
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            trackWaiting(newWorker)
          }
        })
      })

      // Check for SW updates every 30 minutes for long-running sessions
      const interval = setInterval(() => registration.update(), 30 * 60 * 1000)
      return () => clearInterval(interval)
    })

    // Also check on tab visibility change (user comes back after a while)
    function onVisible() {
      if (document.visibilityState === 'visible') {
        navigator.serviceWorker.ready.then(r => r.update())
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    // After skipWaiting fires, reload to activate new SW
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  function handleUpdate() {
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  if (!show) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px) + 12px)',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: 'var(--fh-surface)',
        border: '1px solid var(--fh-border-2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        maxWidth: '380px',
        marginLeft: 'auto',
        marginRight: 'auto',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'rgba(94,106,210,0.1)',
          border: '1px solid rgba(94,106,210,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <RefreshCw className="h-4 w-4" style={{ color: '#5e6ad2' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', margin: 0, lineHeight: 1.3 }}>
          Update available
        </p>
        <p style={{ fontSize: '11px', color: 'var(--fh-t4)', margin: 0, marginTop: '2px' }}>
          FreelanceHub v{APP_VERSION} — refresh to apply
        </p>
      </div>

      {/* Update button */}
      <button
        onClick={handleUpdate}
        style={{
          padding: '7px 14px',
          borderRadius: '6px',
          background: '#5e6ad2',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: 590,
          flexShrink: 0,
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
      >
        Update
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setShow(false)}
        style={{
          color: 'var(--fh-t4)',
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          padding: '2px',
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
