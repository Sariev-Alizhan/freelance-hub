'use client'
import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

const APP_VERSION = '1.1.0'

export default function UpdateNotification() {
  const [show, setShow] = useState(false)
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((registration) => {
      // Already waiting worker (e.g. page refreshed)
      if (registration.waiting) {
        setWaiting(registration.waiting)
        setShow(true)
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(newWorker)
            setShow(true)
          }
        })
      })
    })

    // After skipWaiting fires, reload to activate new SW
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
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
      }}
    >
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
          Вышло обновление
        </p>
        <p style={{ fontSize: '11px', color: 'var(--fh-t4)', margin: 0, marginTop: '2px' }}>
          FreelanceHub v{APP_VERSION}
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
        Обновить
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
