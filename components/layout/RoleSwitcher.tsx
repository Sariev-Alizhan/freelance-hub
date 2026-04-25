'use client'

import { useState, useEffect } from 'react'
import { Briefcase, User2, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/context/ProfileContext'
import { useLang } from '@/lib/context/LanguageContext'
import { useRouter } from 'next/navigation'

type Mode = 'client' | 'freelancer'
type Variant = 'default' | 'mobile'

function getMode(role: string | undefined, activeMode: string | undefined, cookieMode: string | null): Mode {
  if (activeMode === 'client' || activeMode === 'freelancer') return activeMode
  if (cookieMode === 'client' || cookieMode === 'freelancer') return cookieMode
  return role === 'freelancer' ? 'freelancer' : 'client'
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export default function RoleSwitcher({ variant = 'default' }: { variant?: Variant } = {}) {
  const { profile, refreshProfile } = useProfile()
  const { t } = useLang()
  const router   = useRouter()
  const [mode, setMode]       = useState<Mode>(() => getMode(profile?.role, profile?.active_mode, null))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const cookie = readCookie('fh-mode')
    setMode(getMode(profile?.role, profile?.active_mode, cookie))
  }, [profile?.role, profile?.active_mode])

  if (!profile) return null

  async function switchTo(next: Mode) {
    if (next === mode || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/profile/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: next }),
      })
      if (!res.ok) {
        // Surface the server error so the user sees what went wrong instead of
        // a silent UI revert. Toggle stays on the previous mode.
        const body = await res.json().catch(() => ({}))
        console.error('[RoleSwitcher] switch failed', res.status, body)
        return
      }
      setMode(next)
      await refreshProfile()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const isFreelancer = mode === 'freelancer'

  // ── Mobile sheet variant: full-width segmented control with animated thumb ──
  if (variant === 'mobile') {
    return (
      <div
        role="tablist"
        aria-label={t.roles?.client ? 'Mode' : 'Mode'}
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: 4,
          borderRadius: 12,
          background: 'var(--fh-surface-2)',
          border: '0.5px solid var(--fh-border)',
          margin: '4px 0',
        }}
      >
        {/* Animated thumb */}
        <motion.div
          aria-hidden
          initial={false}
          animate={{ x: isFreelancer ? '100%' : '0%' }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: 4,
            width: 'calc(50% - 4px)',
            borderRadius: 9,
            background: 'var(--fh-primary)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
            zIndex: 0,
          }}
        />

        {/* Client segment */}
        <button
          role="tab"
          aria-selected={!isFreelancer}
          onClick={() => switchTo('client')}
          disabled={loading}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 40,
            border: 'none',
            background: 'transparent',
            cursor: loading ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: !isFreelancer ? '#fff' : 'var(--fh-t3)',
            transition: 'color 0.2s',
          }}
        >
          {loading && !isFreelancer ? (
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <Briefcase style={{ width: 16, height: 16, strokeWidth: 2 }} />
          )}
          <span>{t.roles.client}</span>
        </button>

        {/* Freelancer segment */}
        <button
          role="tab"
          aria-selected={isFreelancer}
          onClick={() => switchTo('freelancer')}
          disabled={loading}
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            height: 40,
            border: 'none',
            background: 'transparent',
            cursor: loading ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: isFreelancer ? '#fff' : 'var(--fh-t3)',
            transition: 'color 0.2s',
          }}
        >
          {loading && isFreelancer ? (
            <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <User2 style={{ width: 16, height: 16, strokeWidth: 2 }} />
          )}
          <span>{t.roles.freelancer}</span>
        </button>
      </div>
    )
  }

  // ── Default (sidebar) variant: compact pill ──────────────────────────────────
  return (
    <div
      className="flex items-center p-0.5 rounded-lg border gap-0.5"
      style={{
        background: 'var(--fh-surface-2)',
        borderColor: 'var(--fh-border)',
      }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </div>
      )}
      <button
        onClick={() => switchTo('client')}
        disabled={loading}
        title={t.roles.client}
        className={`relative flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
          !isFreelancer
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Briefcase className="h-3 w-3" />
        <span>{t.roles.client}</span>
      </button>
      <button
        onClick={() => switchTo('freelancer')}
        disabled={loading}
        title={t.roles.freelancer}
        className={`relative flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
          isFreelancer
            ? 'bg-primary text-white shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <User2 className="h-3 w-3" />
        <span>{t.roles.freelancer}</span>
      </button>
    </div>
  )
}
