'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Target, Plus, Crown, Calendar, Flame,
  Loader2, ChevronLeft, ChevronRight, BarChart3, Zap,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useGoals } from '@/lib/hooks/useGoals'
import GoalCard from './_components/GoalCard'
import CreateGoalModal from './_components/CreateGoalModal'
import CalendarWeek from './_components/CalendarWeek'
import AddBlockModal from './_components/AddBlockModal'
import { weekDates } from './_components/types'

export default function GoalsPage() {
  const { user } = useUser()
  const params         = useSearchParams()
  const presetGoal     = params.get('preset') ?? undefined
  const presetPeriod   = params.get('period') ?? undefined
  const presetCat      = params.get('category') ?? undefined
  const presetCurrency = params.get('currency') ?? undefined

  const [showCreate, setShowCreate] = useState(!!presetGoal)
  const [weekOffset, setWeekOffset] = useState(0)
  const [addBlockDate, setAddBlockDate] = useState<string | null>(null)
  const [tab, setTab] = useState<'goals' | 'calendar'>('goals')

  const {
    goals, blocks, isPremium, loading,
    deleteGoal, addBlock, deleteBlock, addGoalOptimistic,
  } = useGoals({ userId: user?.id, weekOffset })

  const streak = 0

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
    <div className="page-shell page-shell--narrow">

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

      {tab === 'goals' && (
        <div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={!isPremium}
            className="w-full py-3 rounded-xl border-2 border-dashed border-subtle text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Добавить цель
            {!isPremium && <Crown className="h-3.5 w-3.5 text-amber-400" />}
          </button>

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
                <GoalCard key={goal.id} goal={goal} onDelete={deleteGoal} />
              ))}
            </div>
          )}

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

      {tab === 'calendar' && (
        <div>
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
            onDeleteBlock={deleteBlock}
          />

          {!isPremium && (
            <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Редактирование расписания доступно в Premium
            </p>
          )}
        </div>
      )}

      {showCreate && (
        <CreateGoalModal
          onClose={() => setShowCreate(false)}
          onCreated={g => { addGoalOptimistic(g); setShowCreate(false) }}
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
          onSave={async (b) => { await addBlock(b); setAddBlockDate(null) }}
        />
      )}
    </div>
  )
}
