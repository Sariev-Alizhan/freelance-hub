import type React from 'react'
import { TrendingUp, CheckCircle2, Clock } from 'lucide-react'
import { createElement } from 'react'
import { convertFromUSD, convertToUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'

export interface Goal {
  id: string
  type: 'income' | 'orders' | 'hours'
  target: number
  currency: string
  period_type: 'week' | 'month' | 'custom'
  start_date: string
  end_date: string
  title: string | null
  is_active: boolean
  progress?: number
}

export interface ScheduleBlock {
  id: string
  date: string
  start_time: string | null
  end_time: string | null
  label: string
  color: string
  note: string | null
}

export function fmtGoal(
  n: number,
  type: Goal['type'],
  goalCurrency: string,
  displayCurrency: Currency,
  rates: Record<string, number>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  td?: any,
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
  if (type === 'orders') return `${n} ${td?.ordersSuffix ?? 'заказов'}`
  return `${n} ${td?.hoursSuffix ?? 'ч'}`
}

export function pct(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100))
}

export function isoToday() {
  return new Date().toISOString().split('T')[0]
}

export function weekDates(offset = 0) {
  const today = new Date()
  const dow   = today.getDay() === 0 ? 6 : today.getDay() - 1
  const mon   = new Date(today)
  mon.setDate(today.getDate() - dow + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d.toISOString().split('T')[0]
  })
}

export const TYPE_ICONS: Record<Goal['type'], React.ReactNode> = {
  income: createElement(TrendingUp, { className: 'h-4 w-4' }),
  orders: createElement(CheckCircle2, { className: 'h-4 w-4' }),
  hours:  createElement(Clock,        { className: 'h-4 w-4' }),
}

export const BLOCK_COLORS = ['#7170ff', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6']
