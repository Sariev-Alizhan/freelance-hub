'use client'
import { useState } from 'react'
import { X, Loader2, Check } from 'lucide-react'

type Relationship = 'client' | 'colleague' | 'manager' | 'report' | 'other'

const RELATIONSHIP_OPTS: { value: Relationship; label: string }[] = [
  { value: 'client',    label: 'Hired them as a client' },
  { value: 'colleague', label: 'Worked together as colleagues' },
  { value: 'manager',   label: 'Managed them' },
  { value: 'report',    label: 'They managed me' },
  { value: 'other',     label: 'Other' },
]

export default function WriteRecommendationModal({
  recipientId, recipientName, onClose, onSuccess,
}: {
  recipientId:   string
  recipientName: string
  onClose:       () => void
  onSuccess?:    () => void
}) {
  const [relationship, setRelationship] = useState<Relationship>('client')
  const [authorTitle, setAuthorTitle]   = useState('')
  const [body, setBody]                 = useState('')
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [done, setDone]                 = useState(false)

  async function submit() {
    setError('')
    if (body.trim().length < 50) { setError('At least 50 characters'); return }
    if (body.trim().length > 2000) { setError('Max 2000 characters'); return }
    setSaving(true)
    try {
      const r = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: recipientId,
          relationship,
          body:         body.trim(),
          author_title: authorTitle.trim() || undefined,
        }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || 'Failed')
      }
      setDone(true)
      onSuccess?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(92vw, 520px)',
          maxHeight: '90dvh', overflowY: 'auto',
          borderRadius: 18,
          background: 'var(--card)',
          border: '1px solid var(--fh-border-2)',
          padding: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
              Recommend {recipientName}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--fh-t4)' }}>
              Your recommendation goes to {recipientName} for review before it&apos;s public.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--fh-t4)', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'var(--fh-primary-muted)', margin: '0 auto 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={24} style={{ color: 'var(--fh-primary)' }} />
            </div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: 'var(--fh-t1)' }}>Sent for review</p>
            <p style={{ margin: '4px 0 18px', fontSize: 13, color: 'var(--fh-t4)' }}>
              {recipientName} will approve or decline it.
            </p>
            <button onClick={onClose}
              style={{
                padding: '10px 22px', borderRadius: 10, border: 'none',
                background: 'var(--fh-primary)', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <Label>How do you know them?</Label>
                <select
                  value={relationship}
                  onChange={e => setRelationship(e.target.value as Relationship)}
                  style={input}
                >
                  {RELATIONSHIP_OPTS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Your role (optional, shown with your name)</Label>
                <input
                  type="text" value={authorTitle}
                  onChange={e => setAuthorTitle(e.target.value)}
                  placeholder="Head of Growth at Yandex"
                  style={input}
                />
              </div>

              <div>
                <Label>Recommendation (50–2000 chars)</Label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={6}
                  placeholder="We hired them to redesign our landing in 2 weeks. They shipped on time, owned edge cases we hadn't flagged, and conversion is up 34% month-over-month…"
                  style={{ ...input, resize: 'vertical', minHeight: 120 }}
                />
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--fh-t4)', textAlign: 'right' }}>
                  {body.trim().length} / 2000
                </p>
              </div>

              {error && <p style={{ margin: 0, fontSize: 12, color: '#f87171' }}>{error}</p>}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={submit} disabled={saving}
                style={{
                  flex: 1, padding: '11px 16px', borderRadius: 10, border: 'none',
                  background: 'var(--fh-primary)', color: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: saving ? 'wait' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {saving ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}
                Send recommendation
              </button>
              <button onClick={onClose} disabled={saving}
                style={{
                  padding: '11px 16px', borderRadius: 10,
                  background: 'var(--fh-surface-2)', color: 'var(--fh-t2)',
                  border: '1px solid var(--fh-border)', fontSize: 14, fontWeight: 510, cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 11, color: 'var(--fh-t4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {children}
    </label>
  )
}

const input: React.CSSProperties = {
  width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 8,
  background: 'var(--fh-canvas)', border: '1px solid var(--fh-border)',
  color: 'var(--fh-t1)', fontSize: 14, fontFamily: 'inherit',
}
