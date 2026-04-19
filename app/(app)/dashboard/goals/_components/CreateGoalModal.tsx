'use client'
import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { convertFromUSD, convertToUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'
import { useLang } from '@/lib/context/LanguageContext'
import { TYPE_ICONS, type Goal } from './types'

export default function CreateGoalModal({
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
  const { t } = useLang()
  const td = t.dashboardPage
  const TYPE_LABELS = { income: td.typeIncome, orders: td.typeOrders, hours: td.typeHours } as const
  const PERIOD_LABELS = { week: td.periodWeek, month: td.periodMonth, custom: td.periodCustom } as const

  function calcDefaultTarget() {
    if (presetGoal) {
      const src = (presetCurrency || 'USD') as Currency
      if (src === currency) return Number(presetGoal)
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
          <h2 className="font-bold">{td.newGoal}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label={td.closeAria}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">{td.goalType}</label>
          <div className="grid grid-cols-3 gap-2">
            {(['income', 'orders', 'hours'] as Goal['type'][]).map(tk => (
              <button
                key={tk}
                onClick={() => setType(tk)}
                className={`py-2.5 rounded-xl text-xs font-medium border transition-colors flex flex-col items-center gap-1 ${
                  type === tk ? 'bg-primary text-white border-primary' : 'border-subtle text-muted-foreground hover:border-primary/30'
                }`}
              >
                {TYPE_ICONS[tk]}
                {TYPE_LABELS[tk]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            {type === 'income' ? `${td.amountLabel} (${CURRENCY_SYMBOLS[currency as Currency] ?? '$'})` : type === 'orders' ? td.ordersLabel : td.hoursLabel}
          </label>
          <input
            type="number"
            min={1}
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-xl border border-subtle bg-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">{td.period}</label>
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

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">{td.titleOptional}</label>
          <input
            type="text"
            placeholder={td.titlePlaceholder}
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
          {td.createGoal}
        </button>
      </div>
    </div>
  )
}
