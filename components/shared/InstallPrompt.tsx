'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, Download, Share, Plus, MoreVertical, Monitor } from 'lucide-react'
import Logo from '@/components/ui/Logo'

type Mode = 'pwa' | 'ios' | 'macos' | null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'fh-install-dismissed'
const DISMISSED_TTL = 7 * 24 * 60 * 60 * 1000 // 1 week

function isDismissed() {
  try {
    const v = localStorage.getItem(DISMISSED_KEY)
    if (!v) return false
    return Date.now() - Number(v) < DISMISSED_TTL
  } catch {
    return false
  }
}

function setDismissed() {
  try { localStorage.setItem(DISMISSED_KEY, String(Date.now())) } catch {}
}

function detectMode(): Mode {
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/i.test(ua)
  const isMac = /Macintosh/i.test(ua) && !('ontouchstart' in window)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  const isStandalone =
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches

  if (isStandalone) return null        // already installed
  if (isDismissed()) return null
  if (isIOS) return 'ios'
  if (isMac && isSafari) return 'macos'
  return null // pwa mode is set asynchronously via beforeinstallprompt
}

// ─── iOS instruction modal ───────────────────────────────────────────────────
function IOSModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-subtle bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold mb-1">Add to iPhone / iPad</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Open FreelanceHub as an app — no browser bar, faster.
        </p>

        <ol className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">1</span>
            <div>
              <p className="text-sm font-medium">Tap the Share button</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                The <Share className="inline h-3.5 w-3.5 mx-0.5" /> button is at the bottom of Safari (iPhone) or top (iPad)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">2</span>
            <div>
              <p className="text-sm font-medium">Select &quot;Add to Home Screen&quot;</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Scroll down the list — look for the <Plus className="inline h-3.5 w-3.5 mx-0.5" /> Add to Home Screen icon
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">3</span>
            <div>
              <p className="text-sm font-medium">Tap &quot;Add&quot;</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confirm the name and tap &quot;Add&quot; in the top right corner
              </p>
            </div>
          </li>
        </ol>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

// ─── macOS instruction modal ──────────────────────────────────────────────────
function MacModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-subtle bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold mb-1">Add to Mac</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Two ways to open FreelanceHub as a standalone app from the Dock.
        </p>

        <div className="space-y-4">
          <div className="rounded-xl border border-subtle p-4">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Share className="h-4 w-4 text-primary" /> Via the Share button
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In Safari tap <Share className="inline h-3 w-3 mx-0.5" /> top right →<br/>
              select <strong>&quot;Add to Dock&quot;</strong> → tap &quot;Add&quot;
            </p>
          </div>
          <div className="rounded-xl border border-subtle p-4">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" /> Via Safari menu
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In the menu bar: <strong>File → Add to Dock…</strong><br/>
              (macOS Sonoma and newer)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function InstallPrompt() {
  const [mode, setMode]           = useState<Mode>(null)
  const [visible, setVisible]     = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pwaEvent, setPwaEvent]   = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Android / Chrome / Edge: native install prompt
    const handler = (e: Event) => {
      // Skip preventDefault when we won't show our banner — otherwise Chrome
      // logs "Banner not shown: preventDefault called" for no reason.
      if (isDismissed()) return
      e.preventDefault()
      setPwaEvent(e as BeforeInstallPromptEvent)
      setMode('pwa')
      setTimeout(() => setVisible(true), 2500)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS / macOS Safari: manual instructions
    const detected = detectMode()
    if (detected) {
      setMode(detected)
      setTimeout(() => setVisible(true), 3000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = useCallback(() => {
    setDismissed()
    setVisible(false)
  }, [])

  const handleInstall = useCallback(async () => {
    if (mode === 'pwa' && pwaEvent) {
      await pwaEvent.prompt()
      const { outcome } = await pwaEvent.userChoice
      if (outcome === 'accepted') setDismissed()
      setVisible(false)
    } else {
      setShowModal(true)
    }
  }, [mode, pwaEvent])

  if (!visible || !mode) return null

  return (
    <>
      {/* Banner */}
      <div
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-6 left-1/2 -translate-x-1/2 z-[100]
          w-[calc(100%-2rem)] max-w-md
          flex items-center gap-3 px-4 py-3
          rounded-2xl border border-subtle bg-card shadow-2xl
          animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        <Logo size={36} showWordmark={false} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight">Install app</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
            {mode === 'ios'
              ? 'Add to iPhone / iPad home screen'
              : mode === 'macos'
              ? 'Add to Mac Dock'
              : 'Works offline, like a native app'}
          </p>
        </div>

        <button
          onClick={handleInstall}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {mode === 'pwa' ? 'Install' : 'How?'}
        </button>

        <button
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Modal for manual instructions */}
      {showModal && mode === 'ios' && (
        <IOSModal onClose={() => { setShowModal(false); dismiss() }} />
      )}
      {showModal && mode === 'macos' && (
        <MacModal onClose={() => { setShowModal(false); dismiss() }} />
      )}
    </>
  )
}
