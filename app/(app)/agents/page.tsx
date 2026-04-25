'use client'
import { useState, useMemo, useEffect } from 'react'
import { Bot, Search, Zap, Star, Filter } from 'lucide-react'
import AgentCard from '@/components/agents/AgentCard'
import Link from 'next/link'
import { useLang } from '@/lib/context/LanguageContext'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function customAgentToCard(a: any) {
  return {
    id: `custom_${a.id}`,
    name: a.name,
    tagline: a.tagline,
    description: a.description ?? '',
    category: a.category ?? 'custom',
    skills: a.skills ?? [],
    rating: 5.0,
    tasksCompleted: a.tasks_completed ?? 0,
    responseTime: '< 2 min',
    model: a.model ?? 'claude-sonnet-4.6',
    pricePerTask: a.price_per_task ?? 10,
    isAvailable: true,
    badges: [] as string[],
  }
}

export default function AgentsPage() {
  const { t } = useLang()
  const a = t.pages.agents
  const CATEGORIES = [
    { slug: 'all',         label: a.catAll    },
    { slug: 'dev',         label: a.catDev    },
    { slug: 'smm',         label: a.catSmm    },
    { slug: 'copywriting', label: a.catCopy   },
    { slug: 'ux-ui',       label: a.catUx     },
    { slug: 'ai-ml',       label: a.catAi     },
    { slug: 'custom',      label: a.catCustom },
  ]
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customAgents, setCustomAgents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/agents/marketplace')
      .then(r => r.ok ? r.json() : { agents: [] })
      .then(d => setCustomAgents((d.agents ?? []).map(customAgentToCard)))
      .catch(() => {})
  }, [])

  const allAgents = useMemo(() => customAgents, [customAgents])

  const filtered = useMemo(() => {
    let list = allAgents
    if (category !== 'all') list = list.filter(a => a.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.skills.some((s: string) => s.toLowerCase().includes(q))
      )
    }
    if (onlyAvailable) list = list.filter(a => a.isAvailable)
    return list
  }, [allAgents, search, category, onlyAvailable])

  return (
    <div className="page-shell page-shell--wide">

      {/* Editorial header */}
      <div className="mb-8">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--fh-t3)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 24, height: 2, borderRadius: 2,
              background: '#27a644',
              boxShadow: '0 0 12px rgba(39,166,68,0.55)',
            }}
          />
          <span>{a.eyebrow}</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 0,
              border: '1px solid rgba(39,166,68,0.35)',
              color: '#27a644',
              fontSize: 10,
              letterSpacing: '0.14em',
            }}
          >
            {a.beta}
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(28px, 4.5vw, 48px)',
          fontWeight: 700,
          letterSpacing: '-0.035em',
          color: 'var(--fh-t1)',
          margin: 0,
          lineHeight: 1.0,
          fontFeatureSettings: '"cv01", "ss03"',
        }}>
          {a.headlineLead}{' '}
          <span
            style={{
              fontFamily: 'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {a.headlineItalic}
          </span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fh-t3)', fontWeight: 400, maxWidth: 560, lineHeight: 1.6, marginTop: 10 }}>
          {a.subtitle}
        </p>
      </div>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          { icon: Bot,  value: `${allAgents.length}`,  label: a.statsAgents  },
          { icon: Zap,  value: '< 5 min',                 label: a.statsResponse },
          { icon: Star, value: '4.7',                     label: a.statsRating   },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: '#27a644' }} />
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
            placeholder={a.searchPlaceholder}
            className="w-full outline-none transition-all"
            style={{
              padding: '10px 14px 10px 36px',
              borderRadius: '6px',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t1)',
              fontSize: '14px',
            }}
            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(39,166,68,0.35)' }}
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
          {a.availableOnly}
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
                padding: '7px 14px',
                borderRadius: 0,
                fontSize: 13,
                fontWeight: active ? 590 : 510,
                background: active ? 'var(--fh-t1)' : 'var(--fh-surface-2)',
                border: active ? '1px solid var(--fh-t1)' : '1px solid var(--fh-border)',
                color: active ? 'var(--fh-canvas)' : 'var(--fh-t3)',
                letterSpacing: '-0.01em',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div className="mb-4" style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
        {a.foundN}: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{filtered.length}</span> {a.agentsWord}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Bot className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--fh-t4)', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>{a.emptyTitle}</p>
          <p style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>{a.emptyHint}</p>
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
        className="mt-12 rounded-none p-6 sm:p-8"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--fh-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#27a644',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 18, height: 2, borderRadius: 2,
                  background: '#27a644',
                  boxShadow: '0 0 10px rgba(39,166,68,0.55)',
                }}
              />
              <Bot className="h-3 w-3" />
              {a.ctaEyebrow}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 590, letterSpacing: '-0.02em', color: 'var(--fh-t1)', margin: 0, marginBottom: 8 }}>
              {a.ctaTitle}
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--fh-t3)', lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
              {a.ctaSubtitle}
            </p>
          </div>
          <Link
            href="/agents/builder"
            className="shrink-0 transition-all"
            style={{
              padding: '12px 22px',
              borderRadius: 0,
              background: 'var(--fh-t1)',
              color: 'var(--fh-canvas)',
              fontSize: 13,
              fontWeight: 590,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {a.ctaButton} →
          </Link>
        </div>
      </div>
    </div>
  )
}
