'use client'
import { useEffect, useRef, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

/* ── helpers ───────────────────────────────────────────────────── */
function getPageBuildId(): string {
  if (typeof window === 'undefined') return ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).__NEXT_DATA__?.buildId ?? ''
}

const BUILD_KEY = 'fh-build-id'

async function nukeAllCaches() {
  if ('caches' in window) {
    const names = await caches.keys()
    await Promise.all(names.map((n) => caches.delete(n)))
  }
}

/* ── component ─────────────────────────────────────────────────── */
export default function UpdateNotification() {
  const [show, setShow]         = useState(false)
  const [checking, setChecking] = useState(false)
  const [updating, setUpdating] = useState(false)
  const swWaiting               = useRef<ServiceWorker | null>(null)

  useEffect(() => {
    /* 1 ─ Build-ID version check (ALL browsers: Chrome, Safari, Yandex, Firefox …) */
    const current = getPageBuildId()
    const stored  = localStorage.getItem(BUILD_KEY)
    if (current) {
      if (stored && stored !== current) setShow(true)
      localStorage.setItem(BUILD_KEY, current)
    }

    /* 2 ─ Service-Worker update detection (PWA / installed apps) */
    if (!('serviceWorker' in navigator)) return

    let rafInterval: ReturnType<typeof setInterval>

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) { swWaiting.current = reg.waiting; setShow(true) }

      reg.addEventListener('updatefound', () => {
        const w = reg.installing
        if (!w) return
        w.addEventListener('statechange', () => {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            swWaiting.current = w
            setShow(true)
          }
        })
      })

      // Poll SW every 30 min (long-running sessions)
      rafInterval = setInterval(() => reg.update(), 30 * 60 * 1000)
    })

    // After skipWaiting activates new SW → hard reload
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload())

    /* 3 ─ Re-check on tab focus (user returns after idle time) */
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      navigator.serviceWorker.ready.then((r) => r.update()).catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(rafInterval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  /* ── Apply update ──────────────────────────────────────────────── */
  async function handleUpdate() {
    setUpdating(true)
    try {
      if (swWaiting.current) {
        // SW path: skipWaiting → controllerchange → window.location.reload()
        swWaiting.current.postMessage({ type: 'SKIP_WAITING' })
        return
      }
      // Non-SW path: unregister all SWs, nuke caches, hard-reload
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        await Promise.all(regs.map((r) => r.unregister()))
      }
      await nukeAllCaches()
      localStorage.removeItem(BUILD_KEY)
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  /* ── Manual "check for updates" ───────────────────────────────── */
  async function handleManualCheck() {
    setChecking(true)
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        await reg.update()
        if (reg.waiting) { swWaiting.current = reg.waiting; setShow(true); setChecking(false); return }
      }
      await nukeAllCaches()
      localStorage.removeItem(BUILD_KEY)
      window.location.reload()
    } catch {
      window.location.reload()
    }
  }

  /* ── No pending update — show subtle manual-check button ──────── */
  if (!show) {
    return (
      <button
        onClick={handleManualCheck}
        disabled={checking}
        title="Check for updates"
        aria-label="Check for updates"
        className="hidden md:flex items-center justify-center"
        style={{
          position:       'fixed',
          bottom:         '20px',
          right:          '14px',
          zIndex:         9000,
          width:          '34px',
          height:         '34px',
          borderRadius:   '50%',
          background:     'var(--fh-surface)',
          border:         '1px solid var(--fh-border)',
          boxShadow:      '0 2px 8px rgba(0,0,0,0.12)',
          cursor:         checking ? 'wait' : 'pointer',
          opacity:        0.45,
          transition:     'opacity 0.2s, transform 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.45'; e.currentTarget.style.transform = 'scale(1)' }}
      >
        <RefreshCw
          className="h-3.5 w-3.5"
          style={{ color: 'var(--fh-t3)', animation: checking ? 'spin 1s linear infinite' : 'none' }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </button>
    )
  }

  /* ── Update available banner ───────────────────────────────────── */
  return (
    <div
      role="alert"
      style={{
        position:       'fixed',
        bottom:         'calc(4rem + env(safe-area-inset-bottom, 0px) + 12px)',
        left:           '16px',
        right:          '16px',
        zIndex:         9999,
        display:        'flex',
        alignItems:     'center',
        gap:            '12px',
        padding:        '12px 14px',
        borderRadius:   '14px',
        background:     'var(--fh-surface)',
        border:         '1px solid var(--fh-border-2)',
        boxShadow:      '0 8px 32px rgba(0,0,0,0.28)',
        maxWidth:       '400px',
        marginLeft:     'auto',
        marginRight:    'auto',
        animation:      'fh-slideup 0.3s cubic-bezier(.22,1,.36,1)',
      }}
    >
      <style>{`
        @keyframes fh-slideup {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      {/* Icon */}
      <div style={{
        width:          '38px',
        height:         '38px',
        borderRadius:   '9px',
        background:     'rgba(94,106,210,0.12)',
        border:         '1px solid rgba(94,106,210,0.25)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <RefreshCw className="h-4 w-4" style={{ color: '#5e6ad2' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', margin: 0, lineHeight: 1.3 }}>
          Update available
        </p>
        <p style={{ fontSize: '11px', color: 'var(--fh-t4)', margin: 0, marginTop: '2px' }}>
          New version of FreelanceHub is ready
        </p>
      </div>

      {/* Update button */}
      <button
        onClick={handleUpdate}
        disabled={updating}
        style={{
          padding:      '7px 14px',
          borderRadius: '7px',
          background:   updating ? '#3d4494' : '#5e6ad2',
          color:        '#ffffff',
          fontSize:     '12px',
          fontWeight:   590,
          flexShrink:   0,
          border:       'none',
          cursor:       updating ? 'wait' : 'pointer',
          transition:   'background 0.15s',
          display:      'flex',
          alignItems:   'center',
          gap:          '5px',
        }}
        onMouseEnter={(e) => { if (!updating) e.currentTarget.style.background = '#828fff' }}
        onMouseLeave={(e) => { if (!updating) e.currentTarget.style.background = '#5e6ad2' }}
      >
        {updating && (
          <RefreshCw className="h-3 w-3" style={{ animation: 'spin 1s linear infinite' }} />
        )}
        {updating ? 'Updating…' : 'Update'}
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setShow(false)}
        aria-label="Dismiss"
        style={{
          color:      'var(--fh-t4)',
          flexShrink: 0,
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          display:    'flex',
          padding:    '2px',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fh-t1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fh-t4)' }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
