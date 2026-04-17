import { useEffect, useRef, useState, type Dispatch, type SetStateAction, type RefObject } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Message, Conversation } from '@/components/messages/types'

/**
 * Per-conversation realtime: messages (INSERT + UPDATE) + presence for
 * typing/online-in-chat. Re-subscribes when `activeId` or `userId` changes.
 * Also auto-marks incoming messages (not from me) as read.
 *
 * Returns a `broadcastTyping()` to call on input keystrokes — it tracks
 * `typing: true` and auto-resets to `false` after 2.5s of inactivity.
 */
export function useActiveConversationChannel(opts: {
  userId: string | undefined
  activeId: string | null
  setMessages: Dispatch<SetStateAction<Message[]>>
  setConversations: Dispatch<SetStateAction<Conversation[]>>
}) {
  const { userId, activeId, setMessages, setConversations } = opts
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [isOtherOnline, setIsOtherOnline] = useState(false)

  useEffect(() => {
    if (!activeId || !userId) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    setIsOtherTyping(false)
    setIsOtherOnline(false)

    const channel = supabase.channel(`msgs:${activeId}`, { config: { presence: { key: userId } } })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newMsg = payload.new as Message
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          setConversations(prev => prev.map(c => c.id === activeId ? { ...c, last_message: newMsg.text || (newMsg.attachment_name ?? '📎'), last_message_at: newMsg.created_at } : c))
          if (newMsg.sender_id !== userId) db.from('messages').update({ is_read: true }).eq('id', newMsg.id).then(() => {})
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const updated = payload.new as Message
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
        })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, { userId: string; typing: boolean }[]>
        const others = Object.values(state).flat().filter(p => p.userId !== userId)
        setIsOtherOnline(others.length > 0)
        setIsOtherTyping(others.some(p => p.typing))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId, typing: false })
        }
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, userId])

  function broadcastTyping() {
    if (!channelRef.current || !userId) return
    channelRef.current.track({ userId, typing: true })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      channelRef.current?.track({ userId, typing: false })
    }, 2500)
  }

  return { isOtherTyping, isOtherOnline, broadcastTyping }
}

/**
 * Global online presence — every authed user joins `online:global` and
 * tracks their userId. Returns the set of userIds currently online.
 */
export function useOnlinePresence(userId: string | undefined): Set<string> {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    const ch = supabase.channel('online:global', { config: { presence: { key: userId } } })
      .on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as Record<string, { userId: string }[]>
        const ids = new Set(Object.values(state).flat().map(p => p.userId))
        setOnlineUserIds(ids)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await ch.track({ userId })
      })
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return onlineUserIds
}

/**
 * Listens for new messages in any conversation other than the currently-open
 * one and bumps that conversation's unread/last_message. If the message's
 * conversation isn't in the list yet (e.g. first contact), triggers a full
 * reload via `refetchConversations`.
 */
export function useInboxNotifications(opts: {
  userId: string | undefined
  activeIdRef: RefObject<string | null>
  setConversations: Dispatch<SetStateAction<Conversation[]>>
  refetchConversations: () => void
}) {
  const { userId, activeIdRef, setConversations, refetchConversations } = opts
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return
    const channel = supabase.channel(`inbox:${userId}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const msg = payload.new as Message
        if (msg.sender_id === userId) return
        if (msg.conversation_id === activeIdRef.current) return
        setConversations(prev => {
          if (!prev.some(c => c.id === msg.conversation_id)) { refetchConversations(); return prev }
          return [...prev.map(c => c.id === msg.conversation_id ? { ...c, unread: c.unread + 1, last_message: msg.text || '📎', last_message_at: msg.created_at } : c)]
            .sort((a, b) => (b.last_message_at ? new Date(b.last_message_at).getTime() : 0) - (a.last_message_at ? new Date(a.last_message_at).getTime() : 0))
        })
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
