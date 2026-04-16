'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import type { StoryGroup, StoryItem } from './StoriesBar'

const STORY_DURATION = 5000 // ms per story

interface Props {
  groups: StoryGroup[]
  initialGroupIdx: number
  viewedIds: Set<string>
  currentUserId?: string
  isDark: boolean
  onView: (ids: string[]) => void
  onClose: () => void
}

export default function StoryViewer({
  groups, initialGroupIdx, viewedIds, currentUserId, isDark, onView, onClose,
}: Props) {
  const [groupIdx, setGroupIdx] = useState(initialGroupIdx)
  const [storyIdx, setStoryIdx] = useState(0)
  const [progress, setProgress] = useState(0)   // 0..1
  const [paused,   setPaused]   = useState(false)

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt   = useRef(Date.now())
  const pausedMs    = useRef(0)
  const pauseStarted = useRef(0)

  const group = groups[groupIdx]
  const story: StoryItem | undefined = group?.stories[storyIdx]
  const isOwn = group?.is_own && currentUserId === group.user_id

  // ── mark viewed ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!story) return
    if (!viewedIds.has(story.id)) {
      onView([story.id])
      fetch(`/api/stories/${story.id}/view`, { method: 'POST' }).catch(() => {})
    }
  }, [story?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── progress timer ─────────────────────────────────────────────────────────
  const advanceStory = useCallback(() => {
    setStoryIdx(prev => {
      if (prev + 1 < (groups[groupIdx]?.stories.length ?? 0)) {
        return prev + 1
      }
      // next group
      setGroupIdx(gi => {
        if (gi + 1 < groups.length) {
          setStoryIdx(0)
          return gi + 1
        }
        onClose()
        return gi
      })
      return 0
    })
    setProgress(0)
  }, [groupIdx, groups, onClose])

  useEffect(() => {
    startedAt.current  = Date.now()
    pausedMs.current   = 0
    setProgress(0)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (paused) return
      const elapsed  = Date.now() - startedAt.current - pausedMs.current
      const p        = Math.min(elapsed / STORY_DURATION, 1)
      setProgress(p)
      if (p >= 1) {
        clearInterval(timerRef.current!)
        advanceStory()
      }
    }, 50)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [storyIdx, groupIdx, advanceStory]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused) {
      pauseStarted.current = Date.now()
    } else {
      pausedMs.current += Date.now() - pauseStarted.current
    }
  }, [paused])

  // ── keyboard ───────────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowRight')  goNext()
      if (e.key === 'ArrowLeft')   goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [groupIdx, storyIdx]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── navigation ─────────────────────────────────────────────────────────────
  function goNext() {
    const g = groups[groupIdx]
    if (!g) return
    if (storyIdx + 1 < g.stories.length) {
      setStoryIdx(s => s + 1)
    } else if (groupIdx + 1 < groups.length) {
      setGroupIdx(gi => gi + 1)
      setStoryIdx(0)
    } else {
      onClose()
    }
    setProgress(0)
  }

  function goPrev() {
    if (storyIdx > 0) {
      setStoryIdx(s => s - 1)
    } else if (groupIdx > 0) {
      setGroupIdx(gi => gi - 1)
      const prevLen = groups[groupIdx - 1]?.stories.length ?? 1
      setStoryIdx(prevLen - 1)
    }
    setProgress(0)
  }

  async function deleteStory() {
    if (!story) return
    await fetch(`/api/stories/${story.id}`, { method: 'DELETE' })
    goNext()
  }

  // ── touch swipe ────────────────────────────────────────────────────────────
  const touchX = useRef(0)
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX
    setPaused(true)
  }
  function onTouchEnd(e: React.TouchEvent) {
    setPaused(false)
    const dx = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(dx) > 50) {
      dx < 0 ? goNext() : goPrev()
    }
  }

  if (!group || !story) return null

  // ── story background ───────────────────────────────────────────────────────
  const bgStyle: React.CSSProperties = story.type === 'image' && story.media_url
    ? { backgroundImage: `url(${story.media_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: story.bg_color ?? '#5e6ad2' }

  const timeAgo = (() => {
    const diff = Date.now() - new Date(story.created_at).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60)  return `${m}м назад`
    const h = Math.floor(m / 60)
    if (h < 24)  return `${h}ч назад`
    return 'вчера'
  })()

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Story card */}
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        style={{
          position: 'relative',
          width: 'min(400px, 100vw)',
          height: 'min(700px, 100dvh)',
          borderRadius: 20,
          overflow: 'hidden',
          ...bgStyle,
        }}
      >
        {/* Progress segments */}
        <div style={{
          position: 'absolute', top: 12, left: 12, right: 12,
          display: 'flex', gap: 3, zIndex: 10,
        }}>
          {group.stories.map((s, i) => (
            <div key={s.id} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: 'rgba(255,255,255,0.35)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: '#fff',
                width: i < storyIdx
                  ? '100%'
                  : i === storyIdx
                    ? `${progress * 100}%`
                    : '0%',
                transition: i === storyIdx ? 'none' : undefined,
              }} />
            </div>
          ))}
        </div>

        {/* Header: avatar + name + time */}
        <div style={{
          position: 'absolute', top: 26, left: 12, right: 12,
          display: 'flex', alignItems: 'center', gap: 10, zIndex: 10,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.15)' }}>
            {group.avatar_url ? (
              <Image src={group.avatar_url} alt={group.full_name} width={36} height={36} style={{ objectFit: 'cover' }} unoptimized />
            ) : (
              <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', fontWeight: 700 }}>
                {group.full_name[0]}
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              {group.full_name}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{timeAgo}</div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {/* Views count (own stories) */}
            {isOwn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
                <Eye size={14} />
                {story.views}
              </div>
            )}
            {/* Delete (own stories) */}
            {isOwn && (
              <button
                type="button"
                onClick={deleteStory}
                style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#fff' }}
              >
                <Trash2 size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: 8, padding: '4px 6px', cursor: 'pointer', color: '#fff' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Story content (text) */}
        {story.type === 'text' && story.content && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '80px 24px 40px',
          }}>
            <p style={{
              fontSize: story.content.length > 100 ? 18 : story.content.length > 50 ? 22 : 26,
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              lineHeight: 1.4,
              textShadow: '0 2px 12px rgba(0,0,0,0.3)',
              wordBreak: 'break-word',
            }}>
              {story.content}
            </p>
          </div>
        )}

        {/* Left / Right tap zones */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Предыдущая"
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%',
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', paddingLeft: 8,
            opacity: 0,
          }}
        />
        <button
          type="button"
          onClick={goNext}
          aria-label="Следующая"
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%',
            background: 'transparent', border: 'none', cursor: 'pointer',
            opacity: 0,
          }}
        />
      </div>

      {/* Group navigation arrows (desktop) */}
      {groupIdx > 0 && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setGroupIdx(i => i - 1); setStoryIdx(0); setProgress(0) }}
          style={{
            position: 'absolute', left: 16,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: 'none', borderRadius: '50%', width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {groupIdx < groups.length - 1 && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setGroupIdx(i => i + 1); setStoryIdx(0); setProgress(0) }}
          style={{
            position: 'absolute', right: 16,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            border: 'none', borderRadius: '50%', width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
          }}
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  )
}
