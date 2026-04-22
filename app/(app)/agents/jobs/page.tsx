'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bot, Clock, CheckCircle, XCircle, Loader2, ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

interface Job {
  id: string
  agent_type: 'smm' | 'landing' | 'custom'
  status: string
  input: Record<string, unknown>
  created_at: string
  updated_at: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:            { label: 'Ожидание',     color: '#f59e0b', icon: <Clock className="h-3.5 w-3.5" /> },
  running:            { label: 'Выполняется',  color: '#3b82f6', icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
  awaiting_approval:  { label: 'Ждёт проверки', color: '#27a644', icon: <AlertCircle className="h-3.5 w-3.5" /> },
  approved:           { label: 'Одобрено',     color: '#10b981', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected:           { label: 'Отклонено',    color: '#e5484d', icon: <XCircle className="h-3.5 w-3.5" /> },
  failed:             { label: 'Ошибка',       color: '#e5484d', icon: <XCircle className="h-3.5 w-3.5" /> },
}

function jobTitle(job: Job) {
  if (job.agent_type === 'smm') return String(job.input.brand ?? 'SMM задача')
  if (job.agent_type === 'custom') return String(job.input.agentName ?? 'Кастомный агент')
  return String(job.input.product ?? 'Landing задача')
}

function jobSubtitle(job: Job) {
  if (job.agent_type === 'smm') return `${job.input.platform ?? 'Social'} · ${job.input.post_count ?? 3} постов`
  if (job.agent_type === 'custom') return String(job.input.task ?? '').slice(0, 80)
  return String(job.input.audience ?? '')
}

export default function JobsPage() {
  const { user, loading: userLoading } = useUser()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch('/api/agents/jobs')
      .then(r => r.json())
      .then(d => setJobs(d.jobs ?? []))
      .finally(() => setLoading(false))
  }, [user])

  if (userLoading || (!user && loading)) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="page-shell page-shell--narrow text-center">
        <Bot className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--fh-t4)' }} />
        <p className="text-lg font-semibold mb-2">Войдите чтобы видеть задачи</p>
        <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold">Войти</Link>
      </div>
    )
  }

  return (
    <div className="page-shell page-shell--narrow">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/agents" className="inline-flex items-center gap-2 text-sm" style={{ color: 'var(--fh-t4)' }}>
          <ArrowLeft className="h-3.5 w-3.5" /> Агенты
        </Link>
        <h1 className="text-xl font-bold" style={{ color: 'var(--fh-t1)' }}>Мои задачи</h1>
        <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
          {jobs.length} задач
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <Bot className="h-14 w-14 mx-auto mb-4 opacity-20" style={{ color: 'var(--fh-t4)' }} />
          <p className="font-semibold mb-1" style={{ color: 'var(--fh-t2)' }}>Задач пока нет</p>
          <p className="text-sm mb-6" style={{ color: 'var(--fh-t4)' }}>Запустите агента чтобы создать первую задачу</p>
          <Link href="/agents" className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            Перейти к агентам
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => {
            const cfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.pending
            return (
              <Link key={job.id} href={`/agents/jobs/${job.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl transition-colors group"
                style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
                {/* Icon */}
                <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.15)' }}>
                  <Bot className="h-5 w-5" style={{ color: '#27a644' }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold truncate" style={{ color: 'var(--fh-t1)' }}>
                      {jobTitle(job)}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${cfg.color}14`, color: cfg.color, border: `1px solid ${cfg.color}28` }}>
                      {job.agent_type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--fh-t4)' }}>{jobSubtitle(job)}</p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-1.5 flex-shrink-0"
                  style={{ color: cfg.color }}>
                  {cfg.icon}
                  <span className="text-xs font-medium hidden sm:block">{cfg.label}</span>
                </div>

                {/* Time */}
                <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--fh-t4)' }}>
                  {new Date(job.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>

                <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--fh-t4)' }} />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
