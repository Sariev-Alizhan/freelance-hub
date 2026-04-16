'use client'
import { useState, useMemo, useEffect } from 'react'
import { DEPARTMENTS, type NexusProposal, type NexusDepartment } from './departments'
import {
  CheckCircle, XCircle, ShoppingCart, Trash2, Zap, Filter,
  ChevronDown, ChevronUp, Clock, AlertTriangle, Info, Send,
  ArrowUpRight, Cpu
} from 'lucide-react'

type Status = 'pending' | 'accepted' | 'rejected'

interface CartItem {
  proposal:  NexusProposal
  dept:      NexusDepartment
  priority:  string
}

const EFFORT_LABELS: Record<string, string>   = { xs: '~1h', s: '~2-4h', m: '~1-2d', l: '~3-5d', xl: '1-2wk' }
const PRIORITY_COLOR: Record<string, string>  = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#27a644' }
const CATEGORY_LABELS: Record<string, string> = {
  feature: 'Feature', bug: 'Bug Fix', security: 'Security',
  design: 'Design', marketing: 'Marketing', performance: 'Performance', infra: 'Infra',
}
const CATEGORY_COLOR: Record<string, string> = {
  feature: '#7170ff', bug: '#ef4444', security: '#22c55e',
  design: '#ec4899', marketing: '#29b6f6', performance: '#f59e0b', infra: '#a78bfa',
}

export default function NexusClient({ lang = 'ru' }: { lang?: 'ru' | 'en' }) {
  const [statuses, setStatuses]   = useState<Record<string, Status>>({})
  const [cart, setCart]           = useState<CartItem[]>([])
  const [openDepts, setOpenDepts] = useState<Record<string, boolean>>({})
  const [filter, setFilter]       = useState<string>('all')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [showCart, setShowCart]     = useState(false)
  const [result, setResult]         = useState<{ prompt: string; summary: string; count: number } | null>(null)
  const [copied, setCopied]         = useState(false)
  const [isTgApp, setIsTgApp]       = useState(false)

  // Telegram Mini App initialization
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tg = (window as any).Telegram?.WebApp
    if (tg && tg.initData) {
      // Running inside Telegram Mini App
      setIsTgApp(true)
      tg.ready()
      tg.expand()
      tg.enableClosingConfirmation?.()
      tg.setHeaderColor?.('#0a0a1a')
      tg.setBackgroundColor?.('#0a0a1a')
    }
  }, [])

  const allProposals = useMemo(() =>
    DEPARTMENTS.flatMap(d => d.proposals.map(p => ({ proposal: p, dept: d }))),
  [])

  const filtered = filter === 'all'
    ? DEPARTMENTS
    : DEPARTMENTS.filter(d =>
        d.proposals.some(p => p.category === filter || p.priority === filter || p.deptId === filter)
      )

  function toggleDept(id: string) {
    setOpenDepts(s => ({ ...s, [id]: !s[id] }))
  }

  function accept(p: NexusProposal, dept: NexusDepartment) {
    setStatuses(s => ({ ...s, [p.id]: 'accepted' }))
    if (!cart.find(c => c.proposal.id === p.id)) {
      setCart(c => [...c, { proposal: p, dept, priority: p.priority }])
    }
  }

  function reject(p: NexusProposal) {
    setStatuses(s => ({ ...s, [p.id]: 'rejected' }))
    setCart(c => c.filter(ci => ci.proposal.id !== p.id))
  }

  function removeFromCart(id: string) {
    setCart(c => c.filter(ci => ci.proposal.id !== id))
    setStatuses(s => ({ ...s, [id]: 'pending' }))
  }

  async function submitBatch() {
    if (cart.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/nexus/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(c => ({
            id:          c.proposal.id,
            title:       lang === 'ru' ? c.proposal.titleRu : c.proposal.titleEn,
            desc:        lang === 'ru' ? c.proposal.descRu  : c.proposal.descEn,
            dept:        c.dept.agentId,
            priority:    c.proposal.priority,
            category:    c.proposal.category,
            effort:      c.proposal.effort,
            promptHint:  c.proposal.promptHint,
            version:     c.proposal.version,
          }))
        }),
      })
      const data = await res.json()
      setResult({ prompt: data.prompt || '', summary: data.summary || '', count: data.count || cart.length })
      setSubmitted(true)
      // Cart is cleared on reset, not here — so result UI stays visible
    } finally {
      setSubmitting(false)
    }
  }

  async function copyPrompt() {
    if (!result?.prompt) return
    await navigator.clipboard.writeText(result.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const T = {
    title:    lang === 'ru' ? 'NEXUS Mission Control'   : 'NEXUS Mission Control',
    subtitle: lang === 'ru' ? 'Обновления от AI-команды → CEO принимает → Claude реализует' : 'AI team proposals → CEO approves → Claude implements',
    accept:   lang === 'ru' ? 'Принять'    : 'Accept',
    reject:   lang === 'ru' ? 'Отклонить'  : 'Reject',
    submit:   lang === 'ru' ? 'Отправить в разработку' : 'Submit to dev',
    cart:     lang === 'ru' ? 'Корзина обновлений'     : 'Update Cart',
    empty:    lang === 'ru' ? 'Нет принятых обновлений' : 'No accepted updates',
    sent:     lang === 'ru' ? '✅ Отправлено! Claude получил задание.' : '✅ Sent! Claude received the task.',
    version:  lang === 'ru' ? 'Версия' : 'Version',
    effort:   lang === 'ru' ? 'Усилие' : 'Effort',
    impact:   lang === 'ru' ? 'Влияние' : 'Impact',
  }

  const accepted = Object.values(statuses).filter(s => s === 'accepted').length
  const rejected = Object.values(statuses).filter(s => s === 'rejected').length
  const total    = allProposals.length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isTgApp ? '12px 12px' : '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: isTgApp ? 16 : 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isTgApp ? 8 : 12, marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{
            width: isTgApp ? 36 : 44, height: isTgApp ? 36 : 44, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(113,112,255,0.2), rgba(39,166,68,0.15))',
            border: '1px solid rgba(113,112,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isTgApp ? 18 : 22,
          }}>🌐</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: isTgApp ? 17 : 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fh-t1)', margin: 0 }}>
              {T.title}
            </h1>
            {!isTgApp && <p style={{ fontSize: 13, color: 'var(--fh-t4)', marginTop: 2, marginBottom: 0 }}>{T.subtitle}</p>}
          </div>
          {/* Cart toggle */}
          <button
            onClick={() => setShowCart(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: isTgApp ? '6px 10px' : '8px 16px', borderRadius: 10,
              border: '1px solid rgba(113,112,255,0.3)',
              background: cart.length > 0 ? 'rgba(113,112,255,0.1)' : 'var(--fh-surface-2)',
              color: cart.length > 0 ? '#7170ff' : 'var(--fh-t4)',
              fontSize: isTgApp ? 12 : 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ShoppingCart size={isTgApp ? 13 : 15} />
            {!isTgApp && T.cart} {cart.length > 0 && <span style={{ background: '#7170ff', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 11 }}>{cart.length}</span>}
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {[
            { label: lang === 'ru' ? 'Всего' : 'Total',    val: total,    color: 'var(--fh-t3)' },
            { label: lang === 'ru' ? 'Принято' : 'Accepted', val: accepted, color: '#22c55e' },
            { label: lang === 'ru' ? 'Отклонено' : 'Rejected', val: rejected, color: '#ef4444' },
            { label: lang === 'ru' ? 'Ожидает' : 'Pending',  val: total - accepted - rejected, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      {showCart && (
        <div style={{
          marginBottom: 20, padding: 20, borderRadius: 16,
          background: 'var(--card)', border: '1px solid rgba(113,112,255,0.2)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--fh-t1)' }}>
            🛒 {T.cart} ({cart.length})
          </h3>
          {cart.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>{T.empty}</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {cart.map(item => (
                  <div key={item.proposal.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'var(--fh-surface-2)',
                  }}>
                    <span style={{ fontSize: 16 }}>{item.dept.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)', margin: 0 }}>
                        {lang === 'ru' ? item.proposal.titleRu : item.proposal.titleEn}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--fh-t4)', margin: 0 }}>
                        {item.dept.agentId} · {item.proposal.version}
                      </p>
                    </div>
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 5,
                      background: `${PRIORITY_COLOR[item.proposal.priority]}18`,
                      color: PRIORITY_COLOR[item.proposal.priority], fontWeight: 700, textTransform: 'uppercase',
                    }}>{item.proposal.priority}</span>
                    <button onClick={() => removeFromCart(item.proposal.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {submitted && result ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Success header */}
                  <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', fontSize: 13, fontWeight: 600 }}>
                    ✅ Батч отправлен — {result.count} обновлений
                  </div>

                  {/* AI Summary */}
                  {result.summary && (
                    <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(113,112,255,0.06)', border: '1px solid rgba(113,112,255,0.2)' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                        🤖 AI резюме изменений
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--fh-t2)', lineHeight: 1.65, whiteSpace: 'pre-wrap', margin: 0 }}>
                        {result.summary}
                      </p>
                    </div>
                  )}

                  {/* Prompt block */}
                  <div style={{ borderRadius: 12, border: '1px solid rgba(113,112,255,0.3)', overflow: 'hidden' }}>
                    <div style={{
                      padding: '10px 14px', background: 'rgba(113,112,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#7170ff', margin: 0 }}>
                          📋 Промпт для Claude Code
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--fh-t4)', margin: '2px 0 0' }}>
                          Скопируй и вставь в чат Claude Code CLI
                        </p>
                      </div>
                      <button
                        onClick={copyPrompt}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                          background: copied ? 'rgba(34,197,94,0.15)' : '#7170ff',
                          color: copied ? '#22c55e' : '#fff',
                          border: copied ? '1px solid rgba(34,197,94,0.3)' : 'none',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        {copied ? <><CheckCircle size={13} /> Скопировано!</> : <><Cpu size={13} /> Копировать</>}
                      </button>
                    </div>
                    <pre style={{
                      margin: 0, padding: '12px 14px',
                      fontSize: 11, lineHeight: 1.6, color: 'var(--fh-t3)',
                      background: 'var(--fh-surface-2)',
                      overflowX: 'auto', maxHeight: 220, overflowY: 'auto',
                      whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                      fontFamily: 'monospace',
                    }}>
                      {result.prompt.slice(0, 800)}{result.prompt.length > 800 ? '\n…(полный промпт скопируется)' : ''}
                    </pre>
                  </div>

                  <button
                    onClick={() => { setSubmitted(false); setResult(null); setCart([]); setStatuses({}) }}
                    style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: 'none', border: '1px solid var(--fh-border)',
                      color: 'var(--fh-t4)', cursor: 'pointer',
                    }}
                  >
                    ← Новый батч
                  </button>
                </div>
              ) : (
                <button
                  onClick={submitBatch}
                  disabled={submitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                    padding: '12px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                    background: '#7170ff', color: '#fff', border: 'none', cursor: submitting ? 'wait' : 'pointer',
                    justifyContent: 'center',
                  }}
                >
                  {submitting ? <><Clock size={15} /> Генерирую промпт…</> : <><Send size={15} /> {T.submit}</>}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {[
          { id: 'all', label: lang === 'ru' ? 'Все' : 'All', color: '#7170ff' },
          { id: 'critical', label: 'Critical', color: '#ef4444' },
          { id: 'high',     label: 'High',     color: '#f59e0b' },
          { id: 'bug',      label: 'Bugs',     color: '#ef4444' },
          { id: 'security', label: 'Security', color: '#22c55e' },
          { id: 'feature',  label: 'Features', color: '#7170ff' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: `1px solid ${filter === f.id ? f.color : 'var(--fh-border)'}`,
              background: filter === f.id ? `${f.color}15` : 'transparent',
              color: filter === f.id ? f.color : 'var(--fh-t4)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Departments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(dept => {
          const isOpen = openDepts[dept.id] !== false  // default open
          const deptProposals = dept.proposals.filter(p =>
            filter === 'all' || p.category === filter || p.priority === filter
          )
          const deptAccepted = deptProposals.filter(p => statuses[p.id] === 'accepted').length

          return (
            <div key={dept.id} style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid var(--fh-border-2)',
              background: 'var(--card)',
            }}>
              {/* Dept header */}
              <button
                onClick={() => toggleDept(dept.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{dept.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)' }}>{dept.nameEn}</span>
                    <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 6, background: `${dept.color}18`, color: dept.color, fontWeight: 700 }}>
                      {dept.agentId}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{dept.role}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: 0 }}>{dept.desc}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {deptAccepted > 0 && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 700 }}>
                      ✓ {deptAccepted}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{deptProposals.length} proposals</span>
                  {isOpen ? <ChevronUp size={14} color="var(--fh-t4)" /> : <ChevronDown size={14} color="var(--fh-t4)" />}
                </div>
              </button>

              {/* Proposals */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--fh-border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {deptProposals.map(p => {
                    const status = statuses[p.id] || 'pending'
                    const title = lang === 'ru' ? p.titleRu : p.titleEn
                    const desc  = lang === 'ru' ? p.descRu  : p.descEn

                    return (
                      <div
                        key={p.id}
                        style={{
                          padding: '14px 14px',
                          borderRadius: 12,
                          border: `1px solid ${
                            status === 'accepted' ? 'rgba(34,197,94,0.3)' :
                            status === 'rejected' ? 'rgba(239,68,68,0.2)' :
                            'var(--fh-border)'
                          }`,
                          background: status === 'accepted' ? 'rgba(34,197,94,0.04)' :
                                      status === 'rejected' ? 'rgba(239,68,68,0.04)' :
                                      'var(--fh-surface-2)',
                          opacity: status === 'rejected' ? 0.55 : 1,
                        }}
                      >
                        {/* Top row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                              <span style={{
                                fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 700, textTransform: 'uppercase',
                                background: `${PRIORITY_COLOR[p.priority]}18`,
                                color: PRIORITY_COLOR[p.priority],
                              }}>{p.priority}</span>
                              <span style={{
                                fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 700,
                                background: `${CATEGORY_COLOR[p.category]}18`,
                                color: CATEGORY_COLOR[p.category],
                              }}>{CATEGORY_LABELS[p.category]}</span>
                              <span style={{ fontSize: 10, color: 'var(--fh-t4)' }}>{p.version}</span>
                            </div>
                            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)', margin: 0 }}>{title}</h4>
                          </div>

                          {/* Status badge */}
                          {status === 'accepted' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#22c55e', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              <CheckCircle size={14} /> Accepted
                            </div>
                          )}
                          {status === 'rejected' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ef4444', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              <XCircle size={14} /> Rejected
                            </div>
                          )}
                        </div>

                        <p style={{ fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.6, margin: '0 0 10px' }}>{desc}</p>

                        {/* Metadata row */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
                            ⏱ {T.effort}: <strong style={{ color: 'var(--fh-t2)' }}>{EFFORT_LABELS[p.effort]}</strong>
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
                            {'⭐'.repeat(p.impact)} {T.impact}: <strong style={{ color: 'var(--fh-t2)' }}>{p.impact}/5</strong>
                          </span>
                        </div>

                        {/* Action buttons */}
                        {status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => accept(p, dept)}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
                                color: '#22c55e', cursor: 'pointer',
                              }}
                            >
                              <CheckCircle size={13} /> {T.accept}
                            </button>
                            <button
                              onClick={() => reject(p)}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 600,
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                color: '#ef4444', cursor: 'pointer',
                              }}
                            >
                              <XCircle size={13} /> {T.reject}
                            </button>
                          </div>
                        )}

                        {status !== 'pending' && (
                          <button
                            onClick={() => {
                              setStatuses(s => ({ ...s, [p.id]: 'pending' }))
                              setCart(c => c.filter(ci => ci.proposal.id !== p.id))
                            }}
                            style={{
                              fontSize: 11, color: 'var(--fh-t4)', background: 'none', border: 'none',
                              cursor: 'pointer', textDecoration: 'underline',
                            }}
                          >
                            {lang === 'ru' ? 'Сбросить' : 'Reset'}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
