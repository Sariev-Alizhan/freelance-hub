'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bot, Loader2, Send, ChevronRight, Plus, X, ArrowLeft, Zap } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

interface Agent {
  id: string
  name: string
  tagline: string
  category: string
  price_per_task: number
}

interface LogLine { step: string; message: string }
interface SubTask { title: string; agentName: string; description: string }

export default function OrchestratorPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [agents, setAgents] = useState<Agent[]>([])
  const [task, setTask] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [phase, setPhase] = useState<'form' | 'running' | 'done'>('form')
  const [logs, setLogs] = useState<LogLine[]>([])
  const [subtasks, setSubtasks] = useState<SubTask[]>([])
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch('/api/agents/marketplace')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {})
  }, [])

  function toggleAgent(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  async function handleRun() {
    if (!user) { router.push('/auth/login'); return }
    if (!task.trim() || selectedIds.length === 0) return
    setPhase('running'); setLogs([]); setSubtasks([]); setError(null); setJobId(null)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/agents/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, agentIds: selectedIds }),
        signal: abortRef.current.signal,
      })
      if (!res.ok || !res.body) throw new Error('Failed to start orchestrator')

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
            if (ev.type === 'subtasks') setSubtasks(ev.subtasks)
            if (ev.type === 'done') setPhase('done')
            if (ev.type === 'error') { setError(ev.message); setPhase('form') }
          } catch { /* skip */ }
        }
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setError(e instanceof Error ? e.message : 'Unknown error')
        setPhase('form')
      }
    }
  }

  const selectedAgents = agents.filter(a => selectedIds.includes(a.id))
  const totalCost = selectedAgents.reduce((s, a) => s + a.price_per_task, 0)

  return (
    <div className="page-shell page-shell--reading">
      <Link href="/agents" className="inline-flex items-center gap-2 mb-8 text-sm" style={{ color: 'var(--fh-t4)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Агенты
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">Phase 4 · Agent-to-Agent</span>
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
          Orchestrator
        </h1>
        <p className="text-sm" style={{ color: 'var(--fh-t3)', maxWidth: 480 }}>
          Опишите сложную задачу — оркестратор разбьёт её на подзадачи,
          назначит агентов и соберёт финальный отчёт.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <div className="lg:col-span-2 space-y-5">

          {/* Task input */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--fh-t3)' }}>
              Задача для оркестрации *
            </label>
            <textarea
              value={task}
              onChange={e => setTask(e.target.value)}
              disabled={phase === 'running'}
              rows={4}
              placeholder="Например: Разработать полную SMM и контент-стратегию для нового SaaS-продукта FreelanceHub — включая анализ аудитории, контент-план и тексты для лендинга."
              className="w-full text-sm resize-none outline-none transition-all"
              style={{
                background: 'var(--fh-surface-2)',
                border: '1px solid var(--fh-border)',
                borderRadius: 10,
                padding: '10px 14px',
                color: 'var(--fh-t1)',
              }}
            />
          </div>

          {/* Agent selector */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold" style={{ color: 'var(--fh-t3)' }}>
                Выберите агентов (мин. 1) *
              </label>
              {selectedIds.length > 0 && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(113,112,255,0.1)', color: '#7170ff' }}>
                  {selectedIds.length} выбрано
                </span>
              )}
            </div>

            {agents.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="h-8 w-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--fh-t4)' }} />
                <p className="text-sm" style={{ color: 'var(--fh-t4)' }}>Нет опубликованных агентов</p>
                <Link href="/agents/builder" className="text-xs mt-2 block" style={{ color: '#7170ff' }}>
                  + Создать агента
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {agents.map(agent => {
                  const selected = selectedIds.includes(agent.id)
                  return (
                    <button key={agent.id} onClick={() => toggleAgent(agent.id)}
                      disabled={phase === 'running'}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selected ? 'rgba(113,112,255,0.08)' : 'var(--fh-surface-2)',
                        border: selected ? '1px solid rgba(113,112,255,0.3)' : '1px solid var(--fh-border)',
                      }}>
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: selected ? 'rgba(113,112,255,0.15)' : 'var(--fh-surface)' }}>
                        {selected
                          ? <X className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
                          : <Plus className="h-3.5 w-3.5" style={{ color: 'var(--fh-t4)' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--fh-t1)' }}>{agent.name}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--fh-t4)' }}>{agent.tagline}</p>
                      </div>
                      <span className="text-xs font-semibold flex-shrink-0" style={{ color: '#10b981' }}>
                        {agent.price_per_task?.toLocaleString() ?? 0} ₸
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Execution log */}
          {(phase === 'running' || phase === 'done') && (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--fh-border-2)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--fh-surface)' }}>
                <div className={`h-2 w-2 rounded-full ${phase === 'done' ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
                <span className="text-xs font-semibold" style={{ color: 'var(--fh-t2)' }}>
                  {phase === 'done' ? 'Оркестровка завершена' : 'Выполняется...'}
                </span>
                {phase === 'running' && <Loader2 className="h-3 w-3 animate-spin ml-auto" style={{ color: '#7170ff' }} />}
              </div>

              {/* Sub-task plan */}
              {subtasks.length > 0 && (
                <div className="px-4 py-3 border-b" style={{ background: 'rgba(113,112,255,0.04)', borderColor: 'var(--fh-border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#7170ff' }}>ПЛАН ОРКЕСТРАЦИИ</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {subtasks.map((s, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(113,112,255,0.1)', color: '#7170ff', border: '1px solid rgba(113,112,255,0.2)' }}>
                          {s.agentName}
                        </span>
                        {i < subtasks.length - 1 && <ChevronRight className="h-3 w-3" style={{ color: 'var(--fh-t4)' }} />}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 space-y-1.5 font-mono text-xs min-h-[80px]" style={{ background: 'var(--fh-surface-2)' }}>
                {logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span style={{ color: 'var(--fh-t4)', minWidth: 150, flexShrink: 0 }}>{l.step}</span>
                    <span style={{ color: 'var(--fh-t2)' }}>{l.message}</span>
                  </div>
                ))}
                {phase === 'running' && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--fh-t4)' }}>
                    <Loader2 className="h-3 w-3 animate-spin" style={{ color: '#7170ff' }} /> Агенты работают...
                  </div>
                )}
              </div>

              {phase === 'done' && jobId && (
                <div className="px-4 py-3 border-t" style={{ background: 'var(--fh-surface)', borderColor: 'var(--fh-border)' }}>
                  <Link href={`/agents/jobs/${jobId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                    Посмотреть результат <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(229,72,77,0.08)', border: '1px solid rgba(229,72,77,0.2)', color: '#e5484d' }}>
              {error}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cost summary */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--fh-t1)' }}>Стоимость</h3>
            {selectedAgents.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>Выберите агентов</p>
            ) : (
              <div className="space-y-2">
                {selectedAgents.map(a => (
                  <div key={a.id} className="flex justify-between text-xs">
                    <span style={{ color: 'var(--fh-t3)' }} className="truncate mr-2">{a.name}</span>
                    <span style={{ color: 'var(--fh-t2)' }}>{a.price_per_task?.toLocaleString() ?? 0} ₸</span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between text-sm font-bold" style={{ borderColor: 'var(--fh-border)', color: 'var(--fh-t1)' }}>
                  <span>Итого</span>
                  <span style={{ color: '#7170ff' }}>{totalCost.toLocaleString()} ₸</span>
                </div>
              </div>
            )}
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={phase === 'running' || !task.trim() || selectedIds.length === 0 || userLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#5e6ad2', color: '#fff' }}
          >
            {phase === 'running'
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Оркестрирую...</>
              : <><Send className="h-4 w-4" /> Запустить оркестратор</>}
          </button>

          {phase === 'done' && (
            <button onClick={() => { setPhase('form'); setLogs([]); setSubtasks([]); setJobId(null) }}
              className="w-full py-2.5 rounded-xl text-xs text-center"
              style={{ color: 'var(--fh-t4)', border: '1px solid var(--fh-border)' }}>
              Новая задача
            </button>
          )}

          {/* How it works */}
          <div className="rounded-xl p-4" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fh-t2)' }}>Как работает</p>
            <ol className="space-y-1.5">
              {[
                'Claude анализирует задачу',
                'Разбивает на подзадачи',
                'Назначает агентов',
                'Запускает цепочку',
                'Агрегирует результат',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--fh-t4)' }}>
                  <span className="flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: 'rgba(113,112,255,0.15)', color: '#7170ff' }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
