'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Send, Search, ArrowLeft, User, MessageSquare,
  LogIn, CheckCheck, Check, MoreVertical, Loader2,
  Paperclip, X, FileText, ImageIcon, Download
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { RealtimeChannel } from '@supabase/supabase-js'

// ── Types ──────────────────────────────────────────────────
interface OtherUser {
  id: string
  full_name: string | null
  avatar_url: string | null
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
}

// ── Helpers ────────────────────────────────────────────────
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

function isImage(type: string | null | undefined) {
  return type === 'image'
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ── Avatar ─────────────────────────────────────────────────
function Avatar({ user, size = 40 }: { user: OtherUser; size?: number }) {
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url} alt={user.full_name || 'User'}
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
      className="rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

// ── Attachment preview in bubble ───────────────────────────
function AttachmentBubble({ msg, isMine }: { msg: Message; isMine: boolean }) {
  if (!msg.attachment_url) return null

  if (isImage(msg.attachment_type)) {
    return (
      <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-1">
        <Image
          src={msg.attachment_url}
          alt={msg.attachment_name || 'image'}
          width={240}
          height={160}
          className="rounded-xl object-cover max-w-full"
          style={{ maxHeight: '200px', width: 'auto' }}
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
      className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-opacity hover:opacity-80"
      style={{
        background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--fh-surface-2)',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '220px',
      }}
    >
      <FileText className="h-4 w-4 flex-shrink-0" style={{ color: isMine ? '#fff' : 'var(--fh-t3)' }} />
      <span style={{ fontSize: '12px', color: isMine ? '#fff' : 'var(--fh-t2)', fontWeight: 510, flex: 1, minWidth: 0 }} className="truncate">
        {msg.attachment_name || 'File'}
      </span>
      <Download className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isMine ? '#ffffffaa' : 'var(--fh-t4)' }} />
    </a>
  )
}

// ── Main component ─────────────────────────────────────────
export default function MessengerPage() {
  const { user, loading } = useUser()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const searchParams = useSearchParams()
  const openUserId = searchParams.get('open')

  const [conversations, setConversations]   = useState<Conversation[]>([])
  const [activeId,      setActiveId]         = useState<string | null>(null)
  const [messages,      setMessages]         = useState<Message[]>([])
  const [text,          setText]             = useState('')
  const [search,        setSearch]           = useState('')
  const [convsLoading,  setConvsLoading]     = useState(true)
  const [msgsLoading,   setMsgsLoading]      = useState(false)
  const [sending,       setSending]          = useState(false)
  const [showList,      setShowList]         = useState(true)

  // Attachment state
  const [attachment,        setAttachment]        = useState<File | null>(null)
  const [attachPreview,     setAttachPreview]     = useState<string | null>(null)
  const [uploadProgress,    setUploadProgress]    = useState<number | null>(null)

  const bottomRef    = useRef<HTMLDivElement>(null)
  const channelRef   = useRef<RealtimeChannel | null>(null)
  const inputRef     = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Ref so the global inbox subscription can read activeId without recreating
  const activeIdRef  = useRef<string | null>(null)

  const MAX_MSG_LEN = 4000

  const activeConv = conversations.find(c => c.id === activeId) ?? null

  // Keep ref in sync so the global inbox subscription always has the current value
  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  // ── Load conversations ──────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user) return
    setConvsLoading(true)
    try {
      const { data } = await db
        .from('conversations')
        .select(`
          id, participant_1, participant_2, last_message, last_message_at,
          p1:profiles!conversations_participant_1_fkey(id, full_name, avatar_url),
          p2:profiles!conversations_participant_2_fkey(id, full_name, avatar_url)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (data) {
        // Count unread per conversation
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

  // ── Auto-open conversation from ?open=userId ────────────
  useEffect(() => {
    // Wait until auth is resolved and conversations have finished loading
    if (!openUserId || !user || convsLoading) return

    // Find existing conversation with this user
    const existing = conversations.find(
      c => c.other_user.id === openUserId
    )
    if (existing) {
      setActiveId(existing.id)
      setShowList(false)
      return
    }

    // No existing conversation found — create one
    async function createAndOpen() {
      const [p1, p2] = [user!.id, openUserId!].sort()

      // Double-check in DB (in case RLS filtered it from the list query)
      const { data: found } = await db
        .from('conversations')
        .select('id')
        .eq('participant_1', p1)
        .eq('participant_2', p2)
        .maybeSingle()

      if (found) {
        setActiveId(found.id)
        setShowList(false)
        await loadConversations()
        return
      }

      const { data: created, error } = await db
        .from('conversations')
        .insert({ participant_1: p1, participant_2: p2 })
        .select('id')
        .single()

      if (error) {
        console.error('[messenger] createConversation error:', error.message)
        return
      }
      if (created) {
        await loadConversations()
        setActiveId(created.id)
        setShowList(false)
      }
    }
    createAndOpen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openUserId, user, convsLoading])

  // ── Load messages for active conversation ───────────────
  useEffect(() => {
    if (!activeId) return
    setMsgsLoading(true)
    setMessages([])

    db.from('messages')
      .select('*')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then(({ data }: any) => {
        if (data) setMessages(data)
        setMsgsLoading(false)
      })

    // Mark messages as read
    if (user) {
      db.from('messages')
        .update({ is_read: true })
        .eq('conversation_id', activeId)
        .neq('sender_id', user.id)
        .eq('is_read', false)

      // Clear unread count for this conversation
      setConversations(prev =>
        prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c)
      )
    }
  }, [activeId])

  // ── Realtime subscription (INSERT + UPDATE) ─────────────
  useEffect(() => {
    if (!activeId) return
    if (channelRef.current) supabase.removeChannel(channelRef.current)

    const channel = supabase
      .channel(`msgs:${activeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeId}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        const newMsg = payload.new as Message
        setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg])
        setConversations(prev =>
          prev.map(c =>
            c.id === activeId
              ? { ...c, last_message: newMsg.text || (newMsg.attachment_name ?? '📎'), last_message_at: newMsg.created_at }
              : c
          )
        )
        // Auto-mark incoming message as read (we are in this conversation)
        if (user && newMsg.sender_id !== user.id) {
          db.from('messages').update({ is_read: true }).eq('id', newMsg.id)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeId}`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        const updated = payload.new as Message
        setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
      })
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [activeId])

  // ── Auto-scroll ─────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Global inbox: update conversation list when any new message arrives ──
  // Relies on Supabase Realtime RLS — only delivers messages the user can see.
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`inbox:${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }, (payload: any) => {
        const msg = payload.new as Message
        // Skip own messages; active conv is already handled by the per-conv channel
        if (msg.sender_id === user.id) return
        if (msg.conversation_id === activeIdRef.current) return

        setConversations(prev => {
          const exists = prev.some(c => c.id === msg.conversation_id)
          if (!exists) {
            // Brand-new conversation — reload the full list
            loadConversations()
            return prev
          }
          const updated = prev.map(c =>
            c.id === msg.conversation_id
              ? {
                  ...c,
                  unread: c.unread + 1,
                  last_message: msg.text || (msg.attachment_name ?? '📎'),
                  last_message_at: msg.created_at,
                }
              : c
          )
          // Re-sort newest first
          return [...updated].sort((a, b) => {
            const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
            const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
            return tb - ta
          })
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ── File attachment handler ─────────────────────────────
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
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  function clearAttachment() {
    setAttachment(null)
    setAttachPreview(null)
    setUploadProgress(null)
  }

  // ── Send message ────────────────────────────────────────
  async function sendMessage() {
    if ((!text.trim() && !attachment) || !activeId || !user || sending) return
    if (text.length > MAX_MSG_LEN) return
    const msgText = text.trim()
    setText('')
    setSending(true)

    let attachmentUrl: string | null = null
    let attachmentType: 'image' | 'file' | null = null
    let attachmentName: string | null = null

    // Upload attachment if present
    if (attachment) {
      setUploadProgress(0)
      const ext = attachment.name.split('.').pop()
      const path = `${user.id}/${Date.now()}_${attachment.name}`
      const { data: upData, error: upErr } = await supabase.storage
        .from('chat-attachments')
        .upload(path, attachment, { upsert: false })

      if (upErr) {
        console.error('Upload error:', upErr)
      } else if (upData) {
        const { data: urlData } = supabase.storage.from('chat-attachments').getPublicUrl(path)
        attachmentUrl = urlData.publicUrl
        attachmentType = attachment.type.startsWith('image/') ? 'image' : 'file'
        attachmentName = attachment.name
      }
      setUploadProgress(null)
      clearAttachment()
    }

    // Optimistic update
    const optimistic: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeId,
      sender_id: user.id,
      text: msgText || (attachmentName ?? ''),
      is_read: false,
      created_at: new Date().toISOString(),
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const { data, error } = await db.from('messages').insert({
        conversation_id: activeId,
        sender_id: user.id,
        text: msgText || (attachmentName ?? '📎'),
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        attachment_name: attachmentName,
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

  function selectConv(id: string) {
    setActiveId(id)
    setShowList(false)
  }

  const filteredConvs = conversations.filter(c =>
    !search || (c.other_user.full_name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  // ── Auth guard ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-6 px-4">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <LogIn className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
          <p className="text-muted-foreground">You need to be signed in to view messages</p>
        </div>
        <Link href="/auth/login" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Conversation List ──────────────────────────── */}
      <div className={`
        flex flex-col w-full md:w-80 lg:w-96 border-r border-subtle bg-card flex-shrink-0
        ${showList ? 'flex' : 'hidden md:flex'}
      `}>
        <div className="px-4 pt-4 pb-3 border-b border-subtle">
          <h1 className="text-lg font-bold mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? 'Nothing found' : 'No conversations yet'}
              </p>
              {!search && (
                <p className="text-xs text-muted-foreground/60">
                  Apply to an order or message a freelancer
                </p>
              )}
            </div>
          ) : (
            filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConv(conv.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle ${
                  activeId === conv.id ? 'bg-primary/8 border-r-2 border-primary' : ''
                }`}
              >
                <div className="relative">
                  <Avatar user={conv.other_user} size={44} />
                  {conv.unread > 0 && (
                    <span
                      className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-primary text-white font-bold"
                      style={{ minWidth: '18px', height: '18px', fontSize: '10px', padding: '0 4px' }}
                    >
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm truncate ${conv.unread > 0 ? 'font-bold' : 'font-semibold'}`}>
                      {conv.other_user.full_name || 'User'}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${conv.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message || 'No messages'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Window ────────────────────────────────── */}
      <div className={`
        flex flex-col flex-1 min-w-0
        ${!showList ? 'flex' : 'hidden md:flex'}
      `}>
        {activeConv ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-card flex-shrink-0">
              <button
                onClick={() => setShowList(true)}
                className="md:hidden p-1.5 rounded-lg hover:bg-surface text-muted-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Avatar user={activeConv.other_user} size={40} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">
                  {activeConv.other_user.full_name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground">Freelance platform</div>
              </div>
              <button className="p-2 rounded-lg hover:bg-surface text-muted-foreground transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Start a conversation</p>
                  <p className="text-xs text-muted-foreground">Write the first message</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isMine = msg.sender_id === user.id
                    const prevMsg = messages[idx - 1]
                    const showDate = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at)
                    const sameAuthorAsPrev = prevMsg && prevMsg.sender_id === msg.sender_id &&
                      !showDate &&
                      (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) < 5 * 60 * 1000

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {showDate && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-surface" />
                            <span className="text-xs text-muted-foreground px-2">{formatDate(msg.created_at)}</span>
                            <div className="flex-1 h-px bg-surface" />
                          </div>
                        )}

                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameAuthorAsPrev ? 'mt-0.5' : 'mt-3'}`}>
                          {!isMine && (
                            <div className="mr-2 flex-shrink-0 self-end">
                              {!sameAuthorAsPrev
                                ? <Avatar user={activeConv.other_user} size={28} />
                                : <div className="w-7" />
                              }
                            </div>
                          )}

                          <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                            {/* Text bubble */}
                            {(msg.text && !(msg.attachment_url && !msg.text.trim())) && (
                              <div className={`
                                px-3.5 py-2 rounded-2xl text-sm leading-relaxed break-words
                                ${isMine
                                  ? 'bg-primary text-white rounded-br-sm'
                                  : 'bg-surface text-foreground rounded-bl-sm'
                                }
                                ${sameAuthorAsPrev && isMine ? 'rounded-tr-2xl' : ''}
                                ${sameAuthorAsPrev && !isMine ? 'rounded-tl-2xl' : ''}
                              `}>
                                {msg.text}
                              </div>
                            )}

                            {/* Attachment */}
                            <AttachmentBubble msg={msg} isMine={isMine} />

                            {/* Time + read receipt */}
                            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                              {isMine && (
                                msg.is_read
                                  ? <CheckCheck className="h-3 w-3 text-primary" />
                                  : <Check className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Attachment preview strip */}
            {attachment && (
              <div
                className="mx-4 mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
              >
                {attachPreview ? (
                  <img src={attachPreview} alt="preview" className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--fh-t1)' }}>{attachment.name}</p>
                  <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>{humanSize(attachment.size)}</p>
                </div>
                {uploadProgress !== null && (
                  <div className="flex-shrink-0 w-16 h-1.5 rounded-full bg-surface overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                )}
                <button
                  onClick={clearAttachment}
                  className="flex-shrink-0 p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Input */}
            <div
              className="px-4 py-3 border-t border-subtle bg-card flex-shrink-0"
              style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
            >
              <div className="flex items-end gap-2">
                {/* Attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-40"
                  style={{
                    background: 'var(--fh-surface-2)',
                    border: '1px solid var(--fh-border-2)',
                    color: 'var(--fh-t4)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t2)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                  onChange={handleFileSelect}
                />

                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={e => {
                      if (e.target.value.length > MAX_MSG_LEN) return
                      setText(e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                    onKeyDown={e => {
                      // On mobile (touch devices), Enter adds a newline — use Send button
                      const isMobile = window.matchMedia('(hover: none)').matches
                      if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Write a message..."
                    rows={1}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none max-h-[120px] leading-relaxed"
                  />
                  {text.length > MAX_MSG_LEN * 0.85 && (
                    <span className={`absolute bottom-1.5 right-2.5 text-[10px] ${text.length >= MAX_MSG_LEN ? 'text-red-400' : 'text-muted-foreground'}`}>
                      {MAX_MSG_LEN - text.length}
                    </span>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  disabled={(!text.trim() && !attachment) || sending}
                  className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending
                    ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                    : <Send className="h-4 w-4 text-white" />
                  }
                </button>
              </div>
              <p className="hidden sm:block text-xs text-muted-foreground mt-1.5 ml-1">Enter — send · Shift+Enter — new line</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Your messages</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Select a conversation on the left or be the first to write
              </p>
            </div>
            <Link
              href="/freelancers"
              className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
            >
              Find freelancers
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
