'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, Trash2, Loader2, ArrowRight, Bell } from 'lucide-react'

interface SavedSearch {
  id: string
  label: string
  keyword: string | null
  category: string | null
  urgent_only: boolean
  last_checked_at: string
  created_at: string
  new_count: number
}

export default function SavedSearchesWidget() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/saved-searches')
      if (!res.ok) return
      const data = await res.json()
      setSearches(data.searches ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    await fetch('/api/saved-searches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSearches(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  async function handleOpen(s: SavedSearch) {
    // Mark as checked
    if (s.new_count > 0) {
      fetch('/api/saved-searches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id }),
      }).catch(() => {})
      setSearches(prev => prev.map(x => x.id === s.id ? { ...x, new_count: 0 } : x))
    }
  }

  function buildUrl(s: SavedSearch) {
    const p = new URLSearchParams()
    if (s.keyword) p.set('q', s.keyword)
    if (s.category) p.set('cat', s.category)
    if (s.urgent_only) p.set('urgent', '1')
    const qs = p.toString()
    return qs ? `/orders?${qs}` : '/orders'
  }

  const totalNew = searches.reduce((s, x) => s + x.new_count, 0)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Bookmark className="h-4 w-4" style={{ color: 'var(--fh-t3)' }} />
          <span style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>
            Saved searches
          </span>
          {totalNew > 0 && (
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '4px',
              background: 'rgba(39,166,68,0.1)', color: '#27a644',
              border: '1px solid rgba(39,166,68,0.2)',
            }}>
              {totalNew} new
            </span>
          )}
        </div>
        <Link
          href="/orders"
          style={{ fontSize: '12px', color: 'var(--fh-t4)', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#27a644')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fh-t4)')}
        >
          Browse <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--fh-t4)', padding: '12px 0', fontSize: '13px' }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : searches.length === 0 ? (
        <div style={{
          borderRadius: '10px', border: '1px dashed var(--fh-border)',
          padding: '16px', textAlign: 'center',
        }}>
          <Bookmark className="h-6 w-6 mx-auto mb-2" style={{ color: 'var(--fh-t4)', opacity: 0.4 }} />
          <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '4px' }}>No saved searches</p>
          <p style={{ fontSize: '11px', color: 'var(--fh-t4)', lineHeight: 1.5 }}>
            Go to{' '}
            <Link href="/orders" style={{ color: '#27a644' }}>Orders</Link>
            {' '}and click <strong>Save</strong> next to the filters
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {searches.map(s => (
            <div
              key={s.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px',
                background: s.new_count > 0 ? 'rgba(39,166,68,0.04)' : 'var(--fh-surface)',
                border: s.new_count > 0 ? '1px solid rgba(39,166,68,0.18)' : '1px solid var(--fh-border)',
                transition: 'border-color 0.15s',
              }}
            >
              {/* Bell icon with badge */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Bell className="h-3.5 w-3.5" style={{ color: s.new_count > 0 ? '#27a644' : 'var(--fh-t4)' }} />
                {s.new_count > 0 && (
                  <span style={{
                    position: 'absolute', top: '-5px', right: '-6px',
                    fontSize: '9px', fontWeight: 700, color: '#fff',
                    background: '#27a644', borderRadius: '50%',
                    width: '14px', height: '14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {s.new_count > 9 ? '9+' : s.new_count}
                  </span>
                )}
              </div>

              {/* Label + filters */}
              <Link
                href={buildUrl(s)}
                onClick={() => handleOpen(s)}
                style={{ flex: 1, minWidth: 0, textDecoration: 'none' }}
              >
                <p style={{
                  fontSize: '13px', fontWeight: 590,
                  color: s.new_count > 0 ? '#27a644' : 'var(--fh-t1)',
                  marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>
                  {[
                    s.keyword && `"${s.keyword}"`,
                    s.category && s.category,
                    s.urgent_only && 'urgent',
                  ].filter(Boolean).join(' · ') || 'All orders'}
                </p>
              </Link>

              {/* Delete */}
              <button
                onClick={() => handleDelete(s.id)}
                disabled={deleting === s.id}
                style={{
                  flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--fh-t4)', display: 'flex', padding: '2px',
                  opacity: 0.5, transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#e5484d' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '0.5'; e.currentTarget.style.color = 'var(--fh-t4)' }}
              >
                {deleting === s.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Trash2 className="h-3.5 w-3.5" />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
