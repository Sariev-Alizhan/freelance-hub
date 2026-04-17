import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Conversation, Message, OtherUser } from '@/components/messages/types'

/**
 * Owns the messenger's conversation + message state: the conversation list
 * (with computed unread counts), the active conversation id, the message
 * list for that conversation, and both loading flags. Wires up three effects:
 *
 *   1. Initial load of conversations when `userId` becomes available.
 *   2. Auto-open: if `openUserId` is set (from `?open=<userId>`), find or
 *      create the 1:1 conversation with that user and select it.
 *   3. On `activeId` change: fetch messages, mark incoming as read, clear
 *      local unread count.
 *
 * `onAutoOpenedConversation` fires after step 2 sets activeId — the
 * messenger uses this to flip `showList` to false on mobile.
 *
 * `onMessagesLoaded(ids)` fires before and after step 3's fetch — the
 * messenger uses this to clear/load reactions alongside messages. Called
 * with `[]` before the fetch and with the message ids after.
 */
export function useConversationsData(opts: {
  userId: string | undefined
  openUserId: string | null
  onAutoOpenedConversation?: () => void
  onMessagesLoaded?: (msgIds: string[]) => void
}) {
  const { userId, openUserId, onAutoOpenedConversation, onMessagesLoaded } = opts
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId,      setActiveId]       = useState<string | null>(null)
  const [messages,      setMessages]       = useState<Message[]>([])
  const [convsLoading,  setConvsLoading]   = useState(true)
  const [msgsLoading,   setMsgsLoading]    = useState(false)
  const activeIdRef = useRef<string | null>(null)

  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  const loadConversations = useCallback(async () => {
    if (!userId) return
    setConvsLoading(true)
    try {
      const { data } = await db
        .from('conversations')
        .select(`
          id, participant_1, participant_2, last_message, last_message_at,
          p1:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, username, is_verified),
          p2:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, username, is_verified)
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (data) {
        const ids = data.map((c: { id: string }) => c.id)
        const { data: unreadData } = await db
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', ids)
          .neq('sender_id', userId)
          .eq('is_read', false)

        const unreadMap: Record<string, number> = {}
        for (const row of (unreadData ?? [])) {
          unreadMap[row.conversation_id] = (unreadMap[row.conversation_id] ?? 0) + 1
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const convs: Conversation[] = data.map((c: any) => {
          const isP1 = c.participant_1 === userId
          const otherRaw = isP1 ? c.p2 : c.p1
          const other: OtherUser = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw
          return {
            id: c.id,
            participant_1: c.participant_1,
            participant_2: c.participant_2,
            last_message: c.last_message,
            last_message_at: c.last_message_at,
            other_user: other ?? { id: '', full_name: 'User', avatar_url: null, username: null },
            unread: unreadMap[c.id] ?? 0,
          }
        })
        setConversations(convs)
      }
    } finally {
      setConvsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => { loadConversations() }, [loadConversations])

  // Auto-open ?open=<userId>
  useEffect(() => {
    if (!openUserId || !userId || convsLoading) return
    const existing = conversations.find(c => c.other_user.id === openUserId)
    if (existing) {
      setActiveId(existing.id)
      onAutoOpenedConversation?.()
      return
    }

    async function createAndOpen() {
      const [p1, p2] = [userId!, openUserId!].sort()
      const { data: found } = await db.from('conversations')
        .select('id').eq('participant_1', p1).eq('participant_2', p2).maybeSingle()
      if (found) {
        setActiveId(found.id)
        onAutoOpenedConversation?.()
        await loadConversations()
        return
      }
      const { data: created, error } = await db.from('conversations')
        .insert({ participant_1: p1, participant_2: p2 }).select('id').single()
      if (error) return // failed to create conversation — user stays on list
      if (created) {
        await loadConversations()
        setActiveId(created.id)
        onAutoOpenedConversation?.()
      }
    }
    createAndOpen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUserId, userId, convsLoading])

  // Load messages on active-conversation change + mark them read
  useEffect(() => {
    if (!activeId) return
    setMsgsLoading(true)
    setMessages([])
    onMessagesLoaded?.([])
    db.from('messages').select('*').eq('conversation_id', activeId).order('created_at', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: any) => {
        if (data) {
          setMessages(data)
          onMessagesLoaded?.(data.map((m: Message) => m.id))
        }
        setMsgsLoading(false)
      })
    if (userId) {
      // Supabase query builder is lazy — must .then() to actually fire the UPDATE.
      // Without this, the realtime UPDATE never arrives at useUnreadMessages and
      // the bell/message badge stays red after leaving the chat.
      db.from('messages')
        .update({ is_read: true })
        .eq('conversation_id', activeId)
        .neq('sender_id', userId)
        .eq('is_read', false)
        .then(() => {})
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  return {
    conversations, setConversations,
    activeId, setActiveId,
    activeIdRef,
    messages, setMessages,
    convsLoading, msgsLoading,
    loadConversations,
  }
}
