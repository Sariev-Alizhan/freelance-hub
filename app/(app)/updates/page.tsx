import type { Metadata } from 'next'
import { CheckCircle2, Clock, Map, Rocket, Target, Zap, TrendingUp, Shield, Star } from 'lucide-react'
import { CURRENT_RELEASE, RELEASE_HISTORY } from '@/lib/company-report'

export const metadata: Metadata = {
  title: 'Updates & Roadmap — FreelanceHub',
  description: 'Follow the development of FreelanceHub — what we shipped, what we\'re building, and where we\'re going.',
  openGraph: {
    title: 'Updates & Roadmap — FreelanceHub',
    description: 'Transparent roadmap and changelog of the FreelanceHub platform.',
    type: 'website',
  },
  alternates: { canonical: '/updates' },
}

// ── Vision items ─────────────────────────────────────────────
const VISION = [
  {
    icon: Target,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    border: 'rgba(39,166,68,0.2)',
    title: 'Our mission',
    text: 'Build the #1 freelance platform in Central Asia — transparent, AI-powered, and built for the CIS market.',
  },
  {
    icon: Shield,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    border: 'rgba(39,166,68,0.2)',
    title: 'Safe deals',
    text: 'Milestone escrow, reviews, verified profiles — so every deal ends fairly for both sides.',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    title: 'AI-first',
    text: 'AI agents write posts, landing pages, proposals, and match the best freelancers to each order automatically.',
  },
  {
    icon: TrendingUp,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    title: 'Built in public',
    text: 'We ship weekly. Every feature is listed here. You can follow — and influence — what we build next.',
  },
]

// ── Global roadmap ────────────────────────────────────────────
const GLOBAL_ROADMAP = [
  {
    quarter: 'Now',
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    border: 'rgba(39,166,68,0.2)',
    items: [
      '⭐ Reviews & Ratings — bidirectional after order completion',
      '💳 Escrow payments — client deposits, platform holds, releases on approval',
      '8% platform commission — revenue model launch',
    ],
  },
  {
    quarter: 'Q2 2026',
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    border: 'rgba(39,166,68,0.2)',
    items: [
      '🔍 SEO pages — /freelancers/almaty, /freelancers/developer',
      '🤖 Smart matching — AI picks top 5 freelancers per order',
      '🏢 Company accounts — team seats, shared dashboard',
      '📊 Freelancer analytics — profile views, conversion rate',
    ],
  },
  {
    quarter: 'Q3 2026',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    items: [
      '🆔 ID verification — KZ passport / IIN check',
      '⚖️ Dispute resolution — 72h arbitration window',
      '📱 Mobile app — iOS & Android',
      '🌍 Multi-language — KZ, RU, EN fully supported',
    ],
  },
  {
    quarter: 'Vision',
    color: '#e879f9',
    bg: 'rgba(232,121,249,0.08)',
    border: 'rgba(232,121,249,0.2)',
    items: [
      '🏦 FreelanceHub Pay — built-in wallet, instant payouts',
      '📚 Skills marketplace — courses and certificates on the platform',
      '🤝 Agency accounts — manage multiple freelancers under one brand',
      '🌐 Expansion — Uzbekistan, Kyrgyzstan, Azerbaijan',
    ],
  },
]

export default function UpdatesPage() {
  const rel = CURRENT_RELEASE

  // Aggregate all done items across departments
  const allShipped = rel.reports.flatMap(d =>
    d.done.map(item => ({ dept: d.department, emoji: d.emoji, color: d.color, item }))
  )

  // Aggregate in-progress across departments
  const allInProgress = rel.reports.flatMap(d =>
    d.inProgress.map(item => ({ dept: d.department, emoji: d.emoji, color: d.color, item }))
  )

  return (
    <div className="page-shell page-shell--reading">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="mb-16 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full mb-6 px-4 py-1.5"
          style={{ background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.2)' }}
        >
          <Rocket className="h-3.5 w-3.5" style={{ color: '#27a644' }} />
          <span style={{ fontSize: '12px', fontWeight: 590, color: '#27a644', letterSpacing: '0.04em' }}>
            BUILT IN PUBLIC
          </span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 510,
            letterSpacing: '-0.04em',
            color: 'var(--fh-t1)',
            lineHeight: 1.15,
            marginBottom: '16px',
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          Updates & Roadmap
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--fh-t3)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7, fontWeight: 400 }}>
          We ship every week. Here's what we've built, what we're working on, and where FreelanceHub is going.
        </p>
      </div>

      {/* ── Vision cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
        {VISION.map(v => {
          const Icon = v.icon
          return (
            <div
              key={v.title}
              className="rounded-2xl p-5"
              style={{ background: v.bg, border: `1px solid ${v.border}` }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: v.bg, border: `1px solid ${v.border}` }}
                >
                  <Icon className="h-4 w-4" style={{ color: v.color }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 590, color: v.color }}>{v.title}</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65, fontWeight: 400 }}>
                {v.text}
              </p>
            </div>
          )
        })}
      </div>

      {/* ── Latest release ───────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'var(--fh-sep)' }} />
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" style={{ color: '#fbbf24' }} />
            <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest release
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: 'var(--fh-sep)' }} />
        </div>

        {/* Release card */}
        <div
          className="rounded-2xl p-6 mb-6"
          style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
        >
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.2)' }}
            >
              🚀
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="rounded-full text-xs font-bold px-2.5 py-0.5"
                  style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}
                >
                  v{rel.version}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                  {new Date(rel.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {rel.title}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65 }}>
                {rel.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Shipped in this release */}
        <div
          className="rounded-2xl p-5 mb-4"
          style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span style={{ fontSize: '12px', fontWeight: 590, color: '#27a644', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Shipped in this release
            </span>
            <span
              className="ml-auto rounded-full text-[11px] font-bold px-2 py-0.5"
              style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644' }}
            >
              {allShipped.length} features
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allShipped.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="text-sm flex-shrink-0 mt-0.5">{s.emoji}</span>
                <span style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.5 }}>{s.item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* In progress */}
        {allInProgress.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-amber-400" />
              <span style={{ fontSize: '12px', fontWeight: 590, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Currently building
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allInProgress.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-sm flex-shrink-0 mt-0.5">{s.emoji}</span>
                  <span style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.5 }}>{s.item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Global Roadmap ───────────────────────────────────── */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'var(--fh-sep)' }} />
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4" style={{ color: '#27a644' }} />
            <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Roadmap
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: 'var(--fh-sep)' }} />
        </div>

        <div className="space-y-4">
          {GLOBAL_ROADMAP.map(phase => (
            <div
              key={phase.quarter}
              className="rounded-2xl p-5"
              style={{ background: 'var(--fh-surface)', border: `1px solid ${phase.border}` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="rounded-full text-xs font-bold px-3 py-1"
                  style={{ background: phase.bg, color: phase.color, border: `1px solid ${phase.border}` }}
                >
                  {phase.quarter}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Release history ──────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1" style={{ background: 'var(--fh-sep)' }} />
          <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Release history
          </span>
          <div className="h-px flex-1" style={{ background: 'var(--fh-sep)' }} />
        </div>

        <div className="space-y-3">
          {RELEASE_HISTORY.map((r, i) => (
            <div
              key={r.version}
              className="flex items-center gap-4 rounded-xl px-4 py-3"
              style={{
                background: i === 0 ? 'rgba(39,166,68,0.04)' : 'var(--fh-surface)',
                border: i === 0 ? '1px solid rgba(39,166,68,0.15)' : '1px solid var(--fh-border)',
              }}
            >
              <span
                className="text-xs font-bold px-2 py-0.5 rounded"
                style={{
                  background: i === 0 ? 'rgba(39,166,68,0.1)' : 'var(--fh-surface-2)',
                  color: i === 0 ? '#27a644' : 'var(--fh-t4)',
                  fontFamily: 'monospace',
                  minWidth: '52px',
                  textAlign: 'center',
                }}
              >
                v{r.version}
              </span>
              <div className="flex-1 min-w-0">
                <span style={{ fontSize: '13px', fontWeight: 510, color: 'var(--fh-t1)' }}>{r.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--fh-t4)', marginLeft: '8px' }}>{r.summary.slice(0, 80)}…</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--fh-t4)', flexShrink: 0 }}>
                {new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <div
        className="mt-14 rounded-2xl p-8 text-center"
        style={{ background: 'rgba(39,166,68,0.05)', border: '1px solid rgba(39,166,68,0.15)' }}
      >
        <p style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
          Have a feature request?
        </p>
        <p style={{ fontSize: '14px', color: 'var(--fh-t3)', marginBottom: '20px', lineHeight: 1.6 }}>
          We read every message. Your feedback directly shapes what we build next.
        </p>
        <a
          href="https://t.me/zhanmate"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 transition-all"
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            background: '#26a1d1',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 590,
            textDecoration: 'none',
          }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.164 13.72l-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.986.839z"/>
          </svg>
          Write to us on Telegram
        </a>
      </div>

    </div>
  )
}
