'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type {
  Goal, ScheduleBlock,
} from '@/app/(app)/dashboard/goals/_components/types'
import { weekDates } from '@/app/(app)/dashboard/goals/_components/types'

/**
 * Owns goals/progress/schedule/premium loading for the goals page,
 * plus handlers for creating & deleting goals and schedule blocks.
 */
export function useGoals({ userId, weekOffset }: {
  userId: string | undefined
  weekOffset: number
}) {
  const [goals, setGoals]         = useState<Goal[]>([])
  const [blocks, setBlocks]       = useState<ScheduleBlock[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading]     = useState(true)

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const [goalsRes, progressRes, blocksRes, premiumRes] = await Promise.all([
      db.from('freelancer_goals').select('*').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: false }),
      db.from('goal_progress').select('goal_id, amount_earned, orders_completed, hours_logged').eq('user_id', userId),
      db.from('freelancer_schedule').select('*').eq('user_id', userId).gte('date', weekDates(weekOffset - 1)[0]).lte('date', weekDates(weekOffset + 1)[6]),
      db.from('freelancer_profiles').select('is_premium').eq('user_id', userId).single(),
    ])

    if (premiumRes.data?.is_premium) setIsPremium(true)
    if (blocksRes.data) setBlocks(blocksRes.data)

    if (goalsRes.data) {
      const progressMap: Record<string, number> = {}
      for (const row of (progressRes.data ?? [])) {
        if (!progressMap[row.goal_id]) progressMap[row.goal_id] = 0
        progressMap[row.goal_id] += row.amount_earned || row.orders_completed || row.hours_logged
      }
      setGoals(goalsRes.data.map((g: Goal) => ({ ...g, progress: progressMap[g.id] ?? 0 })))
    }
    setLoading(false)
  }, [userId, weekOffset])

  useEffect(() => { load() }, [load])

  async function deleteGoal(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    await db.from('freelancer_goals').update({ is_active: false }).eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  async function addBlock(block: Omit<ScheduleBlock, 'id'>) {
    if (!userId) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    const { data } = await db.from('freelancer_schedule').insert({
      user_id:    userId,
      date:       block.date,
      start_time: block.start_time,
      end_time:   block.end_time,
      label:      block.label,
      color:      block.color,
      note:       block.note,
    }).select().single()
    if (data) setBlocks(prev => [...prev, data])
  }

  async function deleteBlock(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    await db.from('freelancer_schedule').delete().eq('id', id)
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  function addGoalOptimistic(g: Goal) {
    setGoals(prev => [g, ...prev])
  }

  return {
    goals, blocks, isPremium, loading,
    deleteGoal, addBlock, deleteBlock, addGoalOptimistic,
  }
}
