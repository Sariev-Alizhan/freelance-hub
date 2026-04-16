'use client'

import { useState, useEffect } from 'react'
import { Briefcase, User2, Loader2 } from 'lucide-react'
import { useProfile } from '@/lib/context/ProfileContext'
import { useLang } from '@/lib/context/LanguageContext'
import { useRouter } from 'next/navigation'

type Mode = 'client' | 'freelancer'

function getMode(role: string | undefined, cookieMode: string | null): Mode {
  if (cookieMode === 'client' || cookieMode === 'freelancer') return cookieMode
  return role === 'freelancer' ? 'freelancer' : 'client'
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export default function RoleSwitcher() {
  const { profile, refreshProfile } = useProfile()
  const { t } = useLang()
  const router   = useRouter()
  const [mode, setMode]       = useState<Mode>(() => getMode(profile?.role, null))
  const [loading, setLoading] = useState(false)

  // Read cookie on mount for instant correct state
  useEffect(() => {
    const cookie = readCookie('fh-mode')
    setMode(getMode(profile?.role, cookie))
  }, [profile?.role])

  // Only show if logged in
  if (!profile) return null

  async function switchTo(next: Mode) {
    if (next === mode || loading) return
    setLoading(true)
    try {
      await fetch('/api/profile/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: next }),
      })
      setMode(next)
      await refreshProfile()
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const isFreelancer = mode === 'freelancer'

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
      {/* Client pill */}
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
        <span className="hidden sm:inline">{t.roles.client}</span>
      </button>
      {/* Freelancer pill */}
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
        <span className="hidden sm:inline">{t.roles.freelancer}</span>
      </button>
    </div>
  )
}
