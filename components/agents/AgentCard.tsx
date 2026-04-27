'use client'
import Link from 'next/link'
import { Bot, Zap, Star, Clock, CheckCircle } from 'lucide-react'

export interface Agent {
  id: string
  name: string
  tagline: string
  description: string
  category: string
  skills: string[]
  rating: number
  tasksCompleted: number
  responseTime: string
  pricePerTask: number
  currency: string
  isAvailable: boolean
  creator: string
  model: string
  badges?: string[]
}

interface Props { agent: Agent }

export default function AgentCard({ agent: a }: Props) {
  return (
    <Link href={`/agents/${a.id}`}>
      <div
        className="group/card card-hover h-full flex flex-col gap-4 transition-all rounded-xl"
        style={{
          padding: '20px',
          background: 'var(--fh-surface)',
          border: '1px solid rgba(39,166,68,0.2)',
          borderRadius: '10px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle glow top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(39,166,68,0.5), transparent)',
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Robot avatar */}
          <div
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: 44, height: 44,
              background: 'linear-gradient(135deg, rgba(39,166,68,0.15), rgba(39,166,68,0.05))',
              border: '1px solid rgba(39,166,68,0.3)',
            }}
          >
            <Bot className="h-5 w-5" style={{ color: '#27a644' }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="font-medium truncate"
                style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}
              >
                {a.name}
              </span>
              {/* AI badge */}
              <span
                style={{
                  fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
                  padding: '1px 6px', borderRadius: '4px',
                  background: 'rgba(39,166,68,0.12)',
                  border: '1px solid rgba(39,166,68,0.25)',
                  color: '#27a644',
                  textTransform: 'uppercase',
                }}
              >
                🤖 AI
              </span>
            </div>
            <p
              className="truncate mt-0.5"
              style={{ fontSize: '12px', color: 'var(--fh-t3)', fontWeight: 400, letterSpacing: '-0.005em' }}
            >
              {a.tagline}
            </p>
          </div>
        </div>

        {/* Rating & model */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" style={{ color: '#fbbf24', fill: '#fbbf24' }} />
            <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t1)' }}>{a.rating.toFixed(1)}</span>
            <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>({a.tasksCompleted} tasks)</span>
          </div>
          <span
            style={{
              fontSize: '10px', fontWeight: 590, letterSpacing: '0.03em',
              padding: '2px 7px', borderRadius: '4px',
              background: 'rgba(39,166,68,0.08)',
              border: '1px solid rgba(39,166,68,0.2)',
              color: a.isAvailable ? '#27a644' : '#f59e0b',
            }}
          >
            {a.isAvailable ? '● Available' : '● Busy'}
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {a.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: '11px', fontWeight: 510, letterSpacing: '-0.01em',
                padding: '2px 8px', borderRadius: '4px',
                background: 'var(--fh-skill-bg)',
                border: '1px solid var(--fh-skill-bd)',
                color: 'var(--fh-t3)',
              }}
            >
              {skill}
            </span>
          ))}
          {a.skills.length > 4 && (
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px', borderRadius: '4px',
                background: 'var(--fh-skill-bg)',
                border: '1px solid var(--fh-skill-bd)',
                color: 'var(--fh-t4)',
              }}
            >
              +{a.skills.length - 4}
            </span>
          )}
        </div>

        {/* Footer */}
        <div
          className="mt-auto flex items-center justify-between pt-4"
          style={{ borderTop: '1px solid var(--fh-sep)' }}
        >
          <div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--fh-t1)' }}>
              {a.pricePerTask === 0 ? 'Free' : `${a.pricePerTask.toLocaleString()} ₸`}
            </span>
            {a.pricePerTask > 0 && <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}> / task</span>}
          </div>
          <div className="flex items-center gap-1" style={{ color: 'var(--fh-t4)' }}>
            <Zap className="h-3 w-3" style={{ color: '#27a644' }} />
            <span style={{ fontSize: '11px', fontWeight: 400 }}>{a.responseTime}</span>
          </div>
        </div>

        {/* Model label — two lines on narrow cards so creator name doesn't get
            clipped by the parent's overflow:hidden. */}
        <div
          style={{
            fontSize: '10px', color: 'var(--fh-t4)', fontWeight: 400,
            marginTop: '-8px',
            display: 'flex', alignItems: 'center', gap: '6px',
            flexWrap: 'wrap', minWidth: 0,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
            <CheckCircle className="h-2.5 w-2.5 shrink-0" style={{ color: '#27a644' }} />
            <span className="truncate">Powered by {a.model}</span>
          </span>
          <span className="truncate" style={{ color: 'var(--fh-t4)' }}>· by {a.creator}</span>
        </div>
      </div>
    </Link>
  )
}
