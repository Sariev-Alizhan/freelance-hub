'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Quote, ArrowLeft, Loader2, Check, X, Eye, EyeOff, Trash2, Briefcase,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

type Status = 'pending' | 'approved' | 'hidden' | 'declined'

interface Rec {
  id:           string
  author_id:    string
  author_title: string | null
  relationship: string
  body:         string
  status:       Status
  created_at:   string
  author: {
    full_name:   string
    username:    string | null
    avatar_url:  string | null
    is_verified: boolean
  } | null
}

const RELATIONSHIP_LABEL: Record<string, string> = {
  client:    'Worked as client',
  colleague: 'Worked together',
  manager:   'Managed them',
  report:    'Reported to them',
  other:     'Worked together',
}

export default function RecommendationsPage() {
  const { user, loading: userLoading } = useUser()
  const [recs, setRecs]       = useState<Rec[]>([])
  const [tab, setTab]         = useState<Status>('pending')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user) return
    const r = await fetch(`/api/recommendations?recipient_id=${user.id}&status=all`, { cache: 'no-store' })
    const d = await r.json()
    setRecs(d.recommendations ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!userLoading && user) reload()
    if (!userLoading && !user) setLoading(false)
  }, [user, userLoading, reload])

  async function moderate(id: string, status: Status) {
    setBusy(id)
    try {
      await fetch(`/api/recommendations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      await reload()
    } finally { setBusy(null) }
  }

  async function remove(id: string) {
    if (!confirm('Delete this recommendation?')) return
    setBusy(id)
    try {
      await fetch(`/api/recommendations/${id}`, { method: 'DELETE' })
      await reload()
    } finally { setBusy(null) }
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
        Please <Link href="/login" style={{ color: 'var(--fh-primary)' }}>log in</Link>.
      </div>
    )
  }

  const counts: Record<Status, number> = {
    pending:  recs.filter(r => r.status === 'pending').length,
    approved: recs.filter(r => r.status === 'approved').length,
    hidden:   recs.filter(r => r.status === 'hidden').length,
    declined: recs.filter(r => r.status === 'declined').length,
  }

  const filtered = recs.filter(r => r.status === tab)

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
            Recommendations
          </h1>
          <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: '2px 0 0' }}>
            Approve what goes on your public profile.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 2, marginBottom: 16,
        borderBottom: '1px solid var(--fh-border)',
      }}>
        {(['pending','approved','hidden','declined'] as Status[]).map(s => (
          <button key={s}
            onClick={() => setTab(s)}
            style={{
              padding: '10px 14px', border: 'none', background: 'transparent',
              fontSize: 13, fontWeight: tab === s ? 600 : 510, cursor: 'pointer',
              color: tab === s ? 'var(--fh-t1)' : 'var(--fh-t4)',
              borderBottom: tab === s ? '2px solid var(--fh-primary)' : '2px solid transparent',
              textTransform: 'capitalize',
            }}>
            {s} {counts[s] > 0 && <span style={{ color: 'var(--fh-t4)', fontWeight: 500 }}>({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{
          padding: 32, borderRadius: 12, textAlign: 'center',
          background: 'var(--fh-surface)', border: '1px dashed var(--fh-border-2)',
        }}>
          <Quote size={26} style={{ color: 'var(--fh-t4)', marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)' }}>
            {tab === 'pending'
              ? 'No recommendations waiting'
              : `No ${tab} recommendations`}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
            {tab === 'pending'
              ? 'Ask a past client to write one — share your profile link.'
              : tab === 'approved'
                ? 'Once approved, recommendations show up on your public profile.'
                : null}
          </p>
        </div>
      )}

      {/* Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(rec => (
          <div key={rec.id} style={{
            padding: 16, borderRadius: 12,
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
              {rec.author?.avatar_url ? (
                <Image src={rec.author.avatar_url} alt={rec.author.full_name}
                  width={40} height={40} unoptimized
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700,
                }}>
                  {rec.author?.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)' }}>
                  {rec.author?.full_name ?? 'A user'}
                </p>
                {rec.author_title && (
                  <p style={{ margin: '1px 0 0', fontSize: 12, color: 'var(--fh-t3)' }}>
                    {rec.author_title}
                  </p>
                )}
                <p style={{
                  margin: '4px 0 0', fontSize: 11, color: 'var(--fh-t4)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  <Briefcase size={10} />
                  {RELATIONSHIP_LABEL[rec.relationship] ?? 'Worked together'}
                </p>
              </div>
            </div>

            <p style={{
              margin: 0, fontSize: 13, color: 'var(--fh-t2)', lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {rec.body}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {rec.status !== 'approved' && (
                <ActionBtn onClick={() => moderate(rec.id, 'approved')} disabled={busy === rec.id}
                  color="#10b981" icon={<Check size={13} />}>Approve</ActionBtn>
              )}
              {rec.status === 'approved' && (
                <ActionBtn onClick={() => moderate(rec.id, 'hidden')} disabled={busy === rec.id}
                  icon={<EyeOff size={13} />}>Hide</ActionBtn>
              )}
              {rec.status === 'hidden' && (
                <ActionBtn onClick={() => moderate(rec.id, 'approved')} disabled={busy === rec.id}
                  color="#10b981" icon={<Eye size={13} />}>Show</ActionBtn>
              )}
              {rec.status === 'pending' && (
                <ActionBtn onClick={() => moderate(rec.id, 'declined')} disabled={busy === rec.id}
                  icon={<X size={13} />}>Decline</ActionBtn>
              )}
              <ActionBtn onClick={() => remove(rec.id)} disabled={busy === rec.id}
                color="#f87171" icon={<Trash2 size={13} />}>Delete</ActionBtn>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActionBtn({
  onClick, disabled, color, icon, children,
}: {
  onClick: () => void
  disabled?: boolean
  color?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 12px', borderRadius: 8,
        background: 'var(--fh-surface-2)',
        color: color ?? 'var(--fh-t2)',
        border: '1px solid var(--fh-border)',
        fontSize: 12, fontWeight: 590, cursor: disabled ? 'wait' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 5,
      }}
    >
      {icon} {children}
    </button>
  )
}
