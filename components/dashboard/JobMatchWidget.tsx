'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Loader2, Zap, ArrowRight, RefreshCw, ChevronRight } from 'lucide-react'

interface Match {
  id: string
  score: number
  reason: string
  highlight: string
  order: {
    id: string
    title: string
    category: string
    skills: string[]
    budget_min: number
    budget_max: number
    deadline: string
    is_urgent: boolean
  }
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#27a644' : score >= 60 ? '#5e6ad2' : '#f59e0b'
  return (
    <div style={{
      width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
      background: `conic-gradient(${color} ${score * 3.6}deg, var(--fh-surface-2) 0deg)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'var(--fh-canvas)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color }}>{score}</span>
      </div>
    </div>
  )
}

export default function JobMatchWidget() {
  const [matches, setMatches]   = useState<Match[]>([])
  const [loading, setLoading]   = useState(false)
  const [loaded, setLoaded]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/job-match', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error'); return }
      setMatches(data.matches ?? [])
      setLoaded(true)
    } catch {
      setError('Failed to load. Try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Not loaded yet ───────────────────────────────────────── */
  if (!loaded) {
    return (
      <div
        style={{
          borderRadius: '14px',
          border: '1px solid rgba(113,112,255,0.2)',
          background: 'linear-gradient(135deg, rgba(113,112,255,0.05), rgba(113,112,255,0.02))',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(113,112,255,0.12)', border: '1px solid rgba(113,112,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Sparkles className="h-4 w-4" style={{ color: '#7170ff' }} />
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', margin: 0 }}>
              AI Job Matching
            </p>
            <p style={{ fontSize: '11px', color: 'var(--fh-t4)', margin: 0 }}>
              Finds best orders for your skills
            </p>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '12px', color: '#e5484d', marginBottom: '10px' }}>{error}</p>
        )}

        <button
          onClick={load}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '9px 16px', borderRadius: '8px',
            background: loading ? 'rgba(113,112,255,0.3)' : '#5e6ad2',
            color: '#fff', fontSize: '13px', fontWeight: 590,
            border: 'none', cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analyzing profile…</>
            : <><Sparkles className="h-3.5 w-3.5" /> Find matching orders</>
          }
        </button>
      </div>
    )
  }

  /* ── Loaded: show results ─────────────────────────────────── */
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Sparkles className="h-4 w-4" style={{ color: '#7170ff' }} />
          <span style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>
            Recommended for you
          </span>
          {matches.length > 0 && (
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '4px',
              background: 'rgba(113,112,255,0.1)', color: '#7170ff',
              border: '1px solid rgba(113,112,255,0.2)',
            }}>
              {matches.length} match{matches.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ color: 'var(--fh-t4)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {matches.length === 0 ? (
        <div style={{
          borderRadius: '12px', border: '1px solid var(--fh-border)',
          background: 'var(--fh-surface)', padding: '20px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--fh-t3)', marginBottom: '8px' }}>
            No matching orders found right now
          </p>
          <Link href="/orders" style={{ fontSize: '12px', color: '#7170ff' }}>
            Browse all orders →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {matches.map((m) => (
            <Link
              key={m.order.id}
              href={`/orders/${m.order.id}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '12px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                textDecoration: 'none', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(113,112,255,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--fh-border)')}
            >
              <ScoreRing score={m.score} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px',
                  }}>
                    {m.order.title}
                  </span>
                  {m.order.is_urgent && (
                    <span style={{
                      display: 'flex', alignItems: 'center', gap: '2px',
                      fontSize: '10px', fontWeight: 590, color: '#e5484d',
                      background: 'rgba(229,72,77,0.08)', padding: '1px 6px', borderRadius: '4px',
                      border: '1px solid rgba(229,72,77,0.18)', flexShrink: 0,
                    }}>
                      <Zap className="h-2.5 w-2.5" /> Urgent
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '11px', color: '#7170ff', marginBottom: '3px', fontWeight: 510 }}>
                  {m.reason}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>
                    {m.order.budget_min.toLocaleString()}–{m.order.budget_max.toLocaleString()} ₽
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>·</span>
                  <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>{m.order.deadline}</span>
                  {m.highlight && (
                    <>
                      <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>·</span>
                      <span style={{ fontSize: '11px', color: 'var(--fh-t3)', fontStyle: 'italic' }}>{m.highlight}</span>
                    </>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
            </Link>
          ))}

          <Link
            href="/orders"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              padding: '9px', borderRadius: '10px',
              border: '1px dashed var(--fh-border)', color: 'var(--fh-t4)',
              fontSize: '12px', textDecoration: 'none', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#7170ff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fh-t4)')}
          >
            Browse all orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
