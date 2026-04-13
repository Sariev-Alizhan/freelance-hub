'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

export function useUnreadMessages(): number {
  const { user } = useUser()
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    if (!user) { setCount(0); return }
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any

    // Get all conversation IDs for this user
    const { data: convs } = await db
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)

    if (!convs?.length) { setCount(0); return }
    const ids = convs.map((c: { id: string }) => c.id)

    // Count messages unread by this user (sent by others)
    const { count: unread } = await db
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('conversation_id', ids)
      .neq('sender_id', user.id)
      .eq('is_read', false)

    setCount(unread ?? 0)
  }, [user])

  useEffect(() => {
    load()
    if (!user) return
    const supabase = createClient()

    // Re-count on any message change (INSERT = new message, UPDATE = read receipt)
    const channel = supabase
      .channel(`unread-count:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, load)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, load])

  return count
}
