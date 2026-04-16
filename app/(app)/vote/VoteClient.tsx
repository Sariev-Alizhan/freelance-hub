'use client'
import { useState, useEffect, useMemo } from 'react'
import {
  ChevronUp, Rocket, Users, Lightbulb, Clock,
  CheckCircle2, XCircle, TrendingUp, Loader2, Plus, X,
} from 'lucide-react'
import Link from 'next/link'

interface FeatureRequest {
  id:          string
  title:       string
  description: string | null
  category:    string
  votes_count: number
  status:      string
  admin_note:  string | null
  created_at:  string
  hasVoted:    boolean
}

const CATEGORIES = [
  { slug: 'all',      label: 'All' },
  { slug: 'general',  label: 'General' },
  { slug: 'ai',       label: 'AI' },
  { slug: 'payments', label: 'Payments' },
  { slug: 'mobile',   label: 'Mobile' },
  { slug: 'ux',       label: 'UX / Design' },
  { slug: 'api',      label: 'API' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  proposed:    { label: 'Proposed',    color: '#7170ff', bg: 'rgba(113,112,255,0.08)', border: 'rgba(113,112,255,0.2)', icon: Lightbulb  },
  planned:     { label: 'Planned',     color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',  icon: Clock       },
  in_progress: { label: 'Building',   color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)',  icon: TrendingUp  },
  done:        { label: 'Shipped',     color: '#27a644', bg: 'rgba(39,166,68,0.08)',  border: 'rgba(39,166,68,0.2)',   icon: CheckCircle2 },
  rejected:    { label: 'Declined',   color: '#62666d', bg: 'rgba(98,102,109,0.08)', border: 'rgba(98,102,109,0.2)',  icon: XCircle     },
}

const STATUS_FILTERS = [
  { slug: 'all',         label: 'All' },
  { slug: 'proposed',    label: 'Proposed' },
  { slug: 'planned',     label: 'Planned' },
  { slug: 'in_progress', label: 'Building' },
  { slug: 'done',        label: 'Shipped' },
]

export default function VoteClient() {
  const [requests,    setRequests]    = useState<FeatureRequest[]>([])
  const [isLoggedIn,  setIsLoggedIn]  = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [voting,      setVoting]      = useState<string | null>(null)
  const [category,    setCategory]    = useState('all')
  const [statusFilter,setStatusFilter]= useState('all')
  const [showForm,    setShowForm]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'general' })

  useEffect(() => {
    fetch('/api/vote')
      .then(r => r.ok ? r.json() : { requests: [], isLoggedIn: false })
      .then(d => { setRequests(d.requests ?? []); setIsLoggedIn(d.isLoggedIn) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function toggleVote(id: string) {
    if (!isLoggedIn || voting) return
    setVoting(id)
    try {
      const r = await fetch(`/api/vote/${id}`, { method: 'POST' })
      const d = await r.json()
      setRequests(prev => prev.map(req =>
        req.id === id
          ? { ...req, hasVoted: d.voted, votes_count: req.votes_count + (d.voted ? 1 : -1) }
          : req
      ))
    } finally {
      setVoting(null)
    }
  }

  async function submitIdea() {
    if (!form.title.trim() || submitting) return
    setSubmitting(true)
    try {
      const r = await fetch('/api/vote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (r.ok) {
        const d = await r.json()
        const newReq: FeatureRequest = {
          id:          d.id,
          title:       form.title.trim(),
          description: form.description.trim() || null,
          category:    form.category,
          votes_count: 0,
          status:      'proposed',
          admin_note:  null,
          created_at:  new Date().toISOString(),
          hasVoted:    false,
        }
        setRequests(prev => [newReq, ...prev])
        setForm({ title: '', description: '', category: 'general' })
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = useMemo(() => {
    let list = requests
    if (category !== 'all')     list = list.filter(r => r.category === category)
    if (statusFilter !== 'all') list = list.filter(r => r.status === statusFilter)
    return list
  }, [requests, category, statusFilter])

  const topVoted = useMemo(() => [...requests].sort((a, b) => b.votes_count - a.votes_count).slice(0, 3), [requests])

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="text-center mb-12">
        <div
          className="inline-flex items-center gap-2 rounded-full mb-5 px-4 py-1.5"
          style={{ background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)' }}
        >
          <Users className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
          <span style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff', letterSpacing: '0.05em' }}>
            DEMOCRATIC ROADMAP
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(26px, 5vw, 44px)',
            fontWeight: 510,
            letterSpacing: '-0.04em',
            color: 'var(--fh-t1)',
            lineHeight: 1.15,
            marginBottom: '14px',
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          You decide what we build
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--fh-t3)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
          Vote on ideas. Submit your own. The most-voted features get built first. This is your platform.
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { label: 'Ideas submitted', value: requests.length },
            { label: 'Total votes',     value: requests.reduce((s, r) => s + r.votes_count, 0) },
            { label: 'Being built',     value: requests.filter(r => r.status === 'in_progress').length },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div style={{ fontSize: '22px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 400 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top 3 ─────────────────────────────────────── */}
      {topVoted.length > 0 && (
        <div className="mb-10">
          <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            🔥 Most wanted
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topVoted.map((r, i) => {
              const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.proposed
              return (
                <div
                  key={r.id}
                  className="rounded-xl p-4 flex flex-col gap-2"
                  style={{
                    background: i === 0 ? 'rgba(113,112,255,0.06)' : 'var(--fh-surface)',
                    border: i === 0 ? '1px solid rgba(113,112,255,0.25)' : '1px solid var(--fh-border-2)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: '22px', fontWeight: 700, color: i === 0 ? '#7170ff' : 'var(--fh-t3)', letterSpacing: '-0.03em' }}>
                      #{i + 1}
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                      {r.votes_count}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', lineHeight: 1.4 }}>{r.title}</p>
                  <span
                    className="self-start rounded-full text-[10px] font-bold px-2 py-0.5"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                  >
                    {st.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">

        {/* Category filter */}
        <div className="flex gap-1.5 flex-wrap flex-1">
          {CATEGORIES.map(c => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className="transition-all"
              style={{
                padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 510,
                background: category === c.slug ? '#5e6ad2' : 'var(--fh-surface-2)',
                border: category === c.slug ? '1px solid rgba(113,112,255,0.3)' : '1px solid var(--fh-border)',
                color: category === c.slug ? '#fff' : 'var(--fh-t3)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Submit idea button */}
        {isLoggedIn ? (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 transition-all"
            style={{
              padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 590,
              background: showForm ? 'rgba(229,72,77,0.08)' : '#5e6ad2',
              border: showForm ? '1px solid rgba(229,72,77,0.2)' : 'none',
              color: showForm ? '#e5484d' : '#fff',
            }}
          >
            {showForm ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Plus className="h-3.5 w-3.5" /> Submit idea</>}
          </button>
        ) : (
          <Link
            href="/auth/login?next=/vote"
            className="flex items-center gap-1.5 transition-all"
            style={{ padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 590, background: '#5e6ad2', color: '#fff' }}
          >
            <Plus className="h-3.5 w-3.5" /> Submit idea
          </Link>
        )}
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {STATUS_FILTERS.map(s => (
          <button
            key={s.slug}
            onClick={() => setStatusFilter(s.slug)}
            className="transition-all"
            style={{
              padding: '4px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: 510,
              background: statusFilter === s.slug ? 'rgba(113,112,255,0.1)' : 'transparent',
              border: statusFilter === s.slug ? '1px solid rgba(113,112,255,0.25)' : '1px solid var(--fh-border)',
              color: statusFilter === s.slug ? '#7170ff' : 'var(--fh-t4)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── Submit form ───────────────────────────────── */}
      {showForm && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(113,112,255,0.04)', border: '1px solid rgba(113,112,255,0.2)' }}
        >
          <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '14px' }}>
            💡 Submit your idea
          </p>
          <div className="space-y-3">
            <input
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Feature title (e.g. Dark mode for mobile)"
              maxLength={100}
              className="w-full outline-none"
              style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)',
              }}
            />
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the problem it solves... (optional)"
              rows={2}
              maxLength={300}
              className="w-full outline-none resize-none"
              style={{
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)',
              }}
            />
            <div className="flex items-center gap-3">
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="outline-none"
                style={{
                  padding: '8px 12px', borderRadius: '6px', fontSize: '12px',
                  background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t2)',
                }}
              >
                {CATEGORIES.filter(c => c.slug !== 'all').map(c => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
              <button
                onClick={submitIdea}
                disabled={!form.title.trim() || submitting}
                className="flex items-center gap-1.5 transition-all disabled:opacity-50"
                style={{
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 590,
                  background: '#5e6ad2', color: '#fff',
                }}
              >
                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feature list ─────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-2" style={{ color: 'var(--fh-t4)' }}>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span style={{ fontSize: '14px' }}>Loading ideas…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p style={{ fontSize: '15px', color: 'var(--fh-t3)' }}>No ideas in this category yet.</p>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '6px' }}>Be the first to submit one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const st = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.proposed
            const StatusIcon = st.icon
            const isVoting = voting === req.id

            return (
              <div
                key={req.id}
                className="flex items-start gap-4 rounded-2xl p-5 transition-all"
                style={{
                  background: req.hasVoted ? 'rgba(113,112,255,0.04)' : 'var(--fh-surface)',
                  border: req.hasVoted ? '1px solid rgba(113,112,255,0.2)' : '1px solid var(--fh-border-2)',
                }}
              >
                {/* Vote button */}
                <button
                  onClick={() => toggleVote(req.id)}
                  disabled={!isLoggedIn || !!voting}
                  className="flex flex-col items-center gap-1 flex-shrink-0 transition-all disabled:opacity-60"
                  title={isLoggedIn ? (req.hasVoted ? 'Remove vote' : 'Vote') : 'Sign in to vote'}
                  style={{
                    padding: '8px 12px', borderRadius: '10px', minWidth: '56px',
                    background: req.hasVoted ? 'rgba(113,112,255,0.12)' : 'var(--fh-surface-2)',
                    border: req.hasVoted ? '1px solid rgba(113,112,255,0.3)' : '1px solid var(--fh-border-2)',
                  }}
                >
                  {isVoting
                    ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#7170ff' }} />
                    : <ChevronUp className="h-4 w-4" style={{ color: req.hasVoted ? '#7170ff' : 'var(--fh-t4)' }} />
                  }
                  <span style={{ fontSize: '14px', fontWeight: 700, color: req.hasVoted ? '#7170ff' : 'var(--fh-t2)', letterSpacing: '-0.02em' }}>
                    {req.votes_count}
                  </span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h3 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
                      {req.title}
                    </h3>
                    <span
                      className="flex items-center gap-1 rounded-full text-[10px] font-bold px-2 py-0.5"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, flexShrink: 0 }}
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {st.label}
                    </span>
                  </div>

                  {req.description && (
                    <p style={{ fontSize: '12px', color: 'var(--fh-t3)', lineHeight: 1.6, marginBottom: '6px' }}>
                      {req.description}
                    </p>
                  )}

                  {req.admin_note && (
                    <div
                      className="mt-2 px-3 py-2 rounded-lg text-xs"
                      style={{ background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.15)', color: '#27a644' }}
                    >
                      📌 Team: {req.admin_note}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded"
                      style={{ background: 'var(--fh-surface-2)', color: 'var(--fh-t4)', border: '1px solid var(--fh-border)' }}
                    >
                      {CATEGORIES.find(c => c.slug === req.category)?.label ?? req.category}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Footer note ──────────────────────────────── */}
      {!isLoggedIn && (
        <div
          className="mt-8 rounded-xl px-5 py-4 flex items-center gap-4"
          style={{ background: 'rgba(113,112,255,0.04)', border: '1px solid rgba(113,112,255,0.15)' }}
        >
          <Users className="h-5 w-5 flex-shrink-0" style={{ color: '#7170ff' }} />
          <div className="flex-1">
            <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '2px' }}>
              Sign in to vote and submit ideas
            </p>
            <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
              Every registered user gets one vote per idea.
            </p>
          </div>
          <Link
            href="/auth/login?next=/vote"
            className="flex-shrink-0 transition-all"
            style={{
              padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 590,
              background: '#5e6ad2', color: '#fff',
            }}
          >
            Sign in
          </Link>
        </div>
      )}
    </div>
  )
}
