'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Bot, Star, Zap, ArrowLeft, Loader2, Send,
  CheckCircle, Clock, List, ChevronRight,
} from 'lucide-react'
import { MOCK_AGENTS } from '@/lib/mock/agents'
import { useUser } from '@/lib/hooks/useUser'

interface LogLine { step: string; message: string }

// ── SMM Form ──────────────────────────────────────────────────
function SMMForm({ onRun }: { onRun: (input: object) => void }) {
  const [form, setForm] = useState({
    brand: '', audience: '', platform: 'Instagram', tone: 'friendly', post_count: 3,
  })
  const platforms = ['Instagram', 'TikTok', 'LinkedIn', 'Twitter/X', 'Telegram']
  const tones = ['friendly', 'professional', 'humorous', 'inspiring', 'formal']
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Brand / product *</label>
        <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
          placeholder="FreelanceHub, Nike..."
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Target audience *</label>
        <input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
          placeholder="Freelancers 25–35 years old..."
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Platform</label>
          <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50">
            {platforms.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Tone</label>
          <select value={form.tone} onChange={e => setForm(f => ({ ...f, tone: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50">
            {tones.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Posts: {form.post_count}</label>
        <input type="range" min={1} max={7} value={form.post_count}
          onChange={e => setForm(f => ({ ...f, post_count: +e.target.value }))}
          className="w-full accent-primary" />
      </div>
      <button disabled={!form.brand || !form.audience} onClick={() => onRun(form)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        <Send className="h-4 w-4" /> Run Agent
      </button>
    </div>
  )
}

// ── Landing Form ───────────────────────────────────────────────
function LandingForm({ onRun }: { onRun: (input: object) => void }) {
  const [form, setForm] = useState({ product: '', description: '', audience: '', cta: '' })
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Product *</label>
        <input value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))}
          placeholder="FreelanceHub Pro..."
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Description *</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="What is it, how does it work..." rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>Audience *</label>
        <input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
          placeholder="Small business, startups..."
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>CTA button</label>
        <input value={form.cta} onChange={e => setForm(f => ({ ...f, cta: e.target.value }))}
          placeholder="Get started for free..."
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors" />
      </div>
      <button disabled={!form.product || !form.description || !form.audience} onClick={() => onRun(form)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
        <Send className="h-4 w-4" /> Run Agent
      </button>
    </div>
  )
}

// ── Log panel ──────────────────────────────────────────────────
function LogPanel({ logs, done, jobId }: { logs: LogLine[]; done: boolean; jobId: string | null }) {
  return (
    <div className="rounded-xl border border-subtle overflow-hidden">
      <div className="px-4 py-2.5 border-b border-subtle flex items-center gap-2" style={{ background: 'var(--fh-surface)' }}>
        <div className={`h-2 w-2 rounded-full ${done ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
        <span className="text-xs font-semibold" style={{ color: 'var(--fh-t2)' }}>
          {done ? 'Done' : 'Running...'}
        </span>
      </div>
      <div className="p-4 space-y-2 min-h-[100px] font-mono text-xs" style={{ background: 'var(--fh-surface-2)' }}>
        {logs.map((l, i) => (
          <div key={i} className="flex items-start gap-3">
            <span style={{ color: 'var(--fh-t4)', minWidth: '130px', flexShrink: 0 }}>{l.step}</span>
            <span style={{ color: 'var(--fh-t2)' }}>{l.message}</span>
          </div>
        ))}
        {!done && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#7170ff' }} />
            <span style={{ color: 'var(--fh-t4)' }}>Agent is working...</span>
          </div>
        )}
      </div>
      {done && jobId && (
        <div className="px-4 py-3 border-t border-subtle" style={{ background: 'var(--fh-surface)' }}>
          <Link href={`/agents/jobs/${jobId}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            <CheckCircle className="h-4 w-4" /> View result <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Custom Agent Form ──────────────────────────────────────────
function CustomForm({ agentName, onRun }: { agentName: string; onRun: (input: object) => void }) {
  const [task, setTask] = useState('')
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fh-t3)' }}>
          Task for {agentName} *
        </label>
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder="Describe what you need the agent to do..."
          rows={5}
          className="w-full px-3 py-2.5 rounded-xl text-sm bg-background border border-subtle focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
      </div>
      <button
        disabled={!task.trim()}
        onClick={() => onRun({ task })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" /> Run Agent
      </button>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const id = params?.id as string

  // Orchestrator has its own dedicated page
  useEffect(() => {
    if (id === 'orchestrator') router.replace('/agents/orchestrator')
  }, [id, router])

  // Custom agent: id starts with "custom_"
  const isCustom = id?.startsWith('custom_')
  const customAgentId = isCustom ? id.replace('custom_', '') : null
  const mockAgent = isCustom ? null : MOCK_AGENTS.find(a => a.id === id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [customAgent, setCustomAgent] = useState<any>(null)
  const [agentLoading, setAgentLoading] = useState(isCustom)

  useEffect(() => {
    if (!customAgentId) return
    fetch('/api/agents/marketplace')
      .then(r => r.json())
      .then(d => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (d.agents ?? []).find((a: any) => a.id === customAgentId)
        setCustomAgent(found ?? null)
      })
      .catch(() => {})
      .finally(() => setAgentLoading(false))
  }, [customAgentId])

  const agent = mockAgent ?? (customAgent ? {
    id: `custom_${customAgent.id}`,
    name: customAgent.name,
    tagline: customAgent.tagline,
    description: customAgent.description ?? '',
    category: customAgent.category ?? 'custom',
    skills: customAgent.skills ?? [],
    rating: 5.0,
    tasksCompleted: customAgent.tasks_completed ?? 0,
    responseTime: '< 2 min',
    model: customAgent.model ?? 'claude-sonnet-4.6',
    pricePerTask: customAgent.price_per_task ?? 10,
    isAvailable: true,
    badges: [] as string[],
  } : null)

  const [phase, setPhase] = useState<'form' | 'running' | 'done'>('form')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [runError, setRunError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  if (agentLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#7170ff' }} />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--fh-t4)' }} />
        <p className="text-lg font-semibold mb-2">Agent not found</p>
        <Link href="/agents" className="text-sm" style={{ color: '#7170ff' }}>← Back</Link>
      </div>
    )
  }

  const agentType = isCustom ? 'custom' : (agent.category === 'smm' ? 'smm' : 'landing')

  async function handleRun(input: object) {
    if (!user) { router.push('/auth/login'); return }
    setPhase('running'); setLogs([]); setRunError(null); setJobId(null)
    abortRef.current = new AbortController()
    try {
      let endpoint: string
      let body: object
      if (agentType === 'custom') {
        endpoint = '/api/agents/custom/run'
        body = { agentId: customAgentId, task: (input as { task: string }).task }
      } else {
        endpoint = agentType === 'smm' ? '/api/agents/smm/run' : '/api/agents/landing/run'
        body = input
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      })
      if (!res.ok || !res.body) throw new Error('Agent launch failed')
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of dec.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'job_id') setJobId(ev.jobId)
            if (ev.type === 'log') setLogs(p => [...p, { step: ev.step, message: ev.message }])
            if (ev.type === 'done') setPhase('done')
            if (ev.type === 'error') { setRunError(ev.message); setPhase('form') }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setRunError(e instanceof Error ? e.message : 'Unknown error')
        setPhase('form')
      }
    }
  }

  const badgeColor: Record<string, string> = {
    'Top Rated': '#f59e0b', Fast: '#3b82f6', Quality: '#8b5cf6', Trusted: '#10b981',
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/agents" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: 'var(--fh-t4)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent info */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-2xl p-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(113,112,255,0.12)', border: '1px solid rgba(113,112,255,0.2)' }}>
                <Bot className="h-7 w-7" style={{ color: '#7170ff' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold" style={{ color: 'var(--fh-t1)' }}>{agent.name}</h1>
                  {(agent.badges ?? []).map(b => (
                    <span key={b} className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${badgeColor[b] ?? '#7170ff'}18`, color: badgeColor[b] ?? '#7170ff', border: `1px solid ${badgeColor[b] ?? '#7170ff'}30` }}>
                      {b}
                    </span>
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'var(--fh-t3)' }}>{agent.tagline}</p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: 'var(--fh-t4)' }}>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{agent.rating}</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-400" />{agent.tasksCompleted} tasks</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{agent.responseTime}</span>
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" />{agent.model}</span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--fh-t3)' }}>{agent.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {agent.skills.map((s: string) => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--fh-surface-2)', color: 'var(--fh-t3)', border: '1px solid var(--fh-border)' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {(phase === 'running' || phase === 'done') && (
            <LogPanel logs={logs} done={phase === 'done'} jobId={jobId} />
          )}
          {runError && (
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)', color: '#e5484d' }}>
              {runError}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Link href="/agents/jobs"
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t2)' }}>
            <List className="h-4 w-4" /> My tasks
            <ChevronRight className="h-3.5 w-3.5 ml-auto" style={{ color: 'var(--fh-t4)' }} />
          </Link>

          <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--fh-t1)' }}>
              {phase === 'form' ? 'New task' : phase === 'running' ? 'Running...' : '✅ Done'}
            </h2>
            {phase === 'form' && (
              userLoading
                ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                : !user
                  ? <div className="text-center py-4">
                      <p className="text-sm mb-3" style={{ color: 'var(--fh-t3)' }}>Sign in to run the agent</p>
                      <Link href="/auth/login" className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold">Sign in</Link>
                    </div>
                  : agentType === 'custom'
                    ? <CustomForm agentName={agent.name} onRun={handleRun} />
                    : agentType === 'smm'
                      ? <SMMForm onRun={handleRun} />
                      : <LandingForm onRun={handleRun} />
            )}
            {phase === 'running' && (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#7170ff' }} />
                <p className="text-sm" style={{ color: 'var(--fh-t3)' }}>Agent is working...</p>
              </div>
            )}
            {phase === 'done' && jobId && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--fh-t1)' }}>Задача выполнена!</p>
                <Link href={`/agents/jobs/${jobId}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Посмотреть результат
                </Link>
                <button onClick={() => { setPhase('form'); setLogs([]); setJobId(null) }}
                  className="text-xs" style={{ color: 'var(--fh-t4)' }}>
                  Новая задача
                </button>
              </div>
            )}
          </div>

          <div className="rounded-xl p-4" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <div className="text-xs space-y-2" style={{ color: 'var(--fh-t4)' }}>
              <div className="flex justify-between"><span>Per task</span><span className="font-bold" style={{ color: '#7170ff' }}>{agent.pricePerTask === 0 ? 'Free' : `${agent.pricePerTask.toLocaleString()} ₸`}</span></div>
              <div className="flex justify-between"><span>Speed</span><span>{agent.responseTime}</span></div>
              <div className="flex justify-between"><span>Model</span><span>{agent.model}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
