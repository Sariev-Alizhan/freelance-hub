'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export function useUnreadNotifications(): number {
  const { user } = useUser()
  const [count, setCount] = useState(0)
  const userId = user?.id ?? null

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
      .channel(`unread-notifs:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, load)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId])

  return count
}
