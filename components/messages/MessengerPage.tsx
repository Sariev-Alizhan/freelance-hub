'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Send, Search, ArrowLeft, MessageSquare, LogIn,
  CheckCheck, Check, Loader2, Paperclip, X, FileText, BadgeCheck, CornerUpLeft, Plus,
} from 'lucide-react'
import EmojiPickerPopover, { FH_STICKER_SET } from './EmojiPickerPopover'
import MessageActionsSheet, { QUICK_REACTIONS as QUICK_REACTIONS_6 } from './MessageActionsSheet'
import dynamic from 'next/dynamic'
import emojiData from '@emoji-mart/data'

const InlineEmojiPicker = dynamic(() => import('@emoji-mart/react'), { ssr: false })
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'
import { useVisualViewport } from '@/lib/hooks/useVisualViewport'
import {
  useActiveConversationChannel,
  useOnlinePresence,
  useInboxNotifications,
} from '@/lib/hooks/useMessengerRealtime'
import { useReactions } from '@/lib/hooks/useReactions'
import { useAttachment } from '@/lib/hooks/useAttachment'
import { useConversationsData } from '@/lib/hooks/useConversationsData'
import type { Message } from './types'
import { formatTime, formatDate, isSameDay, humanSize } from './utils'
import Avatar from './Avatar'
import AttachmentBubble from './AttachmentBubble'

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MessengerPage() {
  const { user, loading } = useUser()
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const searchParams = useSearchParams()
  const openUserId = searchParams.get('open')

  const [text,     setText]    = useState('')
  const [search,   setSearch]  = useState('')
  const [sending,  setSending] = useState(false)
  const [showList, setShowList] = useState(true)

  // Reply-to
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; name: string } | null>(null)

  // ── Message reactions ─────────────────────────────────────────────────────
  const { reactions, loadReactions, toggleReaction } = useReactions(user?.id)

  // ── Conversations + messages data layer ───────────────────────────────────
  const {
    conversations, setConversations,
    activeId, setActiveId,
    activeIdRef,
    messages, setMessages,
    convsLoading, msgsLoading,
    loadConversations,
  } = useConversationsData({
    userId: user?.id,
    openUserId,
    onAutoOpenedConversation: () => setShowList(false),
    onMessagesLoaded: loadReactions,
  })

  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null)
  const [actionSheetMsgId,    setActionSheetMsgId]    = useState<string | null>(null)
  const [hiddenMsgIds,        setHiddenMsgIds]        = useState<Set<string>>(new Set())
  const QUICK_REACTIONS = useMemo(() => QUICK_REACTIONS_6, [])
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    attachment,
    attachPreview,
    uploadProgress,
    fileInputRef,
    handleFileSelect,
    clearAttachment,
    uploadAttachment,
  } = useAttachment()

  const msgsContainerRef = useRef<HTMLDivElement>(null)
  const inputRef         = useRef<HTMLTextAreaElement>(null)
  const MAX_MSG_LEN      = 4000

  const activeConv = conversations.find(c => c.id === activeId) ?? null

  useVisualViewport()

  // When a chat is open on mobile, flag html so BottomNav hides
  useEffect(() => {
    const el = document.documentElement
    if (!showList) el.setAttribute('data-chat-open', 'true')
    else el.removeAttribute('data-chat-open')
    return () => el.removeAttribute('data-chat-open')
  }, [showList])

  // Click-outside to close the inline "+" reaction picker (desktop)
  useEffect(() => {
    if (!reactionPickerMsgId) return
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (t && t.closest('[data-reaction-picker], em-emoji-picker')) return
      setReactionPickerMsgId(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [reactionPickerMsgId])

  // ── Realtime (per-conversation channel, inbox, global presence) ─────────

  const { isOtherTyping, isOtherOnline, broadcastTyping } = useActiveConversationChannel({
    userId: user?.id,
    activeId,
    setMessages,
    setConversations,
  })
  const onlineUserIds = useOnlinePresence(user?.id)
  useInboxNotifications({
    userId: user?.id,
    activeIdRef,
    setConversations,
    refetchConversations: loadConversations,
  })

  // ── Auto-scroll ───────────────────────────────────────────────────────────

  useEffect(() => {
    const el = msgsContainerRef.current
    if (!el) return
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    if (dist < 200 || messages.length <= 20) el.scrollTop = el.scrollHeight
  }, [messages])

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

    const uploaded = attachment ? await uploadAttachment(user.id) : null
    const attachmentUrl  = uploaded?.url  ?? null
    const attachmentType = uploaded?.type ?? null
    const attachmentName = uploaded?.name ?? null

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
      <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--fh-primary-muted)' }}>
        <LogIn className="h-8 w-8" style={{ color: 'var(--fh-primary)' }} />
      </div>
      <div className="text-center">
        <h2 style={{ fontSize: 18, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 6 }}>Sign in to view messages</h2>
        <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>You need an account to use messaging</p>
      </div>
      <Link href="/auth/login" className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'var(--fh-primary)' }}>
        Sign in
      </Link>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex overflow-hidden messenger-height">

      {/* ── Sidebar: Conversation List ────────────────────────────────────── */}
      <div
        className={`messenger-sidebar flex flex-col flex-shrink-0 ${showList ? 'flex' : 'hidden md:flex'}`}
        style={{
          borderRight: '1px solid var(--fh-sep)',
          background: 'var(--fh-surface)',
        }}
      >
        {/* Header — Instagram DM style */}
        <div className="flex-shrink-0" style={{ borderBottom: '0.5px solid var(--fh-sep)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 16px 10px', position: 'relative' }}>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em', margin: 0 }}>
              Messages
            </h1>
          </div>
          {/* Search pill */}
          <div
            className="flex items-center gap-2 mx-4 mb-3"
            style={{
              height: 36, borderRadius: 10,
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)',
              padding: '0 12px',
            }}
          >
            <Search className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 14, color: 'var(--fh-t1)', fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto messenger-convs-scroll">
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
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', textAlign: 'left',
                    background: isActive ? 'var(--fh-surface-2)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  {/* Avatar with online/unread indicator */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar user={conv.other_user} size={48} />
                    {onlineUserIds.has(conv.other_user.id) && (
                      <span style={{
                        position: 'absolute', bottom: 2, right: 2,
                        width: 11, height: 11, borderRadius: '50%',
                        background: '#27a644',
                        border: '2px solid var(--fh-surface)',
                      }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 15,
                        fontWeight: conv.unread > 0 ? 700 : 600,
                        color: 'var(--fh-t1)',
                        letterSpacing: '-0.01em',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {conv.other_user.full_name || 'User'}
                      </span>
                      {conv.last_message_at && (
                        <span style={{
                          fontSize: 12,
                          color: conv.unread > 0 ? 'var(--fh-primary)' : 'var(--fh-t4)',
                          fontWeight: conv.unread > 0 ? 600 : 400,
                          flexShrink: 0,
                        }}>
                          {formatTime(conv.last_message_at)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                      <p style={{
                        fontSize: 13,
                        color: conv.unread > 0 ? 'var(--fh-t2)' : 'var(--fh-t4)',
                        fontWeight: conv.unread > 0 ? 500 : 400,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1,
                      }}>
                        {conv.last_message || 'No messages'}
                      </p>
                      {conv.unread > 0 && (
                        <span style={{
                          minWidth: 18, height: 18, borderRadius: 9,
                          background: 'var(--fh-primary)', color: '#fff',
                          fontSize: 10, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          padding: '0 4px', flexShrink: 0,
                        }}>
                          {conv.unread > 9 ? '9+' : conv.unread}
                        </span>
                      )}
                    </div>
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
                    <BadgeCheck className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--fh-primary)' }} />
                  )}
                </div>
                {/* Online / Typing status line */}
                <div style={{ height: 16, display: 'flex', alignItems: 'center' }}>
                  {isOtherTyping ? (
                    <span style={{ fontSize: 11, color: 'var(--fh-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
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
                  {messages.filter(m => !hiddenMsgIds.has(m.id)).map((msg, idx, arr) => {
                    const isMine = msg.sender_id === user.id
                    const prevMsg = arr[idx - 1]
                    const nextMsg = arr[idx + 1]
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
                        onTouchStart={() => {
                          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)
                          longPressTimerRef.current = setTimeout(() => {
                            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                              try { navigator.vibrate?.(8) } catch {}
                            }
                            setActionSheetMsgId(msg.id)
                          }, 450)
                        }}
                        onTouchEnd={() => {
                          if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null }
                        }}
                        onTouchMove={() => {
                          if (longPressTimerRef.current) { clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null }
                        }}
                        onContextMenu={e => { e.preventDefault() }}
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

                        {/* ── Hover reaction bar (desktop) ────────────────── */}
                        {(hoveredMsgId === msg.id || reactionPickerMsgId === msg.id) && (
                          <div
                            data-reaction-picker="true"
                            className={`hidden md:flex items-center gap-1 mb-1 ${isMine ? 'justify-end pr-10' : 'justify-start pl-10'}`}
                            style={{ position: 'relative' }}
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
                                    background: msgReactions[emoji]?.mine ? 'var(--fh-primary-muted)' : 'transparent',
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
                              <button
                                onClick={() => setReactionPickerMsgId(prev => prev === msg.id ? null : msg.id)}
                                title="More reactions"
                                style={{
                                  background: reactionPickerMsgId === msg.id ? 'var(--fh-primary-muted)' : 'transparent',
                                  border: 'none', cursor: 'pointer', borderRadius: 6,
                                  padding: '3px 4px', color: reactionPickerMsgId === msg.id ? 'var(--fh-primary)' : 'var(--fh-t3)',
                                  display: 'flex', alignItems: 'center',
                                  transition: 'color 0.15s, background 0.15s',
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
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
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-primary)' }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t3)' }}
                              >
                                <CornerUpLeft className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Inline emoji-mart picker for desktop "+" */}
                            {reactionPickerMsgId === msg.id && (
                              <div
                                onClick={e => e.stopPropagation()}
                                style={{
                                  position: 'absolute', top: 'calc(100% + 4px)',
                                  [isMine ? 'right' : 'left']: '10%',
                                  zIndex: 50,
                                  borderRadius: 14, overflow: 'hidden',
                                  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                                  border: '1px solid var(--fh-border-2)',
                                  background: 'var(--fh-surface)',
                                }}
                              >
                                <InlineEmojiPicker
                                  data={emojiData}
                                  onEmojiSelect={(e: { native: string }) => {
                                    toggleReaction(msg.id, e.native)
                                    setReactionPickerMsgId(null)
                                    setHoveredMsgId(null)
                                  }}
                                  theme={isDark ? 'dark' : 'light'}
                                  previewPosition="none"
                                  skinTonePosition="none"
                                  navPosition="bottom"
                                  perLine={8}
                                  emojiSize={20}
                                  emojiButtonSize={32}
                                  maxFrequentRows={2}
                                />
                              </div>
                            )}
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
                                    color: isMine ? 'var(--fh-primary)' : 'var(--fh-t2)',
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
                                  background: isMine ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
                                  color: isMine ? '#ffffff' : 'var(--fh-t1)',
                                }}>
                                  {/* Quoted reply */}
                                  {msg.reply_to_text && (
                                    <div style={{
                                      marginBottom: 7,
                                      padding: '5px 10px',
                                      borderRadius: 8,
                                      borderLeft: `3px solid ${isMine ? 'rgba(255,255,255,0.5)' : 'var(--fh-primary)'}`,
                                      background: isMine ? 'rgba(255,255,255,0.12)' : 'var(--fh-primary-muted)',
                                    }}>
                                      <p style={{ fontSize: 11, fontWeight: 700, marginBottom: 2, color: isMine ? 'rgba(255,255,255,0.8)' : 'var(--fh-primary)' }}>
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
                                    ? <CheckCheck className="h-3 w-3" style={{ color: 'var(--fh-primary)' }} />
                                    : <Check className="h-3 w-3" style={{ color: 'var(--fh-t4)' }} />
                                )}
                              </div>
                            )}

                            {/* Reaction pills — circular bubble under the message */}
                            {hasReactions && (
                              <div
                                className={`flex flex-wrap gap-1 ${isMine ? 'justify-end' : 'justify-start'}`}
                                style={{ marginTop: -6, marginLeft: isMine ? 0 : 10, marginRight: isMine ? 10 : 0 }}
                              >
                                {Object.entries(msgReactions).map(([emoji, { count, mine }]) => (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleReaction(msg.id, emoji)}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center',
                                      gap: count > 1 ? 3 : 0,
                                      padding: count > 1 ? '0 7px 0 5px' : 0,
                                      height: 24,
                                      minWidth: 24,
                                      justifyContent: 'center',
                                      borderRadius: 999,
                                      border: `1px solid ${mine ? 'var(--fh-primary)' : 'var(--fh-border)'}`,
                                      background: mine ? 'var(--fh-primary-muted)' : 'var(--fh-surface-2)',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      color: mine ? 'var(--fh-primary)' : 'var(--fh-t2)',
                                      lineHeight: 1,
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                                    }}
                                  >
                                    <span style={{ fontSize: 13, lineHeight: 1 }}>{emoji}</span>
                                    {count > 1 && <span style={{ fontSize: 11 }}>{count}</span>}
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
                style={{ background: 'var(--fh-primary-muted)', border: '1px solid color-mix(in srgb, var(--fh-primary) 25%, transparent)', borderLeft: '3px solid var(--fh-primary)' }}
              >
                <CornerUpLeft className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-primary)' }} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-primary)', marginBottom: 1 }}>{replyTo.name}</p>
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
                  <div className="rounded-lg flex items-center justify-center flex-shrink-0" style={{ height: 36, width: 36, background: 'var(--fh-primary-muted)' }}>
                    <FileText className="h-4 w-4" style={{ color: 'var(--fh-primary)' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: 12, fontWeight: 510, color: 'var(--fh-t1)' }}>{attachment.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{humanSize(attachment.size)}</p>
                </div>
                {uploadProgress !== null && (
                  <div className="flex-shrink-0 overflow-hidden" style={{ width: 60, height: 3, borderRadius: 2, background: 'var(--fh-surface-2)' }}>
                    <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--fh-primary)', transition: 'width 0.2s' }} />
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
                // safe-area-inset-bottom collapses to 0 when the keyboard is up,
                // so the compose hugs the keyboard top without wasted space, and
                // sits above the home-indicator bar when the keyboard is down.
                paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
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
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--fh-primary)' }}
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
                  background: (text.trim() || attachment) ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
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
              style={{ width: 72, height: 72, borderRadius: 24, background: 'var(--fh-primary-muted)' }}
            >
              <MessageSquare className="h-9 w-9" style={{ color: 'var(--fh-primary)' }} />
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
              style={{ background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)', border: '1px solid color-mix(in srgb, var(--fh-primary) 25%, transparent)', textDecoration: 'none' }}
            >
              Find freelancers
            </Link>
          </div>
        )}
      </div>

      {/* Mobile long-press action sheet */}
      {(() => {
        const sheetMsg = actionSheetMsgId ? messages.find(m => m.id === actionSheetMsgId) : null
        const sheetIsMine = sheetMsg?.sender_id === user?.id
        const sheetSenderName = sheetIsMine ? 'You' : (activeConv?.other_user.full_name ?? 'User')
        return (
          <MessageActionsSheet
            open={!!sheetMsg}
            onClose={() => setActionSheetMsgId(null)}
            isDark={isDark}
            onReact={emoji => sheetMsg && toggleReaction(sheetMsg.id, emoji)}
            onReply={() => {
              if (!sheetMsg) return
              setReplyTo({ id: sheetMsg.id, text: sheetMsg.text || '📎 Attachment', name: sheetSenderName })
              inputRef.current?.focus()
            }}
            onForward={() => alert('Forward — coming soon')}
            onCopy={() => {
              if (sheetMsg?.text && typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(sheetMsg.text).catch(() => {})
              }
            }}
            onDelete={() => {
              if (sheetMsg) setHiddenMsgIds(prev => new Set(prev).add(sheetMsg.id))
            }}
            onReport={() => alert('Report — coming soon')}
            onTranslate={() => alert('Translate — coming soon')}
            onPin={() => alert('Pin — coming soon')}
            onAddSticker={() => { inputRef.current?.blur(); alert('Tap the 😊 button in the composer to add a sticker') }}
          />
        )
      })()}
    </div>
  )
}
