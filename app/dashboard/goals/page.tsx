'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Target, Plus, Crown, Calendar, Flame, TrendingUp,
  CheckCircle2, Clock, Trash2, X, Loader2,
  ChevronLeft, ChevronRight, BarChart3, Zap
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { convertFromUSD, convertToUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────

interface Goal {
  id: string
  type: 'income' | 'orders' | 'hours'
  target: number
  currency: string
  period_type: 'week' | 'month' | 'custom'
  start_date: string
  end_date: string
  title: string | null
  is_active: boolean
  progress?: number   // filled client-side from goal_progress
}

interface ScheduleBlock {
  id: string
  date: string
  start_time: string | null
  end_time: string | null
  label: string
  color: string
  note: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Format a goal amount in the user's chosen display currency */
function fmtGoal(
  n: number,
  type: Goal['type'],
  goalCurrency: string,
  displayCurrency: Currency,
  rates: Record<string, number>,
): string {
  if (type === 'income') {
    const src = (goalCurrency || 'KZT') as Currency
    const usd = convertToUSD(n, src, rates)
    const out = convertFromUSD(usd, displayCurrency, rates)
    const sym = CURRENCY_SYMBOLS[displayCurrency]
    if (['USD', 'EUR', 'GBP', 'USDT'].includes(displayCurrency))
      return `${sym}${Math.round(out).toLocaleString('en-US')}`
    return `${Math.round(out).toLocaleString('ru-RU')} ${sym}`
  }
  if (type === 'orders') return n + ' заказов'
  return n + ' ч'
}

function pct(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100))
}

function isoToday() {
  return new Date().toISOString().split('T')[0]
}

function weekDates(offset = 0) {
  const today = new Date()
  const dow   = today.getDay() === 0 ? 6 : today.getDay() - 1 // Mon=0
  const mon   = new Date(today)
  mon.setDate(today.getDate() - dow + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

const DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const TYPE_LABELS: Record<Goal['type'], string> = { income: 'Доход', orders: 'Заказы', hours: 'Часы' }
const TYPE_ICONS: Record<Goal['type'], React.ReactNode> = {
  income: <TrendingUp className="h-4 w-4" />,
  orders: <CheckCircle2 className="h-4 w-4" />,
  hours:  <Clock className="h-4 w-4" />,
}
const PERIOD_LABELS: Record<Goal['period_type'], string> = {
  week: 'Неделя', month: 'Месяц', custom: 'Кастом',
}

const BLOCK_COLORS = ['#7170ff', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']

// ── Progress Ring SVG ─────────────────────────────────────────────────────
function ProgressRing({ pct: p, color = '#7170ff', size = 80, stroke = 7 }: {
  pct: number; color?: string; size?: number; stroke?: number
}) {
  const r  = (size - stroke) / 2
  const c  = 2 * Math.PI * r
  const d  = c - (p / 100) * c
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--fh-surface-3)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={d}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ── Goal Card ─────────────────────────────────────────────────────────────
function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const { currency, rates } = useCurrency()
  const p      = pct(goal.progress ?? 0, goal.target)
  const done   = p >= 100
  const color  = done ? '#22c55e' : p > 50 ? '#7170ff' : '#f59e0b'
  const today  = isoToday()
  const days   = Math.max(0, Math.ceil((new Date(goal.end_date).getTime() - new Date(today).getTime()) / 86400_000))
  const fmt    = (n: number) => fmtGoal(n, goal.type, goal.currency, currency as Currency, rates)

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
          aria-label="Delete goal"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing pct={p} color={color} />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ transform: 'rotate(0deg)' }}
          >
            <span className="text-lg font-bold leading-none">{p}%</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Выполнено</span>
            <span className="font-semibold">{fmt(goal.progress ?? 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Цель</span>
            <span className="font-semibold">{fmt(goal.target)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Осталось дней</span>
            <span className={`font-semibold ${days <= 1 ? 'text-red-400' : days <= 3 ? 'text-amber-400' : ''}`}>
              {done ? '🎉 Выполнено!' : `${days} дн`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 rounded-full bg-surface overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${p}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Create Goal Modal ─────────────────────────────────────────────────────
function CreateGoalModal({
  onClose, onCreated, presetGoal, presetPeriod, presetCategory, presetCurrency,
}: {
  onClose: () => void
  onCreated: (g: Goal) => void
  presetGoal?: string
  presetPeriod?: string
  presetCategory?: string
  presetCurrency?: string
}) {
  const { user }  = useUser()
  const { currency, rates } = useCurrency()

  function calcDefaultTarget() {
    if (presetGoal) {
      const src = (presetCurrency || 'USD') as Currency
      if (src === currency) return Number(presetGoal)
      // convert preset to current display currency via USD
      const usd = convertToUSD(Number(presetGoal), src, rates)
      return Math.round(convertFromUSD(usd, currency as Currency, rates))
    }
    return Math.round(convertFromUSD(500, currency as Currency, rates))
  }

  const [type, setType]         = useState<Goal['type']>('income')
  const [target, setTarget]     = useState(calcDefaultTarget)
  const [period, setPeriod]     = useState<Goal['period_type']>(presetPeriod === 'month' ? 'month' : 'week')
  const [title, setTitle]       = useState('')
  const [saving, setSaving]     = useState(false)

  function calcDates(p: Goal['period_type']) {
    const today = new Date()
    const start = today.toISOString().split('T')[0]
    const end   = new Date(today)
    if (p === 'week')  end.setDate(today.getDate() + 6)
    if (p === 'month') end.setMonth(today.getMonth() + 1)
    if (p === 'custom') end.setDate(today.getDate() + 13)
    return { start, end: end.toISOString().split('T')[0] }
  }

  async function save() {
    if (!user?.id) return
    setSaving(true)
    const { start, end } = calcDates(period)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { data, error } = await db.from('freelancer_goals').insert({
      user_id:     user.id,
      type,
      target,
      currency:    currency,
      period_type: period,
      start_date:  start,
      end_date:    end,
      title:       title || null,
      category:    presetCategory || null,
    }).select().single()
    setSaving(false)
    if (!error && data) onCreated({ ...data, progress: 0 })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-subtle bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Новая цель</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Тип цели</label>
          <div className="grid grid-cols-3 gap-2">
            {(['income', 'orders', 'hours'] as Goal['type'][]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2.5 rounded-xl text-xs font-medium border transition-colors flex flex-col items-center gap-1 ${
                  type === t ? 'bg-primary text-white border-primary' : 'border-subtle text-muted-foreground hover:border-primary/30'
                }`}
              >
                {TYPE_ICONS[t]}
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Target */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            {type === 'income' ? `Сумма (${CURRENCY_SYMBOLS[currency as Currency] ?? '$'})` : type === 'orders' ? 'Кол-во заказов' : 'Кол-во часов'}
          </label>
          <input
            type="number"
            min={1}
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-subtle bg-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Period */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Период</label>
          <div className="flex gap-2">
            {(['week', 'month'] as Goal['period_type'][]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                  period === p ? 'bg-primary text-white border-primary' : 'border-subtle text-muted-foreground'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Название (необязательно)</label>
          <input
            type="text"
            placeholder='Например: "На MacBook Pro"'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          onClick={save}
          disabled={saving || target <= 0}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Создать цель
        </button>
      </div>
    </div>
  )
}

// ── Calendar Week View ────────────────────────────────────────────────────
function CalendarWeek({
  weekOffset, blocks, onAddBlock, onDeleteBlock,
}: {
  weekOffset: number
  blocks: ScheduleBlock[]
  onAddBlock: (date: string) => void
  onDeleteBlock: (id: string) => void
}) {
  const dates  = weekDates(weekOffset)
  const today  = isoToday()

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {DAY_LABELS.map((d, i) => (
        <div key={d} className={`text-center pb-2 ${dates[i] === today ? 'text-primary' : 'text-muted-foreground'}`}>
          <p className="text-[10px] font-semibold uppercase">{d}</p>
          <p className={`text-sm font-bold ${dates[i] === today ? 'text-primary' : ''}`}>
            {new Date(dates[i]).getDate()}
          </p>
        </div>
      ))}
      {/* Day columns */}
      {dates.map(date => {
        const dayBlocks = blocks.filter(b => b.date === date)
        const isToday   = date === today
        return (
          <div
            key={date}
            className={`rounded-xl min-h-[80px] p-1.5 border transition-colors cursor-pointer hover:border-primary/30 ${
              isToday ? 'border-primary/40 bg-primary/5' : 'border-subtle bg-surface/50'
            }`}
            onClick={() => onAddBlock(date)}
          >
            {dayBlocks.map(b => (
              <div
                key={b.id}
                className="rounded-lg px-1.5 py-1 mb-1 text-[10px] font-medium text-white relative group"
                style={{ background: b.color }}
                onClick={e => { e.stopPropagation(); onDeleteBlock(b.id) }}
              >
                <span className="truncate block">{b.label}</span>
                {b.start_time && (
                  <span className="opacity-70">{b.start_time.slice(0,5)}</span>
                )}
                <div className="absolute inset-0 bg-black/30 rounded-lg items-center justify-center hidden group-hover:flex">
                  <Trash2 className="h-3 w-3 text-white" />
                </div>
              </div>
            ))}
            {dayBlocks.length === 0 && (
              <div className="h-full flex items-center justify-center opacity-0 hover:opacity-40 transition-opacity">
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Add Block Modal ───────────────────────────────────────────────────────
function AddBlockModal({ date, onClose, onSave }: {
  date: string
  onClose: () => void
  onSave: (b: Omit<ScheduleBlock, 'id'>) => void
}) {
  const [label, setLabel]   = useState('Работа')
  const [start, setStart]   = useState('09:00')
  const [end, setEnd]       = useState('18:00')
  const [color, setColor]   = useState(BLOCK_COLORS[0])
  const [note, setNote]     = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-subtle bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Блок на {new Date(date).toLocaleDateString('ru', { day: 'numeric', month: 'long' })}</h3>
          <button onClick={onClose} aria-label="Close"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Название блока"
          className="w-full px-3 py-2.5 rounded-xl border border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Начало</label>
            <input type="time" value={start} onChange={e => setStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-subtle bg-surface text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Конец</label>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-subtle bg-surface text-sm" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {BLOCK_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-card' : ''}`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
        </div>
        <button
          onClick={() => onSave({ date, label, start_time: start, end_time: end, color, note: note || null, user_id: '' } as Omit<ScheduleBlock, 'id'>)}
          className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Добавить
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function GoalsPage() {
  const { user }     = useUser()
  const params           = useSearchParams()
  const presetGoal       = params.get('preset') ?? undefined
  const presetPeriod     = params.get('period') ?? undefined
  const presetCat        = params.get('category') ?? undefined
  const presetCurrency   = params.get('currency') ?? undefined

  const [goals, setGoals]         = useState<Goal[]>([])
  const [blocks, setBlocks]       = useState<ScheduleBlock[]>([])
  const [streak, setStreak]       = useState(0)
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(!!presetGoal)
  const [weekOffset, setWeekOffset] = useState(0)
  const [addBlockDate, setAddBlockDate] = useState<string | null>(null)
  const [tab, setTab]             = useState<'goals' | 'calendar'>('goals')

  const load = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const [goalsRes, progressRes, blocksRes, premiumRes] = await Promise.all([
      db.from('freelancer_goals').select('*').eq('user_id', user.id).eq('is_active', true).order('created_at', { ascending: false }),
      db.from('goal_progress').select('goal_id, amount_earned, orders_completed, hours_logged').eq('user_id', user.id),
      db.from('freelancer_schedule').select('*').eq('user_id', user.id).gte('date', weekDates(weekOffset - 1)[0]).lte('date', weekDates(weekOffset + 1)[6]),
      db.from('freelancer_profiles').select('is_premium').eq('user_id', user.id).single(),
    ])

    if (premiumRes.data?.is_premium) setIsPremium(true)
    if (blocksRes.data) setBlocks(blocksRes.data)

    if (goalsRes.data) {
      const progressMap: Record<string, number> = {}
      for (const row of (progressRes.data ?? [])) {
        // accumulate progress per goal
        if (!progressMap[row.goal_id]) progressMap[row.goal_id] = 0
        progressMap[row.goal_id] += row.amount_earned || row.orders_completed || row.hours_logged
      }
      setGoals(goalsRes.data.map((g: Goal) => ({ ...g, progress: progressMap[g.id] ?? 0 })))
    }
    setLoading(false)
  }, [user?.id, weekOffset])

  useEffect(() => { load() }, [load])

  async function handleDeleteGoal(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    await db.from('freelancer_goals').update({ is_active: false }).eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function handleAddBlock(block: Omit<ScheduleBlock, 'id'>) {
    if (!user?.id) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { data } = await db.from('freelancer_schedule').insert({
      user_id:    user.id,
      date:       block.date,
      start_time: block.start_time,
      end_time:   block.end_time,
      label:      block.label,
      color:      block.color,
      note:       block.note,
    }).select().single()
    if (data) setBlocks(prev => [...prev, data])
    setAddBlockDate(null)
  }

  async function handleDeleteBlock(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    await db.from('freelancer_schedule').delete().eq('id', id)
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const activeGoals = goals.filter(g => g.is_active)
  const weekDays    = weekDates(weekOffset)
  const weekLabel   = `${new Date(weekDays[0]).toLocaleDateString('ru', { day: 'numeric', month: 'short' })} — ${new Date(weekDays[6]).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}`

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Мои цели</h1>
            <p className="text-sm text-muted-foreground">Трекер дохода и расписание</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-semibold">
              <Flame className="h-3.5 w-3.5" />
              {streak} день стрик
            </div>
          )}
          <Link
            href="/dashboard/calculator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-subtle text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Калькулятор
          </Link>
        </div>
      </div>

      {/* Premium gate */}
      {!isPremium && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 mb-6">
          <Crown className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-400">Цели и Календарь — Premium</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Трекинг целей, прогресс-кольцо, рабочий календарь и AI-коуч доступны в Premium подписке (₸3,900/мес).
            </p>
          </div>
          <Link
            href="/premium"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 whitespace-nowrap"
          >
            Получить Premium
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-surface border border-subtle w-fit">
        {(['goals', 'calendar'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'goals' ? <Target className="h-3.5 w-3.5" /> : <Calendar className="h-3.5 w-3.5" />}
            {t === 'goals' ? 'Цели' : 'Календарь'}
          </button>
        ))}
      </div>

      {/* ── GOALS TAB ── */}
      {tab === 'goals' && (
        <div>
          {/* Create goal button */}
          <button
            onClick={() => setShowCreate(true)}
            disabled={!isPremium}
            className="w-full py-3 rounded-xl border-2 border-dashed border-subtle text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Добавить цель
            {!isPremium && <Crown className="h-3.5 w-3.5 text-amber-400" />}
          </button>

          {/* Goals list */}
          {activeGoals.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium mb-1">Нет активных целей</p>
              <p className="text-sm">Поставьте первую цель и начните отслеживать прогресс</p>
              {!isPremium && (
                <Link href="/premium" className="inline-flex items-center gap-1.5 mt-4 text-sm text-primary font-medium hover:underline">
                  <Crown className="h-4 w-4" />
                  Получить Premium
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {activeGoals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onDelete={handleDeleteGoal} />
              ))}
            </div>
          )}

          {/* Tips */}
          {activeGoals.length > 0 && (
            <div className="mt-6 rounded-xl border border-subtle bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">AI-совет</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Фиксируйте выполненные заказы вручную или подключите автоматический трекинг —
                прогресс цели будет обновляться каждый день автоматически.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {tab === 'calendar' && (
        <div>
          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setWeekOffset(w => w - 1)}
              className="h-8 w-8 rounded-lg border border-subtle flex items-center justify-center hover:bg-surface transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold">{weekLabel}</p>
              {weekOffset !== 0 && (
                <button onClick={() => setWeekOffset(0)} className="text-xs text-primary hover:underline mt-0.5">
                  Сегодня
                </button>
              )}
            </div>
            <button
              onClick={() => setWeekOffset(w => w + 1)}
              className="h-8 w-8 rounded-lg border border-subtle flex items-center justify-center hover:bg-surface transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <CalendarWeek
            weekOffset={weekOffset}
            blocks={blocks}
            onAddBlock={date => isPremium ? setAddBlockDate(date) : undefined}
            onDeleteBlock={handleDeleteBlock}
          />

          {!isPremium && (
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Редактирование расписания доступно в Premium
            </p>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreated={g => { setGoals(prev => [g, ...prev]); setShowCreate(false) }}
          presetGoal={presetGoal}
          presetPeriod={presetPeriod}
          presetCategory={presetCat}
          presetCurrency={presetCurrency}
        />
      )}
      {addBlockDate && (
        <AddBlockModal
          date={addBlockDate}
          onClose={() => setAddBlockDate(null)}
          onSave={handleAddBlock}
        />
      )}
    </div>
  )
}
