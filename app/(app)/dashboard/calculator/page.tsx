'use client'

import { useState, useEffect, useMemo } from 'react'
import { Calculator, TrendingUp, Target, Zap, Crown, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { convertFromUSD, convertToUSD, formatFromUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'
import { useLang } from '@/lib/context/LanguageContext'

// ── Category median prices in USD ────────────────────────────────────────────
const CATEGORY_MEDIANS: Record<string, { median: number; label: string; emoji: string }> = {
  development:  { median: 150, label: 'Development',  emoji: '💻' },
  design:       { median: 90,  label: 'Design',       emoji: '🎨' },
  marketing:    { median: 60,  label: 'Marketing',    emoji: '📣' },
  copywriting:  { median: 30,  label: 'Copywriting',  emoji: '✍️' },
  video:        { median: 100, label: 'Video',        emoji: '🎬' },
  photo:        { median: 75,  label: 'Photography',  emoji: '📷' },
  translation:  { median: 40,  label: 'Translation',  emoji: '🌐' },
  business:     { median: 110, label: 'Business',     emoji: '💼' },
  other:        { median: 50,  label: 'Other',        emoji: '⚡' },
}

// Goal presets in USD
const GOAL_PRESETS_USD = [200, 500, 1_000, 2_000, 5_000]

type Period = 'week' | 'month'
type Difficulty = 'impossible' | 'hard' | 'achievable' | 'easy'

const DIFFICULTY_COLORS: Record<Difficulty, { color: string; bg: string }> = {
  impossible: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)'   },
  hard:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
  achievable: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)'   },
  easy:       { color: '#7170ff', bg: 'rgba(113,112,255,0.08)' },
}

function calcDifficulty(ordersPerDay: number, responseRate: number): Difficulty {
  const appsPerDay = responseRate > 0 ? ordersPerDay / (responseRate / 100) : ordersPerDay * 5
  if (appsPerDay > 20) return 'impossible'
  if (appsPerDay > 8)  return 'hard'
  if (appsPerDay > 2)  return 'achievable'
  return 'easy'
}

export default function CalculatorPage() {
  const { user }                    = useUser()
  const { currency, rates }         = useCurrency()
  const sym                         = CURRENCY_SYMBOLS[currency as Currency] ?? '$'
  const { t }                       = useLang()
  const td                          = t.dashboardPage

  const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string }> = {
    impossible: { label: td.diffImpossible, desc: td.diffImpossibleDesc },
    hard:       { label: td.diffHard,       desc: td.diffHardDesc       },
    achievable: { label: td.diffAchievable, desc: td.diffAchievableDesc },
    easy:       { label: td.diffEasy,       desc: td.diffEasyDesc       },
  }

  // User profile data (prices stored in KZT in DB)
  const [userAvgPriceKzt, setUserAvgPriceKzt]       = useState<number | null>(null)
  const [userResponseRate, setUserResponseRate]       = useState<number>(34)
  const [isPremium, setIsPremium]                     = useState(false)
  const [loading, setLoading]                         = useState(true)

  // Calculator inputs — stored in selected display currency
  const defaultGoal = convertFromUSD(500, currency as Currency, rates)
  const [goal, setGoal]             = useState(defaultGoal)
  const [period, setPeriod]         = useState<Period>('week')
  const [category, setCategory]     = useState('development')
  const [customPriceCurrency, setCustomPriceCurrency] = useState<number | null>(null)

  // Update goal default when currency changes
  useEffect(() => {
    setGoal(convertFromUSD(500, currency as Currency, rates))
    setCustomPriceCurrency(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency])

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    const db = createClient()
    Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as any).from('freelancer_profiles')
        .select('category, price_from, price_to, is_premium')
        .eq('user_id', user.id)
        .single(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (db as any).from('order_responses')
        .select('proposed_price')
        .eq('user_id', user.id)
        .eq('status', 'accepted')
        .limit(50),
    ]).then(([profileRes, ordersRes]) => {
      if (profileRes.data) {
        const p = profileRes.data
        if (p.category) { setCategory(p.category) }
        if (p.is_premium) setIsPremium(true)
        if (p.price_from) {
          const mid = p.price_to ? Math.round((p.price_from + p.price_to) / 2) : p.price_from
          setUserAvgPriceKzt(mid)
        }
      }
      if (ordersRes.data?.length > 0) {
        const prices = ordersRes.data
          .map((r: { proposed_price: number | null }) => r.proposed_price)
          .filter(Boolean) as number[]
        if (prices.length > 0) {
          const avg = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length)
          setUserAvgPriceKzt(avg)
          setUserResponseRate(Math.min(80, Math.round((prices.length / 50) * 100) + 10))
        }
      }
    }).finally(() => setLoading(false))
  }, [user?.id])

  // ── Calculation (all in display currency) ────────────────────────────────
  const result = useMemo(() => {
    const days = period === 'week' ? 7 : 30

    // basePriceUSD: from category median OR custom input OR premium user avg
    let basePriceUSD: number
    if (customPriceCurrency) {
      basePriceUSD = convertToUSD(customPriceCurrency, currency as Currency, rates)
    } else if (isPremium && userAvgPriceKzt) {
      basePriceUSD = convertToUSD(userAvgPriceKzt, 'KZT', rates)
    } else {
      basePriceUSD = CATEGORY_MEDIANS[category]?.median ?? 100
    }

    // goalUSD: convert the display-currency goal input to USD for calculation
    const goalUSD = convertToUSD(goal, currency as Currency, rates)

    const ordersNeeded   = Math.ceil(goalUSD / basePriceUSD)
    const ordersPerDay   = ordersNeeded / days
    const appsNeeded     = Math.ceil(ordersNeeded / (userResponseRate / 100))
    const appsPerDay     = appsNeeded / days
    const difficulty     = calcDifficulty(ordersPerDay, userResponseRate)

    // Display values in selected currency
    const basePriceDisplay = convertFromUSD(basePriceUSD, currency as Currency, rates)
    const totalEarnings    = convertFromUSD(goalUSD, currency as Currency, rates)

    return { ordersNeeded, ordersPerDay, appsNeeded, appsPerDay, totalEarnings, difficulty, basePriceDisplay, days }
  }, [goal, period, category, customPriceCurrency, isPremium, userAvgPriceKzt, userResponseRate, currency, rates])

  const diff = { ...DIFFICULTY_COLORS[result.difficulty], ...DIFFICULTY_LABELS[result.difficulty] }

  // Format a display-currency number
  function fmtC(n: number) {
    if (['USD', 'EUR', 'GBP', 'USDT'].includes(currency)) {
      return `${sym}${Math.round(n).toLocaleString('en-US')}`
    }
    return `${Math.round(n).toLocaleString('ru-RU')} ${sym}`
  }

  const medianDisplay    = convertFromUSD(CATEGORY_MEDIANS[category]?.median ?? 100, currency as Currency, rates)
  const userAvgDisplay   = userAvgPriceKzt
    ? convertFromUSD(convertToUSD(userAvgPriceKzt, 'KZT', rates), currency as Currency, rates)
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="page-shell page-shell--narrow">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{td.calcTitle}</h1>
          <p className="text-sm text-muted-foreground">{td.calcSubtitle}</p>
        </div>
        <Link href="/dashboard/goals" className="ml-auto flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
          <Target className="h-3.5 w-3.5" />
          {td.myGoals}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Premium banner */}
      {!isPremium && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-3 mb-6">
          <Crown className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-400">{td.premiumBanner}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {td.premiumDesc}
            </p>
          </div>
          <Link href="/premium" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
            {td.getPremium}
          </Link>
        </div>
      )}

      {/* Input card */}
      <div className="rounded-2xl border border-subtle bg-card p-6 space-y-5 mb-6">

        {/* Goal amount */}
        <div>
          <label className="block text-sm font-medium mb-2">{td.incomeGoal}</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-primary">{sym}</span>
            <input
              type="number"
              min={1}
              step={['USD','EUR','GBP','USDT'].includes(currency) ? 100 : 10_000}
              value={goal}
              onChange={e => setGoal(Math.max(1, Number(e.target.value)))}
              className="w-full pl-8 pr-4 py-3 rounded-xl border border-subtle bg-surface text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {/* Quick presets in display currency */}
          <div className="flex flex-wrap gap-2 mt-2">
            {GOAL_PRESETS_USD.map(usd => {
              const v = convertFromUSD(usd, currency as Currency, rates)
              return (
                <button
                  key={usd}
                  onClick={() => setGoal(v)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                    Math.abs(goal - v) < 1
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-subtle text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  }`}
                >
                  {formatFromUSD(usd, currency as Currency, rates)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Period */}
        <div>
          <label className="block text-sm font-medium mb-2">{td.period}</label>
          <div className="flex gap-2">
            {(['week', 'month'] as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  period === p
                    ? 'bg-primary text-white border-primary'
                    : 'border-subtle text-muted-foreground hover:border-primary/30'
                }`}
              >
                {p === 'week' ? td.week1 : td.month1}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">{td.category}</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORY_MEDIANS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setCategory(key); setCustomPriceCurrency(null) }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-colors ${
                  category === key
                    ? 'bg-primary/10 border-primary/30 text-primary font-medium'
                    : 'border-subtle text-muted-foreground hover:border-primary/20'
                }`}
              >
                <span>{val.emoji}</span>
                <span className="truncate">{val.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom price */}
        <div>
          <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
            {td.avgOrderPrice}
            {isPremium && userAvgDisplay && (
              <span className="text-xs text-primary font-normal">
                {td.fromProfile} {fmtC(userAvgDisplay)}
              </span>
            )}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{sym}</span>
            <input
              type="number"
              min={1}
              step={['USD','EUR','GBP','USDT'].includes(currency) ? 10 : 1000}
              placeholder={String(isPremium && userAvgDisplay ? Math.round(userAvgDisplay) : medianDisplay)}
              value={customPriceCurrency ?? ''}
              onChange={e => setCustomPriceCurrency(e.target.value ? Number(e.target.value) : null)}
              className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {td.categoryMedian} {fmtC(medianDisplay)}
          </p>
        </div>
      </div>

      {/* Result card */}
      <div className="rounded-2xl border p-6 mb-6" style={{ borderColor: diff.color + '40', background: diff.bg }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" style={{ color: diff.color }} />
            <span className="font-bold text-sm" style={{ color: diff.color }}>{diff.label}</span>
          </div>
          <span className="text-xs text-muted-foreground">{diff.desc}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="rounded-xl bg-card/60 border border-subtle p-4">
            <p className="text-xs text-muted-foreground mb-1">{td.ordersNeeded}</p>
            <p className="text-3xl font-bold">{result.ordersNeeded}</p>
            <p className="text-xs text-muted-foreground mt-1">{result.ordersPerDay.toFixed(1)} {td.perDay}</p>
          </div>
          <div className="rounded-xl bg-card/60 border border-subtle p-4">
            <p className="text-xs text-muted-foreground mb-1">{td.appsNeeded}</p>
            <p className="text-3xl font-bold">{result.appsNeeded}</p>
            <p className="text-xs text-muted-foreground mt-1">{result.appsPerDay.toFixed(1)} {td.perDay}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { label: td.pricePerOrder,    value: fmtC(result.basePriceDisplay) },
            { label: td.acceptanceRate,   value: `${userResponseRate}%` },
            { label: td.totalEarnings,    value: fmtC(result.totalEarnings) },
            { label: td.period,           value: period === 'week' ? td.days7 : td.days30 },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI advice */}
      <div className="rounded-2xl border border-subtle bg-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">{td.whatToDo}</span>
        </div>
        <ul className="space-y-2.5">
          {result.difficulty === 'impossible' && (
            <>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-red-400 font-bold mt-0.5">!</span>
                {td.aiImpossible1pre} {fmtC(Math.round(goal / 3))} / {period === 'week' ? td.aiWeek : td.aiMonth} — {td.aiImpossible1post}
              </li>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">→</span>{td.aiImpossible2}
              </li>
            </>
          )}
          {result.difficulty === 'hard' && (
            <>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-amber-400 font-bold mt-0.5">!</span>
                {td.aiHard1a} {result.appsPerDay.toFixed(1)} {td.aiHard1b}
              </li>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">→</span>{td.aiHard2pre} {userResponseRate}% {td.aiHard2post}
              </li>
            </>
          )}
          {result.difficulty === 'achievable' && (
            <>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-green-400 font-bold mt-0.5">✓</span>
                {td.aiAchievable1a} {result.appsPerDay.toFixed(1)} {td.aiAchievable1b}
              </li>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">→</span>{td.aiAchievable2}
              </li>
            </>
          )}
          {result.difficulty === 'easy' && (
            <>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">↑</span>
                {td.aiEasy1pre} {fmtC(goal * 2)} {td.aiEasy1post}
              </li>
              <li className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">→</span>{td.aiEasy2}
              </li>
            </>
          )}
          <li className="flex gap-2 text-sm text-muted-foreground">
            <span className="text-primary mt-0.5">→</span>
            <span>
              {td.findOrdersNowPre}{' '}
              <Link href={`/orders?category=${category}`} className="text-primary underline">
                {td.openCategoryBoard} {CATEGORY_MEDIANS[category]?.label}
              </Link>
            </span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <Link
        href={`/dashboard/goals?preset=${goal}&period=${period}&currency=${currency}`}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        <Target className="h-4 w-4" />
        {td.setGoalTrack}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
