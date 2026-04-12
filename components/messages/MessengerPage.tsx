'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Send, Search, ArrowLeft, User, MessageSquare,
  LogIn, CheckCheck, Check, MoreVertical, Loader2
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
}

// ── Helpers ────────────────────────────────────────────────
function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Сегодня'
  if (d.toDateString() === yesterday.toDateString()) return 'Вчера'
  return d.toLocaleDateString('ru', { day: 'numeric', month: 'long' })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
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
  const initials = (user.full_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────
export default function MessengerPage() {
  const { user, loading } = useUser()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [convsLoading, setConvsLoading] = useState(true)
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showList, setShowList] = useState(true) // mobile: toggle list/chat

  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeConv = conversations.find(c => c.id === activeId) ?? null

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
            other_user: other ?? { id: '', full_name: 'Пользователь', avatar_url: null },
            unread: 0,
          }
        })
        setConversations(convs)
      }
    } finally {
      setConvsLoading(false)
    }
  }, [user])

  useEffect(() => { loadConversations() }, [loadConversations])

  // ── Load messages for active conversation ───────────────
  useEffect(() => {
    if (!activeId) return
    setMsgsLoading(true)
    setMessages([])

    db.from('messages')
      .select('*')
      .eq('conversation_id', activeId)
      .order('created_at', { ascending: true })
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
    }
  }, [activeId])

  // ── Realtime subscription ───────────────────────────────
  useEffect(() => {
    if (!activeId) return

    // Unsubscribe from previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    const channel = supabase
      .channel(`msgs:${activeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload: any) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          // Update last_message in conversations list
          setConversations(prev =>
            prev.map(c =>
              c.id === activeId
                ? { ...c, last_message: newMsg.text, last_message_at: newMsg.created_at }
                : c
            )
          )
        }
      )
      .subscribe()

    channelRef.current = channel
    return () => { supabase.removeChannel(channel) }
  }, [activeId])

  // ── Auto-scroll to bottom ───────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Send message ────────────────────────────────────────
  async function sendMessage() {
    if (!text.trim() || !activeId || !user || sending) return
    const msgText = text.trim()
    setText('')
    setSending(true)

    // Optimistic update
    const optimistic: Message = {
      id: crypto.randomUUID(),
      conversation_id: activeId,
      sender_id: user.id,
      text: msgText,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const { data, error } = await db.from('messages').insert({
        conversation_id: activeId,
        sender_id: user.id,
        text: msgText,
      }).select('*').single()

      if (error) throw error
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data : m))
    } catch {
      // Rollback optimistic on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setText(msgText)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  // ── Select conversation ─────────────────────────────────
  function selectConv(id: string) {
    setActiveId(id)
    setShowList(false) // mobile: switch to chat view
  }

  // ── Filter conversations by search ─────────────────────
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
          <h1 className="text-2xl font-bold mb-2">Войдите в аккаунт</h1>
          <p className="text-muted-foreground">Чтобы открыть сообщения, нужна авторизация</p>
        </div>
        <Link href="/auth/login" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
          Войти
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
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-subtle">
          <h1 className="text-lg font-bold mb-3">Сообщения</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? 'Ничего не найдено' : 'Диалогов пока нет'}
              </p>
              {!search && (
                <p className="text-xs text-muted-foreground/60">
                  Откликнитесь на заказ или напишите фрилансеру
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
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate">
                      {conv.other_user.full_name || 'Пользователь'}
                    </span>
                    {conv.last_message_at && (
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(conv.last_message_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {conv.last_message || 'Нет сообщений'}
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
                  {activeConv.other_user.full_name || 'Пользователь'}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="text-xs text-muted-foreground">в сети</span>
                </div>
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
                  <p className="text-sm font-medium">Начните диалог</p>
                  <p className="text-xs text-muted-foreground">Напишите первое сообщение</p>
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
                        {/* Date separator */}
                        {showDate && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-surface" />
                            <span className="text-xs text-muted-foreground px-2">{formatDate(msg.created_at)}</span>
                            <div className="flex-1 h-px bg-surface" />
                          </div>
                        )}

                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameAuthorAsPrev ? 'mt-0.5' : 'mt-3'}`}>
                          {/* Other user avatar */}
                          {!isMine && (
                            <div className="mr-2 flex-shrink-0 self-end">
                              {!sameAuthorAsPrev
                                ? <Avatar user={activeConv.other_user} size={28} />
                                : <div className="w-7" />
                              }
                            </div>
                          )}

                          <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
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

            {/* Input */}
            <div className="px-4 py-3 border-t border-subtle bg-card flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={text}
                  onChange={e => {
                    setText(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder="Написать сообщение..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none max-h-[120px] leading-relaxed"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sending
                    ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                    : <Send className="h-4 w-4 text-white" />
                  }
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">Enter — отправить · Shift+Enter — новая строка</p>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Ваши сообщения</h2>
              <p className="text-muted-foreground text-sm max-w-xs">
                Выберите диалог слева или напишите кому-нибудь первым
              </p>
            </div>
            <Link
              href="/freelancers"
              className="px-5 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20"
            >
              Найти фрилансеров
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
