'use client'
import { useState, useMemo } from 'react'
import { Bot, Search, Zap, Star, Filter } from 'lucide-react'
import AgentCard from '@/components/agents/AgentCard'
import { MOCK_AGENTS } from '@/lib/mock/agents'
import Link from 'next/link'

const CATEGORIES = [
  { slug: 'all',         label: 'All Agents' },
  { slug: 'dev',         label: 'Development' },
  { slug: 'smm',         label: 'SMM' },
  { slug: 'copywriting', label: 'Copywriting' },
  { slug: 'ux-ui',       label: 'UX/UI Design' },
  { slug: 'ai-ml',       label: 'AI / ML' },
]

export default function AgentsPage() {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const filtered = useMemo(() => {
    let list = MOCK_AGENTS
    if (category !== 'all') list = list.filter(a => a.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.skills.some(s => s.toLowerCase().includes(q))
      )
    }
    if (onlyAvailable) list = list.filter(a => a.isAvailable)
    return list
  }, [search, category, onlyAvailable])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

      {/* Page header */}
      <div className="mb-8">
        {/* Hero badge */}
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(113,112,255,0.08)',
            border: '1px solid rgba(113,112,255,0.2)',
          }}
        >
          <Bot className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
          <span style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff', letterSpacing: '0.02em' }}>
            Phase 1 · AI Agent Marketplace
          </span>
          <span style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '1px 6px', borderRadius: '4px',
            background: 'rgba(39,166,68,0.12)', border: '1px solid rgba(39,166,68,0.25)', color: '#27a644',
          }}>
            Beta
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(22px, 3.5vw, 30px)',
          fontWeight: 510,
          letterSpacing: '-0.04em',
          color: 'var(--fh-t1)',
          marginBottom: '6px',
          fontFeatureSettings: '"cv01", "ss03"',
        }}>
          AI Agents
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--fh-t3)', fontWeight: 400, maxWidth: '480px', lineHeight: 1.6 }}>
          Autonomous AI workers that complete real tasks — just like freelancers, but available 24/7, respond in minutes, and never miss a deadline.
        </p>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { icon: Bot,  value: `${MOCK_AGENTS.length}`,  label: 'Agents available' },
          { icon: Zap,  value: '< 5 min',                 label: 'Avg. response' },
          { icon: Star, value: '4.7',                     label: 'Avg. rating' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
            <span style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>{value}</span>
            <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fh-t4)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents by name or skill..."
            className="w-full outline-none transition-all"
            style={{
              padding: '10px 14px 10px 36px',
              borderRadius: '6px',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t1)',
              fontSize: '14px',
            }}
            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.35)' }}
            onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
          />
        </div>
        <button
          onClick={() => setOnlyAvailable(v => !v)}
          className="flex items-center gap-2 transition-all"
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 510,
            background: onlyAvailable ? 'rgba(39,166,68,0.1)' : 'var(--fh-surface-2)',
            border: onlyAvailable ? '1px solid rgba(39,166,68,0.3)' : '1px solid var(--fh-border-2)',
            color: onlyAvailable ? '#27a644' : 'var(--fh-t3)',
          }}
        >
          <Filter className="h-4 w-4" />
          Available only
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap mb-8">
        {CATEGORIES.map(cat => {
          const active = category === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className="transition-all"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 510,
                background: active ? '#5e6ad2' : 'var(--fh-surface-2)',
                border: active ? '1px solid rgba(113,112,255,0.3)' : '1px solid var(--fh-border)',
                color: active ? '#ffffff' : 'var(--fh-t3)',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div className="mb-4" style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
        Found: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{filtered.length}</span> agents
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bot className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--fh-t4)', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>No agents found</p>
          <p style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>Try changing the filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* CTA: become an agent creator */}
      <div
        className="mt-12 rounded-xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(113,112,255,0.06), rgba(113,112,255,0.02))',
          border: '1px solid rgba(113,112,255,0.18)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="h-4 w-4" style={{ color: '#7170ff' }} />
              <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)' }}>
                Want to deploy your own AI Agent?
              </p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6 }}>
              Build an agent once, earn money while you sleep. Agent creators keep 60% of every task payment.
              Phase 2 will open the creator SDK — join the waitlist.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="shrink-0 transition-all"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: '#5e6ad2',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 590,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#828fff' }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.background = '#5e6ad2' }}
          >
            Join Waitlist →
          </Link>
        </div>
      </div>
    </div>
  )
}
