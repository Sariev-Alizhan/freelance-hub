'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import ReelPlayer, { type Reel } from '@/components/reels/ReelPlayer'
import CreateReelModal from '@/components/reels/CreateReelModal'

export default function ReelsFeedPage() {
  const { user } = useUser()
  const [reels,    setReels]    = useState<Reel[]>([])
  const [loading,  setLoading]  = useState(true)
  const [done,     setDone]     = useState(false)
  const [muted,    setMuted]    = useState(true)
  const [active,   setActive]   = useState(0)
  const [creating, setCreating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs     = useRef<Array<HTMLDivElement | null>>([])

  const load = useCallback(async (before?: string) => {
    const qs = new URLSearchParams({ limit: '10' })
    if (before) qs.set('before', before)
    const r = await fetch(`/api/reels?${qs.toString()}`).catch(() => null)
    const j = r?.ok ? await r.json() : null
    const fresh: Reel[] = j?.reels ?? []
    setReels(prev => before ? [...prev, ...fresh] : fresh)
    if (fresh.length < 10) setDone(true)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Track which reel is currently in view
  useEffect(() => {
    const root = containerRef.current
    if (!root || reels.length === 0) return

    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          const idx = Number((e.target as HTMLElement).dataset.idx)
          if (Number.isFinite(idx)) setActive(idx)
        }
      }
    }, { root, threshold: [0.6] })

    itemRefs.current.forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [reels.length])

  // Infinite load when near the end
  useEffect(() => {
    if (done || loading) return
    if (active >= reels.length - 3 && reels.length > 0) {
      const last = reels[reels.length - 1]
      load(last.created_at)
    }
  }, [active, reels, done, loading, load])

  const toggleMute = useCallback(() => setMuted(m => !m), [])

  return (
    <div style={{
      position: 'fixed', inset: 0, top: 'var(--fh-header-h, 0px)',
      background: '#000',
      display: 'flex', flexDirection: 'column',
    }}>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
        }}
        className="hide-scrollbar"
      >
        {loading && reels.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={28} className="animate-spin" style={{ color: '#fff' }} />
          </div>
        ) : reels.length === 0 ? (
          <div style={{
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            color: '#fff', textAlign: 'center', padding: 24,
          }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Нет Reels</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              Станьте первым — загрузите короткое видео
            </div>
            {user && (
              <button
                onClick={() => setCreating(true)}
                style={{
                  marginTop: 8, padding: '12px 20px', borderRadius: 12,
                  background: 'var(--fh-primary)',
                  border: 'none', cursor: 'pointer',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                }}
              >
                Создать Reel
              </button>
            )}
          </div>
        ) : (
          reels.map((reel, i) => (
            <div
              key={reel.id}
              ref={el => { itemRefs.current[i] = el }}
              data-idx={i}
              style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              <ReelPlayer
                reel={reel}
                active={i === active}
                muted={muted}
                onToggleMute={toggleMute}
                viewerLoggedIn={!!user}
              />
            </div>
          ))
        )}
      </div>

      {/* Floating create button */}
      {user && reels.length > 0 && (
        <button
          onClick={() => setCreating(true)}
          aria-label="Создать Reel"
          style={{
            position: 'absolute', top: 12, left: 12, zIndex: 5,
            width: 42, height: 42, borderRadius: '50%',
            background: 'var(--fh-primary)',
            border: 'none', cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(94,106,210,0.4)',
          }}
        >
          <Plus size={22} />
        </button>
      )}

      {creating && (
        <CreateReelModal
          onClose={() => setCreating(false)}
          onCreate={() => {
            setCreating(false)
            setLoading(true)
            setDone(false)
            load()
          }}
        />
      )}

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        :global(body) { overscroll-behavior: none; }
      `}</style>
    </div>
  )
}
