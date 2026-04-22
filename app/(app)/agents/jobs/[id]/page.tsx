'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, XCircle, Loader2, Clock,
  Bot, AlertCircle, Copy, Check, MessageSquare, Send, Star,
  ChevronRight,
} from 'lucide-react'

interface LogEntry { id: string; step: string; message: string; created_at: string }
interface ChatMessage { id: string; role: 'user' | 'agent'; content: string; created_at: string }
interface SubJob { id: string; agent_type: string; status: string; input: Record<string, unknown>; output: Record<string, unknown> | null; created_at: string }

interface SMMPost {
  day: string; type: string; caption: string;
  hashtags: string[]; image_prompt: string; best_time: string;
}
interface SMMOutput { strategy: string; posts: SMMPost[] }

interface LandingFeature { icon: string; title: string; desc: string }
interface LandingFAQ { q: string; a: string }
interface LandingTestimonial { name: string; role: string; text: string; rating: number }
interface LandingOutput {
  sections: string[]
  copy: {
    hero_headline: string; hero_sub: string
    problem_title: string; problem_points: string[]
    solution_title: string; solution_text: string
    features: LandingFeature[]
    testimonials: LandingTestimonial[]
    faq: LandingFAQ[]
    cta_headline: string; cta_sub: string; cta_button: string
  }
  seo: { title: string; description: string }
  notes: string
}

interface CustomOutput { text: string; agentName: string }
interface OrchestratorOutput { plan: string; subtasks: { title: string; agentName: string; result: string }[]; aggregate: string }

interface Job {
  id: string; agent_type: 'smm' | 'landing' | 'custom' | 'orchestrator'; status: string
  input: Record<string, unknown>; output: SMMOutput | LandingOutput | CustomOutput | OrchestratorOutput | null
  error: string | null; created_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:           { label: 'Ожидание',      color: '#f59e0b' },
  running:           { label: 'Выполняется',   color: '#3b82f6' },
  awaiting_approval: { label: 'Ждёт проверки', color: '#27a644' },
  approved:          { label: 'Одобрено',      color: '#10b981' },
  rejected:          { label: 'Отклонено',     color: '#e5484d' },
  failed:            { label: 'Ошибка',        color: '#e5484d' },
}

// ── Copy button ────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: 'var(--fh-t4)' }}>
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

// ── SMM Output ─────────────────────────────────────────────────
function SMMResult({ output }: { output: SMMOutput }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4" style={{ background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.15)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: '#27a644' }}>СТРАТЕГИЯ</p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--fh-t2)' }}>{output.strategy}</p>
      </div>
      {output.posts?.map((post, i) => (
        <div key={i} className="rounded-xl p-5" style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold" style={{ color: 'var(--fh-t1)' }}>{post.day}</span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
                {post.type}
              </span>
              <span className="text-xs" style={{ color: 'var(--fh-t4)' }}>📅 {post.best_time}</span>
            </div>
            <CopyBtn text={`${post.caption}\n\n${post.hashtags.join(' ')}`} />
          </div>
          <p className="text-sm leading-relaxed mb-3 whitespace-pre-line" style={{ color: 'var(--fh-t2)' }}>{post.caption}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.hashtags?.map((h, j) => (
              <span key={j} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--fh-surface)', color: 'var(--fh-t3)', border: '1px solid var(--fh-border)' }}>
                {h}
              </span>
            ))}
          </div>
          {post.image_prompt && (
            <div className="rounded-lg px-3 py-2" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--fh-t4)' }}>🖼 Промпт для изображения</p>
              <p className="text-xs" style={{ color: 'var(--fh-t3)' }}>{post.image_prompt}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Landing Output ─────────────────────────────────────────────
function LandingResult({ output }: { output: LandingOutput }) {
  const { copy, seo, notes } = output
  return (
    <div className="space-y-5">
      {/* SEO */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
        <p className="text-xs font-semibold mb-2" style={{ color: '#10b981' }}>SEO</p>
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--fh-t1)' }}>{seo?.title}</p>
        <p className="text-xs" style={{ color: 'var(--fh-t3)' }}>{seo?.description}</p>
      </div>

      {/* Hero */}
      <Section title="Hero" color="#27a644">
        <Headline text={copy?.hero_headline} />
        <p className="text-sm" style={{ color: 'var(--fh-t3)' }}>{copy?.hero_sub}</p>
      </Section>

      {/* Problem */}
      <Section title={copy?.problem_title || 'Problem'} color="#e5484d">
        <ul className="space-y-1.5">
          {copy?.problem_points?.map((p, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--fh-t3)' }}>
              <span className="mt-0.5 flex-shrink-0">⚡</span>{p}
            </li>
          ))}
        </ul>
      </Section>

      {/* Solution */}
      <Section title={copy?.solution_title || 'Solution'} color="#3b82f6">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--fh-t3)' }}>{copy?.solution_text}</p>
      </Section>

      {/* Features */}
      <Section title="Features" color="#f59e0b">
        <div className="grid grid-cols-2 gap-3">
          {copy?.features?.map((f, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <div className="text-xl mb-1">{f.icon}</div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--fh-t1)' }}>{f.title}</p>
              <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section title="Testimonials" color="#8b5cf6">
        <div className="space-y-3">
          {copy?.testimonials?.map((t, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--fh-t1)' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>{t.role}</p>
                </div>
                <span className="ml-auto text-xs text-amber-400">{'★'.repeat(t.rating)}</span>
              </div>
              <p className="text-sm italic" style={{ color: 'var(--fh-t3)' }}>&ldquo;{t.text}&rdquo;</p>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="FAQ" color="#10b981">
        <div className="space-y-3">
          {copy?.faq?.map((item, i) => (
            <div key={i}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--fh-t1)' }}>Q: {item.q}</p>
              <p className="text-sm" style={{ color: 'var(--fh-t3)' }}>A: {item.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section title="Final CTA" color="#e5484d">
        <Headline text={copy?.cta_headline} />
        <p className="text-sm mb-3" style={{ color: 'var(--fh-t3)' }}>{copy?.cta_sub}</p>
        <span className="inline-block px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold">
          {copy?.cta_button}
        </span>
      </Section>

      {/* Notes */}
      {notes && (
        <div className="rounded-xl p-4" style={{ background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.15)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#27a644' }}>ЗАМЕТКИ ПО КОНВЕРСИИ</p>
          <p className="text-sm" style={{ color: 'var(--fh-t3)' }}>{notes}</p>
        </div>
      )}
    </div>
  )
}

// ── Custom Output ──────────────────────────────────────────────
function CustomResult({ output }: { output: CustomOutput }) {
  return (
    <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold" style={{ color: '#27a644' }}>РЕЗУЛЬТАТ — {output.agentName?.toUpperCase()}</p>
        <CopyBtn text={output.text} />
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fh-t2)' }}>{output.text}</p>
    </div>
  )
}

// ── Orchestrator Output ────────────────────────────────────────
function OrchestratorResult({ output }: { output: OrchestratorOutput }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <p className="text-xs font-bold mb-1" style={{ color: '#f59e0b' }}>ПЛАН ОРКЕСТРАЦИИ</p>
        <p className="text-sm" style={{ color: 'var(--fh-t2)' }}>{output.plan}</p>
      </div>
      {output.subtasks?.map((s, i) => (
        <div key={i} className="rounded-xl p-5" style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
              {i + 1}. {s.agentName}
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--fh-t1)' }}>{s.title}</span>
            <CopyBtn text={s.result} />
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fh-t3)' }}>{s.result}</p>
        </div>
      ))}
      <div className="rounded-xl p-5" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold" style={{ color: '#10b981' }}>ФИНАЛЬНЫЙ ОТЧЁТ</p>
          <CopyBtn text={output.aggregate} />
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--fh-t2)' }}>{output.aggregate}</p>
      </div>
    </div>
  )
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
      <p className="text-xs font-bold mb-3" style={{ color }}>{title.toUpperCase()}</p>
      {children}
    </div>
  )
}

function Headline({ text }: { text?: string }) {
  return <p className="text-lg font-bold mb-2" style={{ color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>{text}</p>
}

// ── Main ───────────────────────────────────────────────────────
export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [subJobs, setSubJobs] = useState<SubJob[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [ratingScore, setRatingScore] = useState(0)
  const [rated, setRated] = useState(false)
  const chatEndRef        = useRef<HTMLDivElement>(null)
  const chatContainerRef  = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const res = await fetch(`/api/agents/jobs/${id}`)
    if (!res.ok) { router.push('/agents/jobs'); return }
    const { job: j, logs: l, subJobs: sj, messages: msgs } = await res.json()
    setJob(j); setLogs(l ?? []); setSubJobs(sj ?? []); setMessages(msgs ?? [])
    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  // Poll while running
  useEffect(() => {
    if (!job || !['pending', 'running'].includes(job.status)) return
    const t = setInterval(load, 2000)
    return () => clearInterval(t)
  }, [job, load])

  async function handleAction(action: 'approve' | 'reject') {
    setActing(true)
    const res = await fetch(`/api/agents/jobs/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (res.ok) {
      const { status } = await res.json()
      setJob(j => j ? { ...j, status } : j)
    }
    setActing(false)
  }

  async function handleChat(e: React.FormEvent) {
    e.preventDefault()
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim()
    setChatInput('')
    setChatLoading(true)
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg, created_at: new Date().toISOString() }])
    const res = await fetch(`/api/agents/jobs/${id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    })
    if (res.ok) {
      const { reply } = await res.json()
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'agent', content: reply, created_at: new Date().toISOString() }])
    }
    setChatLoading(false)
    setTimeout(() => {
      const el = chatContainerRef.current
      if (el) el.scrollTop = el.scrollHeight
    }, 100)
  }

  async function handleRate(score: number) {
    if (rated || !job?.input?.agentId) return
    setRatingScore(score)
    await fetch('/api/agents/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: id, agent_id: job.input.agentId, score }),
    })
    setRated(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!job) return null

  const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending
  const isRunning = ['pending', 'running'].includes(job.status)
  const canAct = job.status === 'awaiting_approval'

  return (
    <div className="page-shell page-shell--narrow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/agents/jobs" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--fh-t4)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Задачи
        </Link>
      </div>

      {/* Job card */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.15)' }}>
            <Bot className="h-5 w-5" style={{ color: '#27a644' }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold" style={{ color: 'var(--fh-t1)' }}>
                {job.agent_type === 'smm'
                  ? String(job.input.brand ?? 'SMM')
                  : job.agent_type === 'custom'
                    ? String(job.input.agentName ?? 'Custom Agent')
                    : String(job.input.product ?? 'Landing')}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: `${cfg.color}14`, color: cfg.color, border: `1px solid ${cfg.color}28` }}>
                {cfg.label}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fh-t4)' }}>
              {new Date(job.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      {/* Execution logs */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid var(--fh-border-2)' }}>
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--fh-surface)' }}>
          <div className={`h-2 w-2 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
          <span className="text-xs font-semibold" style={{ color: 'var(--fh-t2)' }}>Логи выполнения</span>
          {isRunning && <Loader2 className="h-3 w-3 animate-spin ml-auto" style={{ color: '#27a644' }} />}
        </div>
        <div className="p-4 space-y-1.5 font-mono text-xs min-h-[80px]" style={{ background: 'var(--fh-surface-2)' }}>
          {logs.length === 0 && isRunning && (
            <div className="flex items-center gap-2" style={{ color: 'var(--fh-t4)' }}>
              <Loader2 className="h-3 w-3 animate-spin" /> Ожидание...
            </div>
          )}
          {logs.map(l => (
            <div key={l.id} className="flex items-start gap-3">
              <span style={{ color: 'var(--fh-t4)', minWidth: '140px', flexShrink: 0 }}>{l.step}</span>
              <span style={{ color: 'var(--fh-t2)' }}>{l.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Approve / Reject */}
      {canAct && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl"
          style={{ background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.2)' }}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#27a644' }} />
          <p className="text-sm flex-1" style={{ color: 'var(--fh-t2)' }}>Агент завершил работу. Одобрить или отклонить результат?</p>
          <button onClick={() => handleAction('reject')} disabled={acting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
            style={{ background: 'rgba(229,72,77,0.1)', color: '#e5484d', border: '1px solid rgba(229,72,77,0.2)' }}>
            <XCircle className="h-4 w-4" /> Отклонить
          </button>
          <button onClick={() => handleAction('approve')} disabled={acting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-40"
            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Одобрить
          </button>
        </div>
      )}

      {job.status === 'approved' && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
          <CheckCircle className="h-4 w-4" /> Результат одобрен
        </div>
      )}

      {job.status === 'rejected' && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)', color: '#e5484d' }}>
          <XCircle className="h-4 w-4" /> Результат отклонён
        </div>
      )}

      {job.status === 'failed' && job.error && (
        <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)', color: '#e5484d' }}>
          <XCircle className="h-4 w-4" /> {job.error}
        </div>
      )}

      {/* Output */}
      {job.output && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base font-bold" style={{ color: 'var(--fh-t1)' }}>Результат</h2>
            {job.status === 'awaiting_approval' && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
                На проверке
              </span>
            )}
          </div>
          {job.agent_type === 'smm'
            ? <SMMResult output={job.output as SMMOutput} />
            : job.agent_type === 'custom'
              ? <CustomResult output={job.output as CustomOutput} />
              : job.agent_type === 'orchestrator'
                ? <OrchestratorResult output={job.output as OrchestratorOutput} />
                : <LandingResult output={job.output as LandingOutput} />
          }
        </div>
      )}

      {isRunning && !job.output && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" style={{ color: '#27a644' }} />
          <p className="text-sm" style={{ color: 'var(--fh-t3)' }}>Агент работает, результат появится здесь...</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Clock className="h-3.5 w-3.5" style={{ color: 'var(--fh-t4)' }} />
            <span className="text-xs" style={{ color: 'var(--fh-t4)' }}>Обновляется автоматически</span>
          </div>
        </div>
      )}

      {/* ── Sub-jobs tree (A2A) ─────────────────────────────── */}
      {subJobs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--fh-t2)' }}>
            Дочерние задачи ({subJobs.length})
          </h3>
          <div className="space-y-2">
            {subJobs.map((sj, i) => {
              const sjCfg = STATUS_CONFIG[sj.status] ?? STATUS_CONFIG.pending
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const sjName = String((sj.input as any).agentName ?? sj.agent_type)
              return (
                <Link key={sj.id} href={`/agents/jobs/${sj.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl group transition-colors"
                  style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
                  <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                    style={{ background: 'rgba(39,166,68,0.15)', color: '#27a644' }}>{i + 1}</span>
                  <Bot className="h-4 w-4 flex-shrink-0" style={{ color: '#27a644' }} />
                  <span className="flex-1 text-sm font-medium truncate" style={{ color: 'var(--fh-t1)' }}>{sjName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: `${sjCfg.color}14`, color: sjCfg.color }}>{sjCfg.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--fh-t4)' }} />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Rating (custom/orchestrator approved jobs) ──────── */}
      {job.status === 'approved' && ['custom', 'orchestrator'].includes(job.agent_type) && !!job.input?.agentId && (
        <div className="mt-8 rounded-xl p-4" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: 'var(--fh-t1)' }}>
            {rated ? 'Спасибо за оценку!' : 'Оцените работу агента'}
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => handleRate(s)} disabled={rated}
                className="p-0.5 transition-transform hover:scale-110 disabled:cursor-default">
                <Star className={`h-6 w-6 ${s <= (ratingScore || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Team Mode chat ──────────────────────────────────── */}
      {['approved', 'rejected', 'awaiting_approval'].includes(job.status) && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4" style={{ color: '#27a644' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--fh-t2)' }}>Team Mode — уточнения</h3>
            <span className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
              Beta
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--fh-border-2)' }}>
            {/* Message list */}
            <div ref={chatContainerRef} className="p-4 space-y-3 min-h-[100px] max-h-[400px] overflow-y-auto"
              style={{ background: 'var(--fh-surface-2)' }}>
              {messages.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'var(--fh-t4)' }}>
                  Задайте вопрос или попросите доработать результат
                </p>
              )}
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'agent' && (
                    <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(39,166,68,0.15)' }}>
                      <Bot className="h-3.5 w-3.5" style={{ color: '#27a644' }} />
                    </div>
                  )}
                  <div className="max-w-[80%] rounded-2xl px-3 py-2 text-sm"
                    style={{
                      background: m.role === 'user' ? '#27a644' : 'var(--fh-surface)',
                      color: m.role === 'user' ? '#fff' : 'var(--fh-t2)',
                      border: m.role === 'agent' ? '1px solid var(--fh-border)' : 'none',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5,
                    }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(39,166,68,0.15)' }}>
                    <Bot className="h-3.5 w-3.5" style={{ color: '#27a644' }} />
                  </div>
                  <div className="px-3 py-2 rounded-2xl" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#27a644' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleChat} className="flex gap-2 p-3 border-t"
              style={{ background: 'var(--fh-surface)', borderColor: 'var(--fh-border)' }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Попросите доработать или уточните..."
                className="flex-1 text-sm outline-none"
                style={{
                  background: 'var(--fh-surface-2)',
                  border: '1px solid var(--fh-border)',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: 'var(--fh-t1)',
                }}
              />
              <button type="submit" disabled={!chatInput.trim() || chatLoading}
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-colors"
                style={{ background: '#27a644' }}>
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
