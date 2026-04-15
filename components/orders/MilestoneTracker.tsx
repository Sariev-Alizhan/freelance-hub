'use client'
import { useState } from 'react'
import { CheckCircle, Circle, ChevronRight, Loader2 } from 'lucide-react'

const STEPS = [
  { key: 'not_started', label: 'Not started', color: '#62666d',  bg: 'rgba(98,102,109,0.1)',  border: 'rgba(98,102,109,0.25)'  },
  { key: 'in_progress', label: 'In progress',  color: '#3b82f6',  bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)'  },
  { key: 'review',      label: 'Review',        color: '#f59e0b',  bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
  { key: 'done',        label: 'Done',           color: '#27a644',  bg: 'rgba(39,166,68,0.1)',   border: 'rgba(39,166,68,0.25)'   },
] as const

type StepKey = (typeof STEPS)[number]['key']

interface Props {
  orderId: string
  initialStatus: string
  canEdit: boolean
}

export default function MilestoneTracker({ orderId, initialStatus, canEdit }: Props) {
  const [status,  setStatus]  = useState<StepKey>((initialStatus || 'not_started') as StepKey)
  const [loading, setLoading] = useState(false)

  const currentIdx = STEPS.findIndex(s => s.key === status)
  const nextStep   = currentIdx < STEPS.length - 1 ? STEPS[currentIdx + 1] : null

  async function moveTo(key: StepKey) {
    if (!canEdit || loading || key === status) return
    setLoading(true)
    try {
      const r = await fetch(`/api/orders/${orderId}/progress`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ progress_status: key }),
      })
      if (r.ok) setStatus(key)
    } catch {
      // silent — status stays the same
    } finally {
      setLoading(false)
    }
  }

  const current = STEPS[currentIdx]

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
          Progress
        </h2>
        <span
          className="flex items-center gap-1 rounded-full"
          style={{ padding: '2px 10px', background: current.bg, border: `1px solid ${current.border}`, fontSize: '11px', fontWeight: 590, color: current.color }}
        >
          {current.label}
        </span>
      </div>

      {/* Step rail */}
      <div className="flex items-start mb-5">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIdx
          const isCurrent   = idx === currentIdx

          return (
            <div key={step.key} className="flex items-start flex-1 last:flex-none">
              <button
                onClick={() => moveTo(step.key)}
                disabled={!canEdit || loading || step.key === status}
                className="flex flex-col items-center gap-1.5 w-full group"
                style={{ cursor: canEdit && step.key !== status ? 'pointer' : 'default' }}
              >
                {/* Icon */}
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: isCurrent ? step.color : isCompleted ? 'rgba(39,166,68,0.12)' : 'var(--fh-surface-2)',
                    border: isCurrent
                      ? `2px solid ${step.color}`
                      : isCompleted
                      ? '2px solid rgba(39,166,68,0.3)'
                      : '2px solid var(--fh-border-2)',
                    boxShadow: isCurrent ? `0 0 0 3px ${step.color}18` : 'none',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" style={{ color: '#27a644' }} />
                  ) : isCurrent ? (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" style={{ color: 'var(--fh-border-2)' }} />
                  )}
                </div>

                {/* Label */}
                <span style={{
                  fontSize: '10px',
                  fontWeight: isCurrent ? 590 : 400,
                  color: isCurrent ? step.color : isCompleted ? '#27a644' : 'var(--fh-t4)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                }}>
                  {step.label}
                </span>
              </button>

              {/* Connector */}
              {idx < STEPS.length - 1 && (
                <div
                  className="mt-3.5 flex-1 h-0.5 mx-1"
                  style={{ background: idx < currentIdx ? 'rgba(39,166,68,0.4)' : 'var(--fh-border-2)', minWidth: '12px' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Action */}
      {canEdit && (
        <div className="flex items-center gap-2 flex-wrap pt-4" style={{ borderTop: '1px solid var(--fh-sep)' }}>
          {nextStep && (
            <button
              onClick={() => moveTo(nextStep.key)}
              disabled={loading}
              className="flex items-center gap-1.5 transition-all disabled:opacity-50"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: nextStep.bg,
                border: `1px solid ${nextStep.border}`,
                color: nextStep.color,
                fontSize: '12px',
                fontWeight: 590,
              }}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <ChevronRight className="h-3.5 w-3.5" />
              }
              Move to {nextStep.label}
            </button>
          )}

          {/* Jump to any stage */}
          {STEPS.filter(s => s.key !== status && s !== nextStep).map(step => (
            <button
              key={step.key}
              onClick={() => moveTo(step.key)}
              disabled={loading}
              className="text-xs transition-all disabled:opacity-50"
              style={{
                padding: '5px 10px',
                borderRadius: '5px',
                background: 'var(--fh-surface-2)',
                border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t4)',
                fontWeight: 510,
              }}
            >
              {step.label}
            </button>
          ))}
        </div>
      )}

      {!canEdit && (
        <p style={{ fontSize: '11px', color: 'var(--fh-t4)', paddingTop: '4px' }}>
          Only the client and freelancer can update the progress.
        </p>
      )}
    </div>
  )
}
