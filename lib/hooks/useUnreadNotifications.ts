'use client'
import { useState, useEffect, useId } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export function useUnreadNotifications(): number {
  const { user } = useUser()
  const [count, setCount] = useState(0)
  const userId = user?.id ?? null
  // Per-instance id so multiple mounts (e.g. Header + BottomNav) don't collide
  // on the same channel name — Supabase rejects `.on()` after `.subscribe()`
  // when a channel topic is reused.
  const instanceId = useId()

  useEffect(() => {
    if (!userId) { setCount(0); return }

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    let cancelled = false

    async function load() {
      const { count: unread } = await db
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      if (!cancelled) setCount(unread ?? 0)
    }

    load()

    const channel = supabase
      .channel(`unread-notifs:${userId}:${instanceId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, load)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, load)
      .subscribe((status) => {
        // Fall back to a manual refetch if the WS drops; prevents stale counts.
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          load()
        }
      })

    // Polling fallback — belt-and-suspenders in case realtime is permanently down.
    const pollId = setInterval(load, 60_000)

    return () => {
      cancelled = true
      clearInterval(pollId)
      supabase.removeChannel(channel)
    }
  }, [userId, instanceId])

  return count
}
