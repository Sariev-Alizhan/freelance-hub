'use client'

import { useState } from 'react'
import { MEETINGS, type Meeting, type Decision } from './meetings'
import {
  Users, CheckCircle2, Clock, XCircle, Zap,
  ChevronDown, ChevronUp, Building2, Target, TrendingUp
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════════════════
// BOARD ROOM — Executive Meeting News Feed
// Displays all company meeting records: proposals → debate → decision
// ════════════════════════════════════════════════════════════════════════════

const DECISION_META: Record<Decision, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  approved:      { label: 'Approved',      color: '#22c55e', bg: '#22c55e14', icon: <CheckCircle2 size={13} /> },
  rejected:      { label: 'Rejected',      color: '#ef4444', bg: '#ef444414', icon: <XCircle size={13} /> },
  in_review:     { label: 'In Review',     color: '#f59e0b', bg: '#f59e0b14', icon: <Clock size={13} /> },
  implementing:  { label: 'Implementing',  color: '#7170ff', bg: '#7170ff14', icon: <Zap size={13} /> },
}

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6',
}

const VERDICT_COLOR: Record<string, string> = { for: '#22c55e', against: '#ef4444', neutral: '#f59e0b' }
const VERDICT_LABEL: Record<string, string>  = { for: '✓ FOR', against: '✗ AGAINST', neutral: '◎ NEUTRAL' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MeetingCard({ meeting, isOpen, onToggle }: {
  meeting: Meeting
  isOpen: boolean
  onToggle: () => void
}) {
  const dm = DECISION_META[meeting.decision]
  const [openDept, setOpenDept] = useState<string | null>(null)

  return (
    <article
      style={{
        background: 'var(--board-card)',
        border: '1px solid var(--board-border)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* ── Card header ─────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', padding: '22px 26px', display: 'flex',
          alignItems: 'flex-start', gap: 18,
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Meeting number badge */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'var(--board-badge)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#7170ff' }}>#{meeting.number}</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
              background: dm.bg, color: dm.color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {dm.icon} {dm.label}
            </span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
              background: `${PRIORITY_COLOR[meeting.priority]}14`,
              color: PRIORITY_COLOR[meeting.priority],
            }}>
              {meeting.priority.toUpperCase()}
            </span>
            <span style={{ fontSize: 11, color: 'var(--board-t4)' }}>{meeting.category}</span>
            <span style={{ fontSize: 11, color: 'var(--board-t4)', marginLeft: 'auto' }}>
              {formatDate(meeting.date)}
            </span>
          </div>

          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--board-t1)', letterSpacing: '-0.02em' }}>
            {meeting.title}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--board-t3)' }}>{meeting.subtitle}</p>

          {/* Participants */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <Users size={11} style={{ color: 'var(--board-t4)' }} />
            <span style={{ fontSize: 11, color: 'var(--board-t4)' }}>
              {meeting.participants.join(' · ')}
            </span>
          </div>
        </div>

        <div style={{ flexShrink: 0 }}>
          {isOpen
            ? <ChevronUp size={18} style={{ color: 'var(--board-t4)' }} />
            : <ChevronDown size={18} style={{ color: 'var(--board-t4)' }} />}
        </div>
      </button>

      {/* ── Expanded content ─────────────────────────────────────── */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--board-border)' }}>

          {/* Agenda */}
          <div style={{ padding: '20px 26px', borderBottom: '1px solid var(--board-border)' }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: 'var(--board-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Agenda
            </p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--board-t3)', lineHeight: 1.8 }}>
              {meeting.agenda}
            </p>
          </div>

          {/* Department proposals */}
          <div style={{ padding: '20px 26px', borderBottom: '1px solid var(--board-border)' }}>
            <p style={{ margin: '0 0 14px', fontSize: 11, fontWeight: 700, color: 'var(--board-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Proposals by Department
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {meeting.proposals.map(p => (
                <div key={p.dept} style={{ borderRadius: 10, border: `1px solid ${p.color}28`, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenDept(openDept === p.dept ? null : p.dept)}
                    style={{
                      width: '100%', padding: '12px 16px', display: 'flex',
                      alignItems: 'center', gap: 10,
                      background: `${p.color}08`, border: 'none', cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>{p.emoji}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--board-t1)', textAlign: 'left' }}>
                      {p.dept}
                    </span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                      background: `${VERDICT_COLOR[p.verdict]}18`, color: VERDICT_COLOR[p.verdict],
                    }}>
                      {VERDICT_LABEL[p.verdict]}
                    </span>
                    {openDept === p.dept
                      ? <ChevronUp size={13} style={{ color: 'var(--board-t4)', flexShrink: 0 }} />
                      : <ChevronDown size={13} style={{ color: 'var(--board-t4)', flexShrink: 0 }} />}
                  </button>

                  {openDept === p.dept && (
                    <div style={{ padding: '14px 16px', background: 'var(--board-inner)' }}>
                      <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {p.points.map((pt, i) => (
                          <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--board-t3)', lineHeight: 1.7 }}>
                            <span style={{ color: p.color, flexShrink: 0, marginTop: 2 }}>›</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Deputy Director Verdict */}
          <div style={{
            padding: '20px 26px', borderBottom: '1px solid var(--board-border)',
            background: `${dm.color}06`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Building2 size={14} style={{ color: dm.color }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: dm.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Deputy Director — Final Decision
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--board-t1)', lineHeight: 1.8, fontStyle: 'italic' }}>
              "{meeting.deputyVerdict}"
            </p>
          </div>

          {/* CEO Note (if any) */}
          {meeting.presidentNote && (
            <div style={{ padding: '16px 26px', borderBottom: '1px solid var(--board-border)', background: '#7170ff06' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>👑</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  President / CEO — Note
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--board-t1)', lineHeight: 1.8, fontStyle: 'italic' }}>
                "{meeting.presidentNote}"
              </p>
            </div>
          )}

          {/* Action Items */}
          <div style={{ padding: '20px 26px', borderBottom: meeting.revenueEstimate ? '1px solid var(--board-border)' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Target size={13} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--board-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Action Items
              </span>
            </div>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {meeting.actionItems.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--board-t2)', lineHeight: 1.6 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: '#f59e0b18', color: '#f59e0b', fontSize: 10, fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Revenue estimate */}
          {meeting.revenueEstimate && (
            <div style={{ padding: '14px 26px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={13} style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Revenue estimate: </span>
              <span style={{ fontSize: 12, color: 'var(--board-t3)' }}>{meeting.revenueEstimate}</span>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function BoardRoom() {
  const [openMeeting, setOpen] = useState<string | null>('mtg-003') // newest open by default
  const [filter, setFilter]    = useState<'all' | Decision>('all')

  const filtered = MEETINGS.filter(m => filter === 'all' || m.decision === filter)

  const stats = {
    total:         MEETINGS.length,
    approved:      MEETINGS.filter(m => m.decision === 'approved').length,
    inReview:      MEETINGS.filter(m => m.decision === 'in_review').length,
    implementing:  MEETINGS.filter(m => m.decision === 'implementing').length,
  }

  return (
    <>
      <style>{`
        :root {
          --board-card:   #111118;
          --board-border: #1e1e3a;
          --board-badge:  #1a1a2e;
          --board-inner:  #0d0d18;
          --board-t1:     #f0f0ff;
          --board-t2:     #d4d4f0;
          --board-t3:     #8b8bbb;
          --board-t4:     #4b4b7a;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --board-card:   #ffffff;
            --board-border: #e5e7eb;
            --board-badge:  #f3f4f6;
            --board-inner:  #f9fafb;
            --board-t1:     #111827;
            --board-t2:     #374151;
            --board-t3:     #6b7280;
            --board-t4:     #9ca3af;
          }
        }
        @media (max-width: 640px) {
          .board-header { flex-direction: column !important; align-items: flex-start !important; }
          .board-stats  { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; }
          .board-filters { overflow-x: auto; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#080810', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

        {/* ── HEADER ── */}
        <div style={{ background: 'linear-gradient(180deg, #0f0f20 0%, #080810 100%)', borderBottom: '1px solid #1e1e3a' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>

            <div className="board-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <Building2 size={20} style={{ color: '#7170ff' }} />
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#f0f0ff', letterSpacing: '-0.04em' }}>Board Room</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#ef444418', color: '#ef4444', fontWeight: 700 }}>CONFIDENTIAL</span>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#4b4b7a' }}>
                  Executive meeting records — proposals, debate, and final decisions. CEO eyes only.
                </p>
              </div>
              <div style={{ fontSize: 12, color: '#4b4b7a', textAlign: 'right', flexShrink: 0 }}>
                <div>{MEETINGS.length} meetings logged</div>
                <div>Last updated: Apr 15, 2026</div>
              </div>
            </div>

            {/* Stats */}
            <div className="board-stats" style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Total Meetings',  value: stats.total,        color: '#7170ff' },
                { label: 'Approved',         value: stats.approved,     color: '#22c55e' },
                { label: 'In Review',        value: stats.inReview,     color: '#f59e0b' },
                { label: 'Implementing',     value: stats.implementing, color: '#06b6d4' },
              ].map(s => (
                <div key={s.label} style={{
                  flex: 1, padding: '14px 16px', borderRadius: 12,
                  background: '#111118', border: '1px solid #1e1e3a',
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#4b4b7a', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ borderBottom: '1px solid #1e1e3a', background: '#0a0a14' }}>
          <div className="board-filters" style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', display: 'flex', gap: 0 }}>
            {([
              { key: 'all',          label: 'All' },
              { key: 'approved',     label: 'Approved' },
              { key: 'in_review',    label: 'In Review' },
              { key: 'implementing', label: 'Implementing' },
            ] as const).map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '12px 18px', fontSize: 12, fontWeight: 590, border: 'none', cursor: 'pointer',
                  background: 'transparent', whiteSpace: 'nowrap',
                  color: filter === f.key ? '#7170ff' : '#4b4b7a',
                  borderBottom: filter === f.key ? '2px solid #7170ff' : '2px solid transparent',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MEETING FEED ── */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(m => (
            <MeetingCard
              key={m.id}
              meeting={m}
              isOpen={openMeeting === m.id}
              onToggle={() => setOpen(openMeeting === m.id ? null : m.id)}
            />
          ))}
        </div>
      </div>
    </>
  )
}
