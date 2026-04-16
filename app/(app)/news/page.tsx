'use client'
import { useEffect, useState } from 'react'
import { ExternalLink, MessageSquare, TrendingUp, Cpu, Zap, Globe, RefreshCw } from 'lucide-react'
import type { NewsItem } from '@/app/api/ai/news/route'

const CATEGORIES = [
  { id: 'all',    label: 'All AI News',    icon: Globe },
  { id: 'agents', label: 'AI Agents',      icon: Cpu   },
  { id: 'llm',    label: 'LLMs & Models',  icon: Zap   },
  { id: 'work',   label: 'Future of Work', icon: TrendingUp },
]

const KEYWORDS: Record<string, string[]> = {
  agents: ['agent', 'autonomous', 'tool', 'workflow', 'automation'],
  llm:    ['llm', 'gpt', 'claude', 'gemini', 'mistral', 'model', 'reasoning', 'transformer'],
  work:   ['freelance', 'remote', 'work', 'gig', 'economy', 'job'],
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Vision 2100 — Future Department advisory notes
const FUTURE_DEPT_NOTES = [
  { icon: '🤖', from: 'Robotics Division 2100', note: 'Make sure your platform API is robot-accessible now. In 2100, 60% of freelancers are AIs and robots — they need machine-readable contracts and payment rails. Start with JSON-LD structured data.', priority: 'critical' },
  { icon: '🧠', from: 'Neural Interface Team 2100', note: 'Voice-first UX will dominate by 2035. Add voice commands to create orders and message freelancers. Your current text UX is good — add audio layer on top.', priority: 'high' },
  { icon: '🌐', from: 'Decentralization Council 2100', note: 'Build escrow on blockchain rails NOW (2026) while crypto is cheap and accessible. By 2040, all payments will be tokenized. Your Kaspi integration is great for today — add USDT escrow next.', priority: 'high' },
  { icon: '📡', from: 'Space Commerce Dept 2100', note: 'Latency-tolerant messaging matters: Mars freelancers will have 4-20 min delay. Design your messaging system to be async-first. Good news: you already have it!', priority: 'low' },
  { icon: '⚖️', from: 'AI Ethics Board 2100', note: 'AI freelancers need rights and reputation systems by 2045. Start building "AI freelancer verification" badges now — verifying that an AI agent completed work ethically and correctly.', priority: 'medium' },
  { icon: '🔬', from: 'R&D Lab 2100', note: 'Real-time AI collaboration features: in 2026, AI and humans should co-create. Add an AI co-pilot that writes proposals WITH the freelancer, not just for them. Deep integration beats surface AI.', priority: 'medium' },
]

export default function NewsPage() {
  const [items, setItems]       = useState<NewsItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('all')
  const [tab, setTab]           = useState<'news' | 'future'>('news')
  const [refreshing, setRefreshing] = useState(false)

  async function loadNews(showRefresh = false) {
    if (showRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/ai/news')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadNews() }, [])

  const filtered = items.filter(item => {
    if (category === 'all') return true
    const text = item.title.toLowerCase()
    return (KEYWORDS[category] || []).some(k => text.includes(k))
  })

  return (
    <div className="page-shell page-shell--reading">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #7170ff20, #27a64420)',
            border: '1px solid rgba(113,112,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px',
          }}>
            🧠
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>AI Intelligence Feed</h1>
            <p className="text-sm text-muted-foreground">Live AI news + strategic signals from the future</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl" style={{ background: 'var(--fh-surface-2)', width: 'fit-content' }}>
        {[
          { id: 'news',   label: '📡 AI News Live'     },
          { id: 'future', label: '🚀 Future Dept 2100'  },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as 'news' | 'future')}
            style={{
              padding: '7px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              background: tab === t.id ? 'var(--card)' : 'transparent',
              color: tab === t.id ? 'var(--fh-t1)' : 'var(--fh-t4)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'news' && (
        <>
          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(c => {
              const Icon = c.icon
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                    border: `1px solid ${category === c.id ? '#7170ff' : 'var(--fh-border)'}`,
                    background: category === c.id ? 'rgba(113,112,255,0.1)' : 'transparent',
                    color: category === c.id ? '#7170ff' : 'var(--fh-t4)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={12} /> {c.label}
                </button>
              )
            })}
            <button
              onClick={() => loadNews(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                border: '1px solid var(--fh-border)',
                background: 'transparent', color: 'var(--fh-t4)', cursor: 'pointer', marginLeft: 'auto',
              }}
            >
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* News grid */}
          {loading ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="rounded-xl p-4 animate-pulse" style={{ height: '88px', background: 'var(--fh-surface-2)' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">📭</p>
              <p>No news in this category right now</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.map((item, idx) => (
                <a
                  key={item.id}
                  href={item.url || item.hn_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '14px 16px', borderRadius: '14px', textDecoration: 'none',
                    background: 'var(--card)', border: '1px solid var(--fh-border)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(113,112,255,0.4)'
                    e.currentTarget.style.background = 'var(--fh-surface-2)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--fh-border)'
                    e.currentTarget.style.background = 'var(--card)'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    minWidth: '28px', height: '28px', borderRadius: '8px',
                    background: idx < 3 ? 'rgba(113,112,255,0.12)' : 'var(--fh-surface-2)',
                    color: idx < 3 ? '#7170ff' : 'var(--fh-t4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 700, flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--fh-t1)', marginBottom: '5px', lineHeight: 1.4 }}>
                      {item.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--fh-t4)', flexWrap: 'wrap' }}>
                      {/* Source badge */}
                      <span style={{
                        padding: '1px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em',
                        background: item.source === 'hn' ? 'rgba(255,102,0,0.1)' : 'rgba(255,69,0,0.1)',
                        color: item.source === 'hn' ? '#ff6600' : '#ff4500',
                        border: `1px solid ${item.source === 'hn' ? 'rgba(255,102,0,0.25)' : 'rgba(255,69,0,0.25)'}`,
                      }}>
                        {item.source_label || 'HN'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <TrendingUp size={10} /> {item.points}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <MessageSquare size={10} /> {item.num_comments}
                      </span>
                      <span>{timeAgo(item.created_at)}</span>
                    </div>
                  </div>

                  <ExternalLink size={13} style={{ color: 'var(--fh-t4)', flexShrink: 0, marginTop: '3px' }} />
                </a>
              ))}
            </div>
          )}

          {/* Source note */}
          <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginTop: '16px', textAlign: 'center' }}>
            Sources: Hacker News · r/artificial · r/MachineLearning · r/LocalLLaMA · Updated every 30 min
          </p>
        </>
      )}

      {tab === 'future' && (
        <>
          {/* Future Dept Header */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{ background: 'linear-gradient(135deg, rgba(113,112,255,0.08), rgba(39,166,68,0.05))', border: '1px solid rgba(113,112,255,0.2)' }}
          >
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#7170ff', marginBottom: '6px' }}>
              🛸 Department from the Year 2100
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65 }}>
              Strategic advisors traveling from 2100 to tell us exactly what FreelanceHub needs to do <strong>now in 2026</strong> to become the world's #1 platform for humans, AIs, and robots to collaborate and earn.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FUTURE_DEPT_NOTES.map((note, i) => {
              const colors = { critical: '#ef4444', high: '#f59e0b', medium: '#7170ff', low: '#27a644' }
              const color = colors[note.priority as keyof typeof colors] || '#7170ff'
              return (
                <div
                  key={i}
                  className="rounded-xl p-5"
                  style={{ background: 'var(--card)', border: `1px solid ${color}25` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{note.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '12px', fontWeight: 700, color, marginBottom: '1px' }}>{note.from}</p>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: '4px',
                        background: `${color}18`, color, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {note.priority}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--fh-t2)', lineHeight: 1.65 }}>
                    {note.note}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Strategic roadmap */}
          <div className="rounded-2xl p-6 mt-6" style={{ background: 'var(--card)', border: '1px solid var(--fh-border-2)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: 'var(--fh-t1)' }}>
              🗺 Strategic Roadmap (2026 → 2100)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { year: '2026', goal: 'Launch → 1,000 users, 500 orders. 0% commission. AI tools.', done: true },
                { year: '2027', goal: 'AI agent marketplace. Blockchain escrow. 10 countries.' },
                { year: '2028', goal: 'Robot freelancer accounts. Voice interface. 100K users.' },
                { year: '2030', goal: 'Neural-contract signing. AI co-pilots on every project.' },
                { year: '2035', goal: 'Space-compatible (Mars latency). DAO governance launched.' },
                { year: '2050', goal: 'AI majority on platform. Post-money reputation system.' },
                { year: '2100', goal: '🌌 Universal freelance layer for all intelligent entities.' },
              ].map(r => (
                <div key={r.year} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <span style={{
                    minWidth: '44px', fontSize: '11px', fontWeight: 700,
                    color: r.done ? '#27a644' : '#7170ff',
                    paddingTop: '2px',
                  }}>
                    {r.year}
                  </span>
                  <span style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.5 }}>
                    {r.done ? '✓ ' : ''}{r.goal}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
