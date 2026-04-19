'use client'
import { Trash2 } from 'lucide-react'
import { useCurrency } from '@/lib/context/CurrencyContext'
import type { Currency } from '@/lib/types'
import { useLang } from '@/lib/context/LanguageContext'
import ProgressRing from './ProgressRing'
import {
  fmtGoal, pct, isoToday,
  TYPE_ICONS,
  type Goal,
} from './types'

export default function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const { currency, rates } = useCurrency()
  const { t } = useLang()
  const td = t.dashboardPage
  const TYPE_LABELS = { income: td.typeIncome, orders: td.typeOrders, hours: td.typeHours } as const
  const PERIOD_LABELS = { week: td.periodWeek, month: td.periodMonth, custom: td.periodCustom } as const
  const p      = pct(goal.progress ?? 0, goal.target)
  const done   = p >= 100
  const color  = done ? '#22c55e' : p > 50 ? '#7170ff' : '#f59e0b'
  const today  = isoToday()
  const days   = Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date(today).getTime()) / 86400_000))
  const fmt    = (n: number) => fmtGoal(n, goal.type, goal.currency, currency as Currency, rates, td)

  return (
    <div className="rounded-2xl border border-subtle bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span style={{ color: '#7170ff' }}>{TYPE_ICONS[goal.type]}</span>
            <span className="text-xs font-medium text-muted-foreground">{TYPE_LABELS[goal.type]} · {PERIOD_LABELS[goal.period_type]}</span>
          </div>
          <p className="font-semibold text-sm">{goal.title ?? `${TYPE_LABELS[goal.type]} — ${fmt(goal.target)}`}</p>
        </div>
        <button
          onClick={() => onDelete(goal.id)}
          className="text-muted-foreground hover:text-red-400 transition-colors"
          aria-label={td.deleteGoal}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ProgressRing pct={p} color={color} />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ transform: 'rotate(0deg)' }}
          >
            <span className="text-lg font-bold leading-none">{p}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{td.goalDone}</span>
            <span className="font-semibold">{fmt(goal.progress ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{td.goalTarget}</span>
            <span className="font-semibold">{fmt(goal.target)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{td.goalDaysLeft}</span>
            <span className={`font-semibold ${days <= 1 ? 'text-red-400' : days <= 3 ? 'text-amber-400' : ''}`}>
              {done ? td.goalDoneCelebrate : `${days} ${td.dayShort}`}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
    </div>
  )
}
