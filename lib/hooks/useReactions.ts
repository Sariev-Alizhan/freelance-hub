import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ReactionMap } from '@/components/messages/types'

/**
 * Message reactions data layer. Returns the current reaction map plus two
 * ops: `loadReactions(msgIds)` to bulk-fetch from `message_reactions` (pass
 * `[]` to clear), and `toggleReaction(messageId, emoji)` which does an
 * optimistic state update + upsert/delete against the DB.
 */
export function useReactions(userId: string | undefined) {
  const [reactions, setReactions] = useState<ReactionMap>({})
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const loadReactions = useCallback(async (msgIds: string[]) => {
    if (!msgIds.length) { setReactions({}); return }
    const { data } = await db
      .from('message_reactions')
      .select('message_id, emoji, user_id')
      .in('message_id', msgIds)
    const map: ReactionMap = {}
    for (const r of (data ?? [])) {
      if (!map[r.message_id]) map[r.message_id] = {}
      if (!map[r.message_id][r.emoji]) map[r.message_id][r.emoji] = { count: 0, mine: false }
      map[r.message_id][r.emoji].count++
      if (r.user_id === userId) map[r.message_id][r.emoji].mine = true
    }
    setReactions(map)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!userId) return
    const cur = reactions[messageId]?.[emoji]
    const isMine = cur?.mine ?? false

    // Optimistic update
    setReactions(prev => {
      const msgR = { ...(prev[messageId] ?? {}) }
      if (isMine) {
        const newCount = (msgR[emoji]?.count ?? 1) - 1
        if (newCount <= 0) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [emoji]: _removed, ...rest } = msgR
          return { ...prev, [messageId]: rest }
        }
        return { ...prev, [messageId]: { ...msgR, [emoji]: { count: newCount, mine: false } } }
      }
      return { ...prev, [messageId]: { ...msgR, [emoji]: { count: (msgR[emoji]?.count ?? 0) + 1, mine: true } } }
    })

    if (isMine) {
      await db.from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)
        .eq('emoji', emoji)
    } else {
      await db.from('message_reactions')
        .upsert({ message_id: messageId, user_id: userId, emoji })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, reactions])

  return { reactions, loadReactions, toggleReaction }
}
