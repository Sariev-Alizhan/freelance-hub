'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft, MessageSquare, LogIn,
  Loader2, BadgeCheck,
} from 'lucide-react'
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
import Avatar from './Avatar'
import ConversationList from './ConversationList'
import MessagesList from './MessagesList'
import ComposeBar from './ComposeBar'

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

            <ComposeBar
              text={text}
              setText={setText}
              sending={sending}
              replyTo={replyTo}
              onClearReply={() => setReplyTo(null)}
              attachment={attachment}
              attachPreview={attachPreview}
              uploadProgress={uploadProgress}
              clearAttachment={clearAttachment}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              inputRef={inputRef}
              broadcastTyping={broadcastTyping}
              insertEmoji={insertEmoji}
              sendSticker={sendSticker}
              sendMessage={sendMessage}
              isDark={isDark}
            />
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
