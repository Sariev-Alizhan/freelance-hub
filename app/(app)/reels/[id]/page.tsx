'use client'
import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import ReelPlayer, { type Reel } from '@/components/reels/ReelPlayer'

export default function SingleReelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useUser()
  const [reel,  setReel]  = useState<Reel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/reels/${id}`)
      .then(r => r.json())
      .then(j => {
        if (cancelled) return
        if (j.reel) setReel(j.reel)
        else setError(j.error ?? 'Reel not found')
      })
      .catch(() => { if (!cancelled) setError('Failed to load') })
    return () => { cancelled = true }
  }, [id])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  return (
    <div style={{
      position: 'fixed', inset: 0, top: 'var(--fh-header-h, 0px)',
      background: '#000',
    }}>
      <Link
        href="/reels"
        aria-label="Back to reels"
        style={{
          position: 'absolute', top: 12, left: 12, zIndex: 5,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          color: '#fff', textDecoration: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <ArrowLeft size={18} />
      </Link>

      {error ? (
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          color: '#fff', textAlign: 'center', padding: 24,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{error}</div>
          <Link href="/reels" style={{ color: 'var(--fh-primary)', fontSize: 14 }}>
            К ленте Reels
          </Link>
        </div>
      ) : !reel ? (
        <div style={{
          height: '100%', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Loader2 size={28} className="animate-spin" style={{ color: '#fff' }} />
        </div>
      ) : (
        <ReelPlayer
          reel={reel}
          active
          muted={muted}
          onToggleMute={toggleMute}
          viewerLoggedIn={!!user}
        />
      )}
    </div>
  )
}
