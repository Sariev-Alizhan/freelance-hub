'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles, Plus, Trash2, ArrowLeft, X, Loader2, Check, Pencil,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

interface HighlightItem {
  id:        string
  type:      'text' | 'image'
  content:   string | null
  bg_color:  string | null
  media_url: string | null
  position:  number
}
interface Highlight {
  id:         string
  title:      string
  cover_url:  string | null
  position:   number
  items:      HighlightItem[]
}
interface StoryRow {
  id:         string
  type:       'text' | 'image'
  content:    string | null
  bg_color:   string | null
  media_url:  string | null
  created_at: string
}

export default function HighlightsEditorPage() {
  const { user, loading: userLoading } = useUser()
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [ownStories, setOwnStories] = useState<StoryRow[]>([])
  const [loading, setLoading]       = useState(true)

  // Create form
  const [creating, setCreating]       = useState(false)
  const [title, setTitle]             = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  // Edit mode (rename + add/remove items)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editTitle, setEditTitle]   = useState('')
  const [editAdding, setEditAdding] = useState<string[]>([])
  const [deleting, setDeleting]     = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user) return
    const [hRes, sRes] = await Promise.all([
      fetch(`/api/highlights?user_id=${user.id}`, { cache: 'no-store' }),
      fetch('/api/stories', { cache: 'no-store' }),
    ])
    const hJson = await hRes.json()
    const sJson = await sRes.json()
    interface Group { is_own?: boolean; stories?: StoryRow[] }
    const ownGroup: Group | undefined = (sJson.groups ?? []).find((g: Group) => g.is_own)
    setHighlights(hJson.highlights ?? [])
    setOwnStories(ownGroup?.stories ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!userLoading && user) reload()
    if (!userLoading && !user) setLoading(false)
  }, [user, userLoading, reload])

  function toggle(id: string, list: string[], setList: (l: string[]) => void) {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id])
  }

  async function createHighlight() {
    setError('')
    if (!title.trim()) { setError('Title required'); return }
    if (selectedIds.length === 0) { setError('Pick at least one story'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), story_ids: selectedIds }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || 'Failed')
      }
      setCreating(false); setTitle(''); setSelectedIds([])
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this highlight?')) return
    setDeleting(id)
    try {
      await fetch(`/api/highlights/${id}`, { method: 'DELETE' })
      await reload()
    } finally { setDeleting(null) }
  }

  function startEdit(h: Highlight) {
    setEditingId(h.id); setEditTitle(h.title); setEditAdding([])
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    try {
      if (editTitle.trim()) {
        await fetch(`/api/highlights/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTitle.trim() }),
        })
      }
      if (editAdding.length > 0) {
        await fetch(`/api/highlights/${editingId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story_ids: editAdding }),
        })
      }
      setEditingId(null); setEditAdding([]); setEditTitle('')
      await reload()
    } finally { setSaving(false) }
  }

  async function removeItem(highlightId: string, itemId: string) {
    await fetch(`/api/highlights/${highlightId}/items/${itemId}`, { method: 'DELETE' })
    await reload()
  }

  if (userLoading || loading) {
    return (
      <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
        <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite', color: 'var(--fh-t4)' }} />
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--fh-t3)' }}>
        Please <Link href="/login" style={{ color: 'var(--fh-primary)' }}>log in</Link> to manage highlights.
      </div>
    )
  }

  const editingHighlight = highlights.find(h => h.id === editingId)

  return (
    <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <Link href="/dashboard" style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
          color: 'var(--fh-t2)', textDecoration: 'none',
        }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--fh-t1)', letterSpacing: '-0.02em', margin: 0 }}>
            Highlights
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: '2px 0 0' }}>
            Pin stories to your profile. They don&apos;t expire.
          </p>
        </div>
        {!creating && !editingId && (
          <button
            onClick={() => setCreating(true)}
            style={{
              padding: '8px 14px', borderRadius: 8, border: 'none',
              background: 'var(--fh-primary)', color: '#fff',
              fontSize: 13, fontWeight: 590, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <Plus size={14} /> New
          </button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <FormCard
          title="New highlight"
          onClose={() => { setCreating(false); setError(''); setTitle(''); setSelectedIds([]) }}
        >
          <Field label="Title *" value={title} onChange={setTitle} placeholder="Client work · 2024" />

          <div style={{ marginTop: 12 }}>
            <FieldLabel>Pick from your active stories ({ownStories.length})</FieldLabel>
            <StoryPicker stories={ownStories} selected={selectedIds}
              onToggle={id => toggle(id, selectedIds, setSelectedIds)} />
          </div>

          {error && <p style={{ margin: '10px 0 0', fontSize: 12, color: '#f87171' }}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={createHighlight}
              disabled={saving}
              style={primaryBtn(saving)}
            >
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
              Create
            </button>
            <button
              onClick={() => { setCreating(false); setTitle(''); setSelectedIds([]); setError('') }}
              disabled={saving}
              style={cancelBtn}
            >
              Cancel
            </button>
          </div>
        </FormCard>
      )}

      {/* Edit form */}
      {editingHighlight && (
        <FormCard
          title={`Edit: ${editingHighlight.title}`}
          onClose={() => { setEditingId(null); setEditAdding([]); setEditTitle('') }}
        >
          <Field label="Title" value={editTitle} onChange={setEditTitle} placeholder={editingHighlight.title} />

          {editingHighlight.items.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <FieldLabel>Current items ({editingHighlight.items.length})</FieldLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8, marginTop: 6 }}>
                {editingHighlight.items.map(it => (
                  <StoryThumb key={it.id}
                    story={it as HighlightItem & { created_at?: string }}
                    onClick={() => {
                      if (confirm('Remove this from the highlight?')) removeItem(editingHighlight.id, it.id)
                    }}
                    overlay={<Trash2 size={14} style={{ color: '#fff' }} />}
                  />
                ))}
              </div>
            </div>
          )}

          {ownStories.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <FieldLabel>Add from active stories</FieldLabel>
              <StoryPicker stories={ownStories} selected={editAdding}
                onToggle={id => toggle(id, editAdding, setEditAdding)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={saveEdit} disabled={saving} style={primaryBtn(saving)}>
              {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
              Save
            </button>
            <button onClick={() => { setEditingId(null); setEditAdding([]) }} disabled={saving} style={cancelBtn}>
              Cancel
            </button>
          </div>
        </FormCard>
      )}

      {/* List */}
      {highlights.length === 0 && !creating && (
        <div style={{
          padding: 24, borderRadius: 12, textAlign: 'center',
          background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        }}>
          <Sparkles size={24} style={{ color: 'var(--fh-t4)', marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>No highlights yet</p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
            {ownStories.length === 0
              ? <>Post a story first, then come back here to pin it.</>
              : <>Pin your best stories so they don&apos;t disappear in 24h.</>}
          </p>
        </div>
      )}

      {highlights.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {highlights.map(h => (
            <div key={h.id} style={{
              padding: 14, borderRadius: 12,
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%', overflow: 'hidden',
                flexShrink: 0, background: h.items[0]?.bg_color ?? 'var(--fh-surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {h.cover_url ? (
                  <Image src={h.cover_url} alt="" width={52} height={52} style={{ objectFit: 'cover' }} unoptimized />
                ) : h.items[0]?.type === 'image' && h.items[0].media_url ? (
                  <Image src={h.items[0].media_url} alt="" width={52} height={52} style={{ objectFit: 'cover' }} unoptimized />
                ) : (
                  <Sparkles size={20} style={{ color: '#fff' }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {h.title}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
                  {h.items.length} item{h.items.length === 1 ? '' : 's'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => startEdit(h)} title="Edit"
                  style={iconBtn()}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => remove(h.id)}
                  disabled={deleting === h.id}
                  title="Delete"
                  style={iconBtn(deleting === h.id, '#f87171')}
                >
                  {deleting === h.id
                    ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StoryPicker({
  stories, selected, onToggle,
}: {
  stories: StoryRow[]
  selected: string[]
  onToggle: (id: string) => void
}) {
  if (stories.length === 0) {
    return (
      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
        No active stories. <Link href="/feed" style={{ color: 'var(--fh-primary)' }}>Post one</Link>, then come back.
      </p>
    )
  }
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: 8, marginTop: 6,
    }}>
      {stories.map(s => {
        const isSelected = selected.includes(s.id)
        return (
          <StoryThumb
            key={s.id}
            story={s}
            onClick={() => onToggle(s.id)}
            selected={isSelected}
          />
        )
      })}
    </div>
  )
}

function StoryThumb({
  story, onClick, selected, overlay,
}: {
  story: StoryRow | HighlightItem
  onClick: () => void
  selected?: boolean
  overlay?: React.ReactNode
}) {
  const bg: React.CSSProperties = story.type === 'image' && story.media_url
    ? { backgroundImage: `url(${story.media_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: story.bg_color ?? '#27a644' }
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative', aspectRatio: '9/16', borderRadius: 10,
        border: selected ? '2px solid var(--fh-primary)' : '2px solid transparent',
        background: 'transparent', cursor: 'pointer',
        padding: 0, overflow: 'hidden',
        boxShadow: selected ? '0 0 0 2px var(--fh-primary-muted)' : undefined,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0, ...bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 6,
      }}>
        {story.type === 'text' && story.content && (
          <p style={{
            margin: 0, fontSize: 10, color: '#fff', fontWeight: 600,
            lineHeight: 1.25, textAlign: 'center',
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', wordBreak: 'break-word',
          }}>
            {story.content}
          </p>
        )}
      </div>
      {selected && (
        <div style={{
          position: 'absolute', top: 4, right: 4,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--fh-primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={12} style={{ color: '#fff' }} />
        </div>
      )}
      {overlay && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: 0, transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
        >
          {overlay}
        </div>
      )}
    </button>
  )
}

function FormCard({
  title, onClose, children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div style={{
      padding: 16, borderRadius: 12, marginBottom: 16,
      background: 'var(--fh-surface)', border: '1px solid var(--fh-primary)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>{title}</p>
        <button onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--fh-t4)', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  )
}

function Field({
  label, value, onChange, placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8,
          background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
          color: 'var(--fh-t1)', fontSize: 13, fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, color: 'var(--fh-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </label>
  )
}

function primaryBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
    background: 'var(--fh-primary)', color: '#fff',
    fontSize: 13, fontWeight: 590, cursor: disabled ? 'wait' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  }
}

const cancelBtn: React.CSSProperties = {
  padding: '10px 14px', borderRadius: 8,
  background: 'var(--fh-surface-2)', color: 'var(--fh-t2)',
  border: '1px solid var(--fh-border)', fontSize: 13, fontWeight: 510, cursor: 'pointer',
}

function iconBtn(loading = false, color = 'var(--fh-t3)'): React.CSSProperties {
  return {
    width: 30, height: 30, borderRadius: 8, border: 'none',
    background: 'var(--fh-surface-2)', color, cursor: loading ? 'wait' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}
