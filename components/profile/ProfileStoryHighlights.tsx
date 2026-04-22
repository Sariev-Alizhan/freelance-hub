'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Plus, Sparkles } from 'lucide-react'

export interface HighlightItem {
  id:        string
  type:      'text' | 'image'
  content:   string | null
  bg_color:  string | null
  media_url: string | null
  position:  number
}

export interface Highlight {
  id:         string
  title:      string
  cover_url:  string | null
  position:   number
  items:      HighlightItem[]
}

const STORY_DURATION = 5000

export default function ProfileStoryHighlights({
  highlights, isOwnProfile,
}: {
  highlights: Highlight[]
  isOwnProfile: boolean
}) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  if (highlights.length === 0 && !isOwnProfile) return null

  return (
    <>
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        padding: '2px 2px 6px',
      }}>
        {isOwnProfile && (
          <Link
            href="/dashboard/highlights"
            aria-label="Manage highlights"
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6, width: 72,
              textDecoration: 'none',
            }}
          >
            <div style={{
              width: 68, height: 68, borderRadius: '50%',
              border: '2px dashed var(--fh-border-2)',
              background: 'var(--fh-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={22} style={{ color: 'var(--fh-t4)' }} />
            </div>
            <span style={{
              fontSize: 11, color: 'var(--fh-t4)', fontWeight: 510,
              width: '100%', textAlign: 'center',
            }}>
              New
            </span>
          </Link>
        )}

        {highlights.map((h, i) => (
          <button
            key={h.id}
            onClick={() => setActiveIdx(i)}
            aria-label={`Open highlight ${h.title}`}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6, width: 72,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 68, height: 68, borderRadius: '50%', padding: 2,
              background: ringGradient(i),
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                border: '2px solid var(--fh-canvas)', overflow: 'hidden',
                background: h.cover_url
                  ? '#000'
                  : (h.items[0]?.bg_color ?? 'var(--fh-surface-2)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {h.cover_url ? (
                  <Image src={h.cover_url} alt={h.title}
                    width={60} height={60}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }} unoptimized />
                ) : h.items[0]?.type === 'image' && h.items[0].media_url ? (
                  <Image src={h.items[0].media_url} alt={h.title}
                    width={60} height={60}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }} unoptimized />
                ) : (
                  <Sparkles size={22} style={{ color: '#fff', opacity: 0.85 }} />
                )}
              </div>
            </div>
            <span style={{
              fontSize: 11, color: 'var(--fh-t3)', fontWeight: 510,
              width: '100%', textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {h.title}
            </span>
          </button>
        ))}
      </div>

      {activeIdx !== null && (
        <HighlightViewer
          highlights={highlights}
          initialIdx={activeIdx}
          onClose={() => setActiveIdx(null)}
        />
      )}
    </>
  )
}

function HighlightViewer({
  highlights, initialIdx, onClose,
}: {
  highlights: Highlight[]
  initialIdx: number
  onClose: () => void
}) {
  const [groupIdx, setGroupIdx] = useState(initialIdx)
  const [itemIdx,  setItemIdx]  = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused,   setPaused]   = useState(false)

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt   = useRef(0)
  const pausedMs    = useRef(0)
  const pauseStart  = useRef(0)

  const group = highlights[groupIdx]
  const item  = group?.items[itemIdx]

  const advance = useCallback(() => {
    setItemIdx(prev => {
      if (!group) return prev
      if (prev + 1 < group.items.length) return prev + 1
      setGroupIdx(gi => {
        if (gi + 1 < highlights.length) { setItemIdx(0); return gi + 1 }
        onClose()
        return gi
      })
      return 0
    })
    setProgress(0)
  }, [group, highlights.length, onClose])

  useEffect(() => {
    startedAt.current = Date.now()
    pausedMs.current  = 0
    setProgress(0)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (paused) return
      const elapsed = Date.now() - startedAt.current - pausedMs.current
      const p = Math.min(elapsed / STORY_DURATION, 1)
      setProgress(p)
      if (p >= 1) {
        clearInterval(timerRef.current!)
        advance()
      }
    }, 50)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [itemIdx, groupIdx, advance]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused) pauseStart.current = Date.now()
    else        pausedMs.current += Date.now() - pauseStart.current
  }, [paused])

  const goNext = useCallback(() => {
    if (!group) return
    if (itemIdx + 1 < group.items.length) setItemIdx(i => i + 1)
    else if (groupIdx + 1 < highlights.length) { setGroupIdx(g => g + 1); setItemIdx(0) }
    else onClose()
    setProgress(0)
  }, [group, groupIdx, highlights.length, itemIdx, onClose])

  const goPrev = useCallback(() => {
    if (itemIdx > 0) setItemIdx(i => i - 1)
    else if (groupIdx > 0) {
      const prevLen = highlights[groupIdx - 1]?.items.length ?? 1
      setGroupIdx(g => g - 1)
      setItemIdx(prevLen - 1)
    }
    setProgress(0)
  }, [groupIdx, highlights, itemIdx])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, goNext, goPrev])

  const touchX = useRef(0)

  if (!group || !item) return null

  const bg: React.CSSProperties = item.type === 'image' && item.media_url
    ? { backgroundImage: `url(${item.media_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: item.bg_color ?? '#27a644' }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; setPaused(true) }}
        onTouchEnd={e => {
          setPaused(false)
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 50) { if (dx < 0) goNext(); else goPrev() }
        }}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        style={{
          position: 'relative',
          width: 'min(400px, 100vw)',
          height: 'min(700px, 100dvh)',
          borderRadius: 20,
          overflow: 'hidden',
          ...bg,
        }}
      >
        {/* Progress segments */}
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12,
          display: 'flex', gap: 3, zIndex: 10,
        }}>
          {group.items.map((it, i) => (
            <div key={it.id} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: 'rgba(255,255,255,0.35)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: '#fff',
                width: i < itemIdx ? '100%' : i === itemIdx ? `${progress * 100}%` : '0%',
              }} />
            </div>
          ))}
        </div>

        {/* Title badge */}
        <div style={{
          position: 'absolute', top: 26, left: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 10,
        }}>
          <div style={{
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)',
            fontSize: 12, fontWeight: 600, color: '#fff',
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}>
            {group.title}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              marginLeft: 'auto',
              background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 8,
              padding: '4px 6px', cursor: 'pointer', color: '#fff',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Text content */}
        {item.type === 'text' && item.content && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px 40px',
          }}>
            <p style={{
              fontSize: item.content.length > 100 ? 18 : item.content.length > 50 ? 22 : 26,
              fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.4,
              textShadow: '0 2px 12px rgba(0,0,0,0.3)', wordBreak: 'break-word',
              margin: 0,
            }}>
              {item.content}
            </p>
          </div>
        )}

        {/* Tap zones */}
        <button type="button" onClick={goPrev} aria-label="Previous"
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0 }} />
        <button type="button" onClick={goNext} aria-label="Next"
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0 }} />
      </div>
    </div>
  )
}

function ringGradient(i: number): string {
  const palettes = [
    'linear-gradient(45deg, #feda75 0%, #d62976 50%, #4f5bd5 100%)',
    'linear-gradient(45deg, #27a644 0%, #a855f7 50%, #ec4899 100%)',
    'linear-gradient(45deg, #27a644 0%, #27a644 100%)',
    'linear-gradient(45deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(45deg, #06b6d4 0%, #8b5cf6 100%)',
  ]
  return palettes[i % palettes.length]
}
