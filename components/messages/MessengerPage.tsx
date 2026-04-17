'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Send, ArrowLeft, MessageSquare, LogIn,
  Loader2, Paperclip, X, FileText, BadgeCheck, CornerUpLeft,
} from 'lucide-react'
import EmojiPickerPopover from './EmojiPickerPopover'
import MessageActionsSheet from './MessageActionsSheet'
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
import { humanSize } from './utils'
import Avatar from './Avatar'
import ConversationList from './ConversationList'
import MessagesList from './MessagesList'

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

  const [actionSheetMsgId, setActionSheetMsgId] = useState<string | null>(null)
  const [hiddenMsgIds,     setHiddenMsgIds]     = useState<Set<string>>(new Set())

  const {
    attachment,
    attachPreview,
    uploadProgress,
    fileInputRef,
    handleFileSelect,
    clearAttachment,
    uploadAttachment,
  } = useAttachment()

  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const MAX_MSG_LEN = 4000

  const activeConv = conversations.find(c => c.id === activeId) ?? null

  useVisualViewport()

  // When a chat is open on mobile, flag html so BottomNav hides
  useEffect(() => {
    const el = document.documentElement
    if (!showList) el.setAttribute('data-chat-open', 'true')
    else el.removeAttribute('data-chat-open')
    return () => el.removeAttribute('data-chat-open')
  }, [showList])

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
      <ConversationList
        showList={showList}
        search={search}
        setSearch={setSearch}
        convsLoading={convsLoading}
        conversations={conversations}
        activeId={activeId}
        onlineUserIds={onlineUserIds}
        onSelectConversation={selectConv}
      />

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
            <MessagesList
              messages={messages}
              activeConv={activeConv}
              currentUserId={user.id}
              msgsLoading={msgsLoading}
              reactions={reactions}
              toggleReaction={toggleReaction}
              hiddenMsgIds={hiddenMsgIds}
              setActionSheetMsgId={setActionSheetMsgId}
              isDark={isDark}
              onReply={(msg, senderName) => {
                setReplyTo({ id: msg.id, text: msg.text || '📎 Attachment', name: senderName })
                inputRef.current?.focus()
              }}
            />

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
