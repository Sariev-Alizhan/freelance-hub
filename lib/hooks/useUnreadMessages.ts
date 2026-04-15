'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export function useUnreadMessages(): number {
  const { user } = useUser()
  const [count, setCount] = useState(0)
  const userId = user?.id ?? null

  // Keep userId in a ref so the load function doesn't recreate on every render
  const userIdRef = useRef(userId)
  useEffect(() => { userIdRef.current = userId }, [userId])

  useEffect(() => {
    if (!userId) { setCount(0); return }

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    let cancelled = false

    async function load() {
      const uid = userIdRef.current
      if (!uid) return

      const { data: convs } = await db
        .from('conversations')
        .select('id')
        .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)

      if (cancelled) return
      if (!convs?.length) { setCount(0); return }

      const ids = convs.map((c: { id: string }) => c.id)
      const { count: unread } = await db
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', ids)
        .neq('sender_id', uid)
        .eq('is_read', false)

      if (!cancelled) setCount(unread ?? 0)
    }

    load()

    const channel = supabase
      .channel(`unread-count:${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, load)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, load)
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [userId]) // только user.id, не весь объект user

  return count
}
