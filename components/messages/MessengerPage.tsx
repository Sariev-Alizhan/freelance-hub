'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Send, Search, ArrowLeft, MessageSquare, LogIn,
  CheckCheck, Check, Loader2, Paperclip, X, FileText, Download, BadgeCheck, CornerUpLeft,
} from 'lucide-react'
import EmojiPickerPopover, { FH_STICKER_SET } from './EmojiPickerPopover'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { RealtimeChannel } from '@supabase/supabase-js'

// ── Types ────────────────────────────────────────────────────────────────────

interface OtherUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  username: string | null
  is_verified?: boolean | null
}

interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message: string | null
  last_message_at: string | null
  other_user: OtherUser
  unread: number
}

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  is_read: boolean
  created_at: string
  attachment_url?: string | null
  attachment_type?: 'image' | 'file' | null
  attachment_name?: string | null
  reply_to_id?:   string | null
  reply_to_text?: string | null
  reply_to_name?: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ user, size = 40 }: { user: OtherUser; size?: number }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.full_name || 'User'}
        width={size} height={size}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
        unoptimized
      />
    )
  }
  const initials = (user.full_name || '?').split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.38, background: '#7170ff' }}
    >
      {initials}
    </div>
  )
}

// ── AttachmentBubble ──────────────────────────────────────────────────────────

function AttachmentBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  if (!msg.attachment_url) return null

  if (msg.attachment_type === 'image') {
    return (
      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <Image
          src={msg.attachment_url}
          alt={msg.attachment_name || 'image'}
          width={220} height={160}
          className="rounded-2xl object-cover"
          style={{ maxHeight: 180, width: 'auto' }}
          unoptimized
        />
      </a>
    )
  }

  return (
    <a
      href={msg.attachment_url}
      target="_blank"
      rel="noopener noreferrer"
      download={msg.attachment_name}
      className="mt-1 flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--fh-surface-2)',
        maxWidth: 220,
        textDecoration: 'none',
      }}
    >
      <FileText className="h-4 w-4 flex-shrink-0" style={{ color: isMine ? '#fff' : 'var(--fh-t3)' }} />
      <span className="flex-1 min-w-0 truncate" style={{ fontSize: 12, color: isMine ? '#fff' : 'var(--fh-t2)', fontWeight: 510 }}>
        {msg.attachment_name || 'File'}
      </span>
      <Download className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isMine ? 'rgba(255,255,255,0.6)' : 'var(--fh-t4)' }} />
    </a>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MessengerPage() {
  const { user, loading } = useUser()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const searchParams = useSearchParams()
  const openUserId = searchParams.get('open')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId,      setActiveId]       = useState<string | null>(null)
  const [messages,      setMessages]       = useState<Message[]>([])
  const [text,          setText]           = useState('')
  const [search,        setSearch]         = useState('')
  const [convsLoading,  setConvsLoading]   = useState(true)
  const [msgsLoading,   setMsgsLoading]    = useState(false)
  const [sending,       setSending]        = useState(false)
  const [showList,      setShowList]       = useState(true)

  // Reply-to
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; name: string } | null>(null)

  // Typing indicator + online presence
  const [isOtherTyping,  setIsOtherTyping]  = useState(false)
  const [isOtherOnline,  setIsOtherOnline]  = useState(false)
  const [onlineUserIds,  setOnlineUserIds]  = useState<Set<string>>(new Set())
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Message reactions ─────────────────────────────────────────────────────
  // { messageId: { emoji: { count, mine } } }
  type ReactionMap = Record<string, Record<string, { count: number; mine: boolean }>>
  const [reactions,    setReactions]    = useState<ReactionMap>({})
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const QUICK_REACTIONS = useMemo(() => ['👍', '❤️', '😂', '😮', '😢', '🔥', '💜', '✅'], [])

  const [attachment,     setAttachment]    = useState<File | null>(null)
  const [attachPreview,  setAttachPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const msgsContainerRef = useRef<HTMLDivElement>(null)
  const channelRef       = useRef<RealtimeChannel | null>(null)
  const inputRef         = useRef<HTMLTextAreaElement>(null)
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const activeIdRef      = useRef<string | null>(null)
  const MAX_MSG_LEN      = 4000

  const activeConv = conversations.find(c => c.id === activeId) ?? null

  // Lock page scroll
  useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [])

  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  // ── Load conversations ────────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    if (!user) return
    setConvsLoading(true)
    try {
      const { data } = await db
        .from('conversations')
        .select(`
          id, participant_1, participant_2, last_message, last_message_at,
          p1:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, username, is_verified),
          p2:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, username, is_verified)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (data) {
        const ids = data.map((c: { id: string }) => c.id)
        const { data: unreadData } = await db
          .from('messages')
          .select('conversation_id')
          .in('conversation_id', ids)
          .neq('sender_id', user.id)
          .eq('is_read', false)

        const unreadMap: Record<string, number> = {}
        for (const row of (unreadData ?? [])) {
          unreadMap[row.conversation_id] = (unreadMap[row.conversation_id] ?? 0) + 1
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const convs: Conversation[] = data.map((c: any) => {
          const isP1 = c.participant_1 === user.id
          const otherRaw = isP1 ? c.p2 : c.p1
          const other: OtherUser = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw
          return {
            id: c.id,
            participant_1: c.participant_1,
            participant_2: c.participant_2,
            last_message: c.last_message,
            last_message_at: c.last_message_at,
            other_user: other ?? { id: '', full_name: 'User', avatar_url: null },
            unread: unreadMap[c.id] ?? 0,
          }
        })
        setConversations(convs)
      }
    } finally {
      setConvsLoading(false)
    }
  }, [user])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Auto-open ?open=userId ────────────────────────────────────────────────

  useEffect(() => {
    if (!openUserId || !user || convsLoading) return
    const existing = conversations.find(c => c.other_user.id === openUserId)
    if (existing) { setActiveId(existing.id); setShowList(false); return }

    async function createAndOpen() {
      const [p1, p2] = [user!.id, openUserId!].sort()
      const { data: found } = await db.from('conversations').select('id').eq('participant_1', p1).eq('participant_2', p2).maybeSingle()
      if (found) { setActiveId(found.id); setShowList(false); await loadConversations(); return }
      const { data: created, error } = await db.from('conversations').insert({ participant_1: p1, participant_2: p2 }).select('id').single()
      if (error) { console.error('[messenger] createConversation error:', error.message); return }
      if (created) { await loadConversations(); setActiveId(created.id); setShowList(false) }
    }
    createAndOpen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUserId, user, convsLoading])

  // ── Load messages ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!activeId) return
    setMsgsLoading(true)
    setMessages([])
    setReactions({})
    db.from('messages').select('*').eq('conversation_id', activeId).order('created_at', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: any) => {
        if (data) {
          setMessages(data)
          loadReactions(data.map((m: Message) => m.id))
        }
        setMsgsLoading(false)
      })
    if (user) {
      db.from('messages').update({ is_read: true }).eq('conversation_id', activeId).neq('sender_id', user.id).eq('is_read', false)
      setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c))
    }
  }, [activeId])

  // ── Realtime per-conversation (messages + presence) ──────────────────────

  useEffect(() => {
    if (!activeId || !user) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    setIsOtherTyping(false)
    setIsOtherOnline(false)

    const channel = supabase.channel(`msgs:${activeId}`, { config: { presence: { key: user.id } } })
      // DB changes
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newMsg = payload.new as Message
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
          setConversations(prev => prev.map(c => c.id === activeId ? { ...c, last_message: newMsg.text || (newMsg.attachment_name ?? '📎'), last_message_at: newMsg.created_at } : c))
          if (newMsg.sender_id !== user.id) db.from('messages').update({ is_read: true }).eq('id', newMsg.id)
        })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const updated = payload.new as Message
          setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
        })
      // Presence — typing + online
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, { userId: string; typing: boolean }[]>
        const others = Object.values(state).flat().filter(p => p.userId !== user.id)
        setIsOtherOnline(others.length > 0)
        setIsOtherTyping(others.some(p => p.typing))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: user.id, typing: false })
        }
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, user?.id])

  // ── Global online presence (who's currently in the app) ──────────────────

  useEffect(() => {
    if (!user) return
    const ch = supabase.channel('online:global', { config: { presence: { key: user.id } } })
      .on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState() as Record<string, { userId: string }[]>
        const ids = new Set(Object.values(state).flat().map(p => p.userId))
        setOnlineUserIds(ids)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') await ch.track({ userId: user.id })
      })
    return () => { supabase.removeChannel(ch) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── Broadcast typing state ────────────────────────────────────────────────

  function broadcastTyping() {
    if (!channelRef.current) return
    channelRef.current.track({ userId: user?.id, typing: true })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      channelRef.current?.track({ userId: user?.id, typing: false })
    }, 2500)
  }

  // ── Realtime global inbox ─────────────────────────────────────────────────

  useEffect(() => {
    if (!user) return
    const channel = supabase.channel(`inbox:${user.id}`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const msg = payload.new as Message
        if (msg.sender_id === user.id) return
        if (msg.conversation_id === activeIdRef.current) return
        setConversations(prev => {
          if (!prev.some(c => c.id === msg.conversation_id)) { loadConversations(); return prev }
          return [...prev.map(c => c.id === msg.conversation_id ? { ...c, unread: c.unread + 1, last_message: msg.text || '📎', last_message_at: msg.created_at } : c)]
            .sort((a, b) => (b.last_message_at ? new Date(b.last_message_at).getTime() : 0) - (a.last_message_at ? new Date(a.last_message_at).getTime() : 0))
        })
      }).subscribe()
    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    const el = msgsContainerRef.current
    if (!el) return
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    if (dist < 200 || messages.length <= 20) el.scrollTop = el.scrollHeight
  }, [messages])

  // ── File attachment ───────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAttachment(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = ev => setAttachPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setAttachPreview(null)
    }
    e.target.value = ''
  }

  function clearAttachment() { setAttachment(null); setAttachPreview(null); setUploadProgress(null) }

  // ── Emoji / sticker helpers ────────────────────────────────────────────────

  function insertEmoji(emoji: string) {
    const el = inputRef.current
    if (!el) { setText(t => t + emoji); return }
    const start = el.selectionStart ?? text.length
    const end   = el.selectionEnd   ?? text.length
    const next  = text.slice(0, start) + emoji + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  async function sendSticker(stickerText: string) {
    if (!activeId || !user || sending) return
    setSending(true)
    const optimistic: Message = {
      id: crypto.randomUUID(), conversation_id: activeId, sender_id: user.id,
      text: stickerText, is_read: false, created_at: new Date().toISOString(),
      attachment_url: null, attachment_type: null, attachment_name: null,
    }
    setMessages(prev => [...prev, optimistic])
    try {
      const { data, error } = await db.from('messages')
        .insert({ conversation_id: activeId, sender_id: user.id, text: stickerText })
        .select('*').single()
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
    } finally {
      setSending(false)
    }
  }

  // ── Load reactions for a batch of message IDs ────────────────────────────
  const loadReactions = useCallback(async (msgIds: string[]) => {
    if (!msgIds.length) return
    const { data } = await db
      .from('message_reactions')
      .select('message_id, emoji, user_id')
      .in('message_id', msgIds)
    const map: ReactionMap = {}
    for (const r of (data ?? [])) {
      if (!map[r.message_id]) map[r.message_id] = {}
      if (!map[r.message_id][r.emoji]) map[r.message_id][r.emoji] = { count: 0, mine: false }
      map[r.message_id][r.emoji].count++
      if (r.user_id === user?.id) map[r.message_id][r.emoji].mine = true
    }
    setReactions(map)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── Toggle a reaction (optimistic) ────────────────────────────────────────
  async function toggleReaction(messageId: string, emoji: string) {
    if (!user) return
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
        .eq('user_id', user.id)
        .eq('emoji', emoji)
    } else {
      await db.from('message_reactions')
        .upsert({ message_id: messageId, user_id: user.id, emoji })
    }
  }

  // Detect current theme for emoji picker
  const isDark = typeof document !== 'undefined'
    ? document.documentElement.classList.contains('dark')
    : true

  // ── Send message ──────────────────────────────────────────────────────────

  async function sendMessage() {
    if ((!text.trim() && !attachment) || !activeId || !user || sending) return
    if (text.length > MAX_MSG_LEN) return
    const msgText  = text.trim()
    const replySnap = replyTo ? { ...replyTo } : null
    setText('')
    setReplyTo(null)
    setSending(true)

    let attachmentUrl: string | null = null
    let attachmentType: 'image' | 'file' | null = null
    let attachmentName: string | null = null

    if (attachment) {
      setUploadProgress(0)
      const path = `${user.id}/${Date.now()}_${attachment.name}`
      const { data: upData, error: upErr } = await supabase.storage.from('chat-attachments').upload(path, attachment, { upsert: false })
      if (!upErr && upData) {
        const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(path)
        attachmentUrl = urlData.publicUrl
        attachmentType = attachment.type.startsWith('image/') ? 'image' : 'file'
        attachmentName = attachment.name
      }
      setUploadProgress(null)
      clearAttachment()
    }

    const optimistic: Message = {
      id: crypto.randomUUID(), conversation_id: activeId, sender_id: user.id,
      text: msgText || (attachmentName ?? ''), is_read: false, created_at: new Date().toISOString(),
      attachment_url: attachmentUrl, attachment_type: attachmentType, attachment_name: attachmentName,
      reply_to_id: replySnap?.id ?? null, reply_to_text: replySnap?.text ?? null, reply_to_name: replySnap?.name ?? null,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const { data, error } = await db.from('messages').insert({
        conversation_id: activeId, sender_id: user.id,
        text: msgText || (attachmentName ?? '📎'),
        attachment_url: attachmentUrl, attachment_type: attachmentType, attachment_name: attachmentName,
        reply_to_id: replySnap?.id ?? null, reply_to_text: replySnap?.text ?? null, reply_to_name: replySnap?.name ?? null,
      }).select('*').single()
      if (error) throw error
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setText(msgText)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function selectConv(id: string) { setActiveId(id); setShowList(false) }
  const filteredConvs = conversations.filter(c => !search || (c.other_user.full_name ?? '').toLowerCase().includes(search.toLowerCase()))

  // ── Auth guard ────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="messenger-height flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--fh-t4)' }} />
    </div>
  )

  if (!user) return (
    <div className="messenger-height flex flex-col items-center justify-center gap-5 px-4">
      <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(113,112,255,0.1)' }}>
        <LogIn className="h-8 w-8" style={{ color: '#7170ff' }} />
      </div>
      <div className="text-center">
        <h2 style={{ fontSize: 18, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 6 }}>Sign in to view messages</h2>
        <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>You need an account to use messaging</p>
      </div>
      <Link href="/auth/login" className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: '#7170ff' }}>
        Sign in
      </Link>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex overflow-hidden messenger-height">

      {/* ── Sidebar: Conversation List ────────────────────────────────────── */}
      <div
        className={`flex flex-col flex-shrink-0 ${showList ? 'flex' : 'hidden md:flex'}`}
        style={{
          width: 'clamp(260px, 30vw, 360px)',
          borderRight: '1px solid var(--fh-sep)',
          background: 'var(--fh-surface)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex-shrink-0">
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: 14 }}>
            Messages
          </h1>

          {/* Search pill */}
          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: 36,
              borderRadius: 18,
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)',
            }}
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'var(--fh-t1)', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-t4)' }} />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 px-6 text-center">
              <MessageSquare className="h-9 w-9" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
              <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
                {search ? 'No results' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filteredConvs.map(conv => {
              const isActive = activeId === conv.id
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConv(conv.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                  style={{
                    background: isActive ? 'var(--fh-surface-2)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar user={conv.other_user} size={44} />
                    {/* Online dot */}
                    {onlineUserIds.has(conv.other_user.id) && conv.unread === 0 && (
                      <span style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 10, height: 10, borderRadius: '50%',
                        background: '#27a644', border: '2px solid var(--fh-surface)',
                      }} />
                    )}
                    {conv.unread > 0 && (
                      <span
                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full font-bold text-white"
                        style={{ minWidth: 17, height: 17, fontSize: 10, padding: '0 3px', background: '#7170ff' }}
                      >
                        {conv.unread}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1 mb-0.5">
                      <span
                        className="truncate"
                        style={{
                          fontSize: 14,
                          fontWeight: conv.unread > 0 ? 700 : 590,
                          color: 'var(--fh-t1)',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {conv.other_user.full_name || 'User'}
                      </span>
                      {conv.last_message_at && (
                        <span style={{ fontSize: 11, color: 'var(--fh-t4)', flexShrink: 0 }}>
                          {formatTime(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    <p
                      className="truncate"
                      style={{
                        fontSize: 12,
                        color: conv.unread > 0 ? 'var(--fh-t2)' : 'var(--fh-t4)',
                        fontWeight: conv.unread > 0 ? 500 : 400,
                      }}
                    >
                      {conv.last_message || 'No messages'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Main: Chat window ─────────────────────────────────────────────── */}
      <div
        className={`flex flex-col flex-1 min-w-0 ${!showList ? 'flex' : 'hidden md:flex'}`}
        style={{ background: 'var(--fh-canvas, var(--background))' }}
      >
        {activeConv ? (
          <>
            {/* Chat header */}
            <div
              className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
              style={{
                borderBottom: '1px solid var(--fh-sep)',
                background: 'var(--fh-surface)',
                minHeight: 56,
              }}
            >
              <button
                onClick={() => setShowList(true)}
                className="md:hidden flex-shrink-0"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t3)', padding: 4 }}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              {activeConv.other_user.username ? (
                <Link href={`/u/${activeConv.other_user.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <Avatar user={activeConv.other_user} size={36} />
                </Link>
              ) : (
                <Avatar user={activeConv.other_user} size={36} />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  {activeConv.other_user.username ? (
                    <Link href={`/u/${activeConv.other_user.username}`}
                      style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em', textDecoration: 'none' }}>
                      {activeConv.other_user.full_name || 'User'}
                    </Link>
                  ) : (
                    <p style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
                      {activeConv.other_user.full_name || 'User'}
                    </p>
                  )}
                  {activeConv.other_user.is_verified && (
                    <BadgeCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#5e6ad2' }} />
                  )}
                </div>
                {/* Online / Typing status line */}
                <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                  {isOtherTyping ? (
                    <span style={{ fontSize: 11, color: '#7170ff', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="typing-dots">
                        <span /><span /><span />
                      </span>
                      typing…
                    </span>
                  ) : isOtherOnline ? (
                    <span style={{ fontSize: 11, color: '#27a644', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#27a644', display: 'inline-block' }} />
                      online
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={msgsContainerRef}
              className="flex-1 overflow-y-auto"
              style={{ padding: '16px 16px 8px' }}
            >
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-t4)' }} />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <Avatar user={activeConv.other_user} size={56} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 4 }}>
                      {activeConv.other_user.full_name || 'User'}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
                      Say hi 👋
                    </p>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_id === user.id
                    const prevMsg = messages[idx - 1]
                    const nextMsg = messages[idx + 1]
                    const showDate = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at)
                    const gap = prevMsg && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 5 * 60 * 1000
                    const sameAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id && !showDate && gap
                    const sameAsNext = nextMsg && nextMsg.sender_id === msg.sender_id && isSameDay(msg.created_at, nextMsg.created_at) &&
                      (new Date(nextMsg.created_at).getTime() - new Date(msg.created_at).getTime()) < 5 * 60 * 1000

                    // Bubble corner rounding: Instagram style
                    // Mine: pill, except bottom-right corner when grouped
                    // Theirs: pill, except bottom-left corner when grouped
                    const br = isMine
                      ? `20px 20px ${sameAsNext ? '4px' : '20px'} 20px`
                      : `20px 20px 20px ${sameAsNext ? '4px' : '20px'}`

                    const isLastInGroup = !sameAsNext
                    const msgReactions  = reactions[msg.id] ?? {}
                    const hasReactions  = Object.keys(msgReactions).length > 0

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.12 }}
                        style={{ marginTop: sameAsPrev ? 2 : 12, position: 'relative' }}
                        onMouseEnter={() => setHoveredMsgId(msg.id)}
                        onMouseLeave={() => setHoveredMsgId(null)}
                      >
                        {/* Date divider */}
                        {showDate && (
                          <div className="flex items-center gap-3 mb-3 mt-2">
                            <div className="flex-1 h-px" style={{ background: 'var(--fh-sep)' }} />
                            <span style={{ fontSize: 11, color: 'var(--fh-t4)', letterSpacing: '0.02em' }}>
                              {formatDate(msg.created_at)}
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'var(--fh-sep)' }} />
                          </div>
                        )}

                        {/* ── Hover reaction bar ───────────────────────── */}
                        {hoveredMsgId === msg.id && (
                          <div
                            className={`flex items-center gap-1 mb-1 ${isMine ? 'justify-end pr-10' : 'justify-start pl-10'}`}
                          >
                            <div
                              className="flex items-center gap-0.5 px-2 py-1 rounded-full"
                              style={{
                                background: 'var(--fh-surface)',
                                border: '1px solid var(--fh-border)',
                                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                              }}
                            >
                              {QUICK_REACTIONS.map(emoji => (
                                <button
                                  key={emoji}
                                  onClick={() => toggleReaction(msg.id, emoji)}
                                  style={{
                                    background: msgReactions[emoji]?.mine ? 'rgba(113,112,255,0.12)' : 'transparent',
                                    border: 'none', cursor: 'pointer', borderRadius: 6,
                                    padding: '2px 3px', fontSize: 16, lineHeight: 1,
                                    transition: 'transform 0.1s, background 0.15s',
                                  }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.25)' }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
                                >
                                  {emoji}
                                </button>
                              ))}
                              {/* Separator + Reply */}
                              <div style={{ width: 1, height: 18, background: 'var(--fh-sep)', margin: '0 2px' }} />
                              <button
                                onClick={() => {
                                  const senderName = isMine
                                    ? 'You'
                                    : (activeConv.other_user.full_name ?? 'User')
                                  setReplyTo({ id: msg.id, text: msg.text || '📎 Attachment', name: senderName })
                                  setHoveredMsgId(null)
                                  inputRef.current?.focus()
                                }}
                                title="Reply"
                                style={{
                                  background: 'transparent', border: 'none', cursor: 'pointer',
                                  borderRadius: 6, padding: '3px 5px', color: 'var(--fh-t3)',
                                  display: 'flex', alignItems: 'center',
                                  transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#7170ff' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t3)' }}
                              >
                                <CornerUpLeft className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                          {/* Other user avatar — only on last of their group */}
                          {!isMine && (
                            <div className="flex-shrink-0" style={{ width: 28 }}>
                              {isLastInGroup
                                ? <Avatar user={activeConv.other_user} size={28} />
                                : null
                              }
                            </div>
                          )}

                          <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`} style={{ maxWidth: '68%' }}>
                            {/* Text bubble — or sticker if in FH pack */}
                            {msg.text && !(msg.attachment_url && !msg.text.trim()) && (
                              FH_STICKER_SET.has(msg.text) ? (
                                // ── FH Sticker bubble ────────────────────────
                                <div style={{
                                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                                  gap: 2, padding: '10px 14px',
                                  borderRadius: 20,
                                  background: isMine ? 'rgba(94,106,210,0.12)' : 'var(--fh-surface-2)',
                                  border: `1px solid ${isMine ? 'rgba(94,106,210,0.25)' : 'var(--fh-sep)'}`,
                                  minWidth: 80,
                                }}>
                                  <span style={{ fontSize: 36, lineHeight: 1 }}>
                                    {msg.text.split(' ')[0]}
                                  </span>
                                  <span style={{
                                    fontSize: 11, fontWeight: 700,
                                    color: isMine ? '#7170ff' : 'var(--fh-t2)',
                                    letterSpacing: '-0.01em',
                                  }}>
                                    {msg.text.slice(msg.text.indexOf(' ') + 1)}
                                  </span>
                                  <span style={{ fontSize: 8, color: 'var(--fh-t4)', fontWeight: 600, letterSpacing: '0.05em' }}>
                                    FreelanceHub
                                  </span>
                                </div>
                              ) : (
                                // ── Regular text bubble ───────────────────────
                                <div style={{
                                  padding: msg.reply_to_text ? '8px 14px 9px' : '9px 14px',
                                  borderRadius: br,
                                  fontSize: 14,
                                  lineHeight: 1.45,
                                  wordBreak: 'break-word',
                                  background: isMine ? '#5e6ad2' : 'var(--fh-surface-2)',
                                  color: isMine ? '#ffffff' : 'var(--fh-t1)',
                                }}>
                                  {/* Quoted reply */}
                                  {msg.reply_to_text && (
                                    <div style={{
                                      marginBottom: 7,
                                      padding: '5px 10px',
                                      borderRadius: 8,
                                      borderLeft: `3px solid ${isMine ? 'rgba(255,255,255,0.5)' : '#7170ff'}`,
                                      background: isMine ? 'rgba(255,255,255,0.12)' : 'rgba(113,112,255,0.08)',
                                    }}>
                                      <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, color: isMine ? 'rgba(255,255,255,0.8)' : '#7170ff' }}>
                                        {msg.reply_to_name}
                                      </p>
                                      <p className="line-clamp-2" style={{ fontSize: 12, color: isMine ? 'rgba(255,255,255,0.65)' : 'var(--fh-t3)', lineHeight: 1.35 }}>
                                        {msg.reply_to_text}
                                      </p>
                                    </div>
                                  )}
                                  {msg.text}
                                </div>
                              )
                            )}

                            {/* Attachment */}
                            <AttachmentBubble msg={msg} isMine={isMine} />

                            {/* Time + read receipt — only on last of group */}
                            {isLastInGroup && (
                              <div
                                className={`flex items-center gap-1 mt-1 ${isMine ? 'flex-row-reverse' : ''}`}
                              >
                                <span style={{ fontSize: 10, color: 'var(--fh-t4)' }}>
                                  {formatTime(msg.created_at)}
                                </span>
                                {isMine && (
                                  msg.is_read
                                    ? <CheckCheck className="h-3 w-3" style={{ color: '#7170ff' }} />
                                    : <Check className="h-3 w-3" style={{ color: 'var(--fh-t4)' }} />
                                )}
                              </div>
                            )}

                            {/* Reaction pills */}
                            {hasReactions && (
                              <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                {Object.entries(msgReactions).map(([emoji, { count, mine }]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleReaction(msg.id, emoji)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: 3,
                                      padding: '2px 7px', borderRadius: 10, fontSize: 12,
                                      border: `1px solid ${mine ? 'rgba(113,112,255,0.4)' : 'var(--fh-border)'}`,
                                      background: mine ? 'rgba(113,112,255,0.1)' : 'var(--fh-surface)',
                                      cursor: 'pointer', fontWeight: mine ? 700 : 400,
                                      color: mine ? '#7170ff' : 'var(--fh-t2)',
                                    }}
                                  >
                                    <span style={{ fontSize: 13 }}>{emoji}</span>
                                    {count > 1 && <span>{count}</span>}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
              <div style={{ height: 4 }} />
            </div>

            {/* Reply preview */}
            {replyTo && (
              <div
                className="mx-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(113,112,255,0.06)', border: '1px solid rgba(113,112,255,0.2)', borderLeft: '3px solid #7170ff' }}
              >
                <CornerUpLeft className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#7170ff' }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#7170ff', marginBottom: 1 }}>{replyTo.name}</p>
                  <p className="truncate" style={{ fontSize: 12, color: 'var(--fh-t3)' }}>{replyTo.text}</p>
                </div>
                <button onClick={() => setReplyTo(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 2, flexShrink: 0 }}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Attachment preview */}
            {attachment && (
              <div
                className="mx-3 mb-2 flex items-center gap-3 px-3 py-2"
                style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', borderRadius: 14 }}
              >
                {attachPreview ? (
                  <img src={attachPreview} alt="preview" className="rounded-lg object-cover flex-shrink-0" style={{ height: 36, width: 36 }} />
                ) : (
                  <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ height: 36, width: 36, background: 'rgba(113,112,255,0.1)' }}>
                    <FileText className="h-4 w-4" style={{ color: '#7170ff' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: 12, fontWeight: 510, color: 'var(--fh-t1)' }}>{attachment.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{humanSize(attachment.size)}</p>
                </div>
                {uploadProgress !== null && (
                  <div className="flex-shrink-0 overflow-hidden" style={{ width: 60, height: 3, borderRadius: 2, background: 'var(--fh-surface-2)' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#7170ff', transition: 'width 0.2s' }} />
                  </div>
                )}
                <button onClick={clearAttachment} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 2 }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Input row */}
            <div
              className="flex items-end gap-2 px-3 flex-shrink-0"
              style={{
                paddingTop: 10,
                paddingBottom: 12,
                borderTop: '1px solid var(--fh-sep)',
                background: 'var(--fh-surface)',
              }}
            >
              {/* Attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                className="flex-shrink-0 flex items-center justify-center transition-colors"
                style={{
                  width: 36, height: 36, borderRadius: 18,
                  background: 'var(--fh-surface-2)',
                  border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t4)', cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t4)' }}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt" onChange={handleFileSelect} />

              {/* Emoji + Sticker picker */}
              <EmojiPickerPopover
                onEmoji={insertEmoji}
                onSticker={sendSticker}
                isDark={isDark}
              />

              {/* Text input — pill shape */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => {
                    if (e.target.value.length > MAX_MSG_LEN) return
                    setText(e.target.value)
                    if (e.target.value) broadcastTyping()
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={e => {
                    const isMobile = window.matchMedia('(hover: none)').matches
                    if (e.key === 'Enter' && !e.shiftKey && !isMobile) { e.preventDefault(); sendMessage() }
                  }}
                  placeholder="Message…"
                  rows={1}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--fh-border)',
                    background: 'var(--fh-surface-2)',
                    color: 'var(--fh-t1)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    lineHeight: 1.45,
                    resize: 'none',
                    outline: 'none',
                    maxHeight: 120,
                    display: 'block',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#7170ff' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--fh-border)' }}
                />
                {text.length > MAX_MSG_LEN * 0.85 && (
                  <span className={`absolute bottom-1.5 right-3 text-[10px] ${text.length >= MAX_MSG_LEN ? 'text-red-400' : ''}`} style={{ color: text.length >= MAX_MSG_LEN ? '#e5484d' : 'var(--fh-t4)' }}>
                    {MAX_MSG_LEN - text.length}
                  </span>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={sendMessage}
                disabled={(!text.trim() && !attachment) || sending}
                className="flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  width: 36, height: 36, borderRadius: 18, border: 'none', cursor: 'pointer',
                  background: (text.trim() || attachment) ? '#5e6ad2' : 'var(--fh-surface-2)',
                  color: (text.trim() || attachment) ? '#fff' : 'var(--fh-t4)',
                  opacity: (!text.trim() && !attachment) || sending ? 0.5 : 1,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {sending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" style={{ transform: 'translateX(1px)' }} />
                }
              </button>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div
              className="flex items-center justify-center"
              style={{ width: 72, height: 72, borderRadius: 24, background: 'rgba(113,112,255,0.08)' }}
            >
              <MessageSquare className="h-9 w-9" style={{ color: '#7170ff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                Your messages
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fh-t4)', maxWidth: 240 }}>
                Select a conversation or start a new one
              </p>
            </div>
            <Link
              href="/freelancers"
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
              style={{ background: 'rgba(113,112,255,0.1)', color: '#7170ff', border: '1px solid rgba(113,112,255,0.2)', textDecoration: 'none' }}
            >
              Find freelancers
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
