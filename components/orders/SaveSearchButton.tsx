'use client'
import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2, X } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'

interface Props {
  keyword: string
  category: string
  urgentOnly: boolean
}

export default function SaveSearchButton({ keyword, category, urgentOnly }: Props) {
  const { user } = useUser()
  const router   = useRouter()
  const [open,    setOpen]    = useState(false)
  const [label,   setLabel]   = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function buildDefaultLabel() {
    const parts: string[] = []
    if (keyword) parts.push(keyword)
    if (category && category !== 'all') parts.push(category)
    if (urgentOnly) parts.push('urgent')
    return parts.length > 0 ? parts.join(' · ') : 'All orders'
  }

  function handleOpen() {
    if (!user) { router.push('/auth/login'); return }
    setLabel(buildDefaultLabel())
    setError(null)
    setOpen(true)
  }

  async function handleSave() {
    if (!label.trim()) { setError('Enter a name'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim(), keyword, category, urgent_only: urgentOnly }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error'); return }
      setSaved(true)
      setTimeout(() => { setOpen(false); setSaved(false) }, 1200)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        title="Save this search"
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '10px 14px', borderRadius: '6px',
          background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
          color: 'var(--fh-t3)', fontSize: '13px', fontWeight: 510, cursor: 'pointer',
          transition: 'color 0.15s, border-color 0.15s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#5e6ad2'; e.currentTarget.style.borderColor = 'rgba(94,106,210,0.35)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t3)'; e.currentTarget.style.borderColor = 'var(--fh-border-2)' }}
      >
        <Bookmark className="h-4 w-4" />
        Save
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          />
          {/* Popover */}
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 50,
            width: '260px', padding: '14px', borderRadius: '12px',
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t2)' }}>Save search</span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', display: 'flex' }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Current filters summary */}
            <div style={{
              marginBottom: '10px', padding: '8px 10px', borderRadius: '8px',
              background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
              fontSize: '11px', color: 'var(--fh-t4)', lineHeight: 1.6,
            }}>
              {keyword && <div>Keyword: <span style={{ color: 'var(--fh-t2)' }}>{keyword}</span></div>}
              {category && category !== 'all' && <div>Category: <span style={{ color: 'var(--fh-t2)' }}>{category}</span></div>}
              {urgentOnly && <div style={{ color: '#e5484d' }}>Urgent only</div>}
              {!keyword && (!category || category === 'all') && !urgentOnly && (
                <span style={{ color: 'var(--fh-t4)' }}>All open orders</span>
              )}
            </div>

            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder="Name this search…"
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
              style={{
                width: '100%', padding: '8px 10px', borderRadius: '7px',
                background: 'var(--fh-canvas)', border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t1)', fontSize: '12px', outline: 'none',
                marginBottom: error ? '6px' : '10px',
              }}
            />

            {error && <p style={{ fontSize: '11px', color: '#e5484d', marginBottom: '8px' }}>{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving || saved}
              style={{
                width: '100%', padding: '8px', borderRadius: '7px',
                background: saved ? '#27a644' : '#5e6ad2',
                color: '#fff', fontSize: '12px', fontWeight: 590,
                border: 'none', cursor: saving ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                transition: 'background 0.2s',
              }}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              {saved ? 'Saved!' : 'Save search'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
