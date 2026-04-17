'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import StoryViewer from './StoryViewer'
import CreateStoryModal from './CreateStoryModal'

export type StoryItem = {
  id: string
  user_id: string
  type: 'text' | 'image'
  content: string | null
  bg_color: string | null
  media_url: string | null
  views: number
  created_at: string
  expires_at: string
}

export type StoryGroup = {
  user_id: string
  full_name: string
  avatar_url: string | null
  username: string | null
  is_verified: boolean
  stories: StoryItem[]
  has_unseen: boolean
  is_own: boolean
}

interface Props {
  currentUserId?: string
}

export default function StoriesBar({ currentUserId }: Props) {
  const [groups, setGroups]         = useState<StoryGroup[]>([])
  const [viewedIds, setViewedIds]   = useState<Set<string>>(new Set())
  const [openGroup, setOpenGroup]   = useState<number | null>(null)   // index in groups
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading]       = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/stories')
      const json = await res.json()
      setGroups(json.groups   ?? [])
      setViewedIds(new Set(json.viewedIds ?? []))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function markViewed(newIds: string[]) {
    // Both state updates derived from the same computed next set — no stale closure
    setViewedIds(prev => {
      const next = new Set(prev)
      newIds.forEach(id => next.add(id))
      setGroups(gs => gs.map(g => ({
        ...g,
        has_unseen: g.stories.some(s => !next.has(s.id)),
      })))
      return next
    })
  }

  function afterCreate() {
    setShowCreate(false)
    load()
  }

  // ── horizontal drag-to-scroll ──────────────────────────────────────────────
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 })
  function onPointerDown(e: React.PointerEvent) {
    drag.current = { active: true, startX: e.clientX, scrollLeft: scrollRef.current!.scrollLeft }
    scrollRef.current!.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current.active) return
    scrollRef.current!.scrollLeft = drag.current.scrollLeft - (e.clientX - drag.current.startX)
  }
  function onPointerUp() { drag.current.active = false }

  // ── group ring color ───────────────────────────────────────────────────────
  const ringStyle = (g: StoryGroup) => {
    if (g.has_unseen) return { borderColor: '#7170ff', boxShadow: '0 0 0 2px #7170ff33' }
    return { borderColor: 'var(--fh-border)' }
  }

  if (loading) {
    return (
      <div style={{ height: 96, display: 'flex', alignItems: 'center', gap: 12, padding: '0 4px', overflowX: 'hidden' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            flexShrink: 0,
            width: 64,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--fh-surface-2)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            <div style={{ width: 40, height: 8, borderRadius: 4, background: 'var(--fh-surface-2)' }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div
        ref={scrollRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          display: 'flex',
          gap: 12,
          padding: '8px 4px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          cursor: drag.current.active ? 'grabbing' : 'grab',
          userSelect: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Add story button (logged-in users only) */}
        {currentUserId && (
          <StoryAvatar
            key="add"
            label="Моя история"
            avatar={groups.find(g => g.is_own)?.avatar_url ?? null}
            hasUnseen={false}
            isAdd
            ringStyle={{ borderColor: 'var(--fh-border)' }}
            onClick={() => setShowCreate(true)}
          />
        )}

        {/* Other users' stories */}
        {groups
          .filter(g => !g.is_own || g.stories.length > 0)
          .map((g) => {
            // find real index in groups for the viewer
            const realIdx = groups.indexOf(g)
            return (
              <StoryAvatar
                key={g.user_id}
                label={g.full_name.split(' ')[0]}
                avatar={g.avatar_url}
                hasUnseen={g.has_unseen}
                ringStyle={ringStyle(g)}
                onClick={() => setOpenGroup(realIdx)}
                isOwn={g.is_own}
              />
            )
          })}
      </div>

      {/* Story Viewer */}
      {openGroup !== null && (
        <StoryViewer
          groups={groups}
          initialGroupIdx={openGroup}
          viewedIds={viewedIds}
          currentUserId={currentUserId}
          onView={ids => markViewed(ids)}
          onClose={() => setOpenGroup(null)}
        />
      )}

      {/* Create Story Modal */}
      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onCreate={afterCreate}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
function StoryAvatar({
  label, avatar, hasUnseen, ringStyle, onClick, isAdd, isOwn,
}: {
  label: string
  avatar: string | null
  hasUnseen: boolean
  ringStyle: React.CSSProperties
  onClick: () => void
  isAdd?: boolean
  isOwn?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 64,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        {/* Ring */}
        <div style={{
          position: 'absolute', inset: -3,
          borderRadius: '50%',
          border: `2.5px solid`,
          ...ringStyle,
          transition: 'border-color 0.2s',
        }} />
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--fh-surface-2)',
          overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {avatar ? (
            <Image src={avatar} alt={label} fill style={{ objectFit: 'cover' }} unoptimized />
          ) : (
            <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--fh-t3)' }}>
              {label[0]?.toUpperCase()}
            </span>
          )}
        </div>
        {/* + badge */}
        {isAdd && (
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 20, height: 20, borderRadius: '50%',
            background: '#7170ff',
            border: '2px solid var(--fh-surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Plus size={11} color="#fff" strokeWidth={3} />
          </div>
        )}
        {/* seen indicator */}
        {isOwn && !isAdd && (
          <div style={{
            position: 'absolute', bottom: -1, right: -1,
            width: 14, height: 14, borderRadius: '50%',
            background: '#27a644',
            border: '2px solid var(--fh-surface)',
          }} />
        )}
      </div>
      <span style={{
        fontSize: 11, fontWeight: 600,
        color: hasUnseen ? 'var(--fh-t1)' : 'var(--fh-t3)',
        maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textAlign: 'center',
      }}>
        {isAdd ? 'Добавить' : label}
      </span>
    </button>
  )
}
