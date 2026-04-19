import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCheck, Check, Loader2, Plus, CornerUpLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import emojiData from '@emoji-mart/data'
import { FH_STICKER_SET } from './EmojiPickerPopover'
import { QUICK_REACTIONS } from './MessageActionsSheet'
import Avatar from './Avatar'
import AttachmentBubble from './AttachmentBubble'
import OrderPreviewCard, { extractOrderId } from './OrderPreviewCard'
import { formatDate, formatTime, isSameDay } from './utils'
import type { Conversation, Message, ReactionMap } from './types'

const InlineEmojiPicker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

/**
 * Scrollable chat body. Handles per-message grouping (Instagram-style
 * corner rounding + time stamp only on last of group), date dividers,
 * hover reaction bar (desktop), long-press to open the action sheet
 * (mobile), and reaction pills under the bubble.
 *
 * Owns three pieces of ephemeral UI state internally: hovered message,
 * desktop reaction-picker target, and the long-press timer. Auto-scrolls
 * to the bottom when `messages` changes and the user is near the bottom.
 */
export default function MessagesList(props: {
  messages: Message[]
  activeConv: Conversation
  currentUserId: string
  msgsLoading: boolean
  reactions: ReactionMap
  toggleReaction: (messageId: string, emoji: string) => void
  hiddenMsgIds: Set<string>
  setActionSheetMsgId: (id: string) => void
  isDark: boolean
  onReply: (msg: Message, senderName: string) => void
}) {
  const {
    messages, activeConv, currentUserId, msgsLoading,
    reactions, toggleReaction, hiddenMsgIds, setActionSheetMsgId, isDark, onReply,
  } = props

  const msgsContainerRef = useRef<HTMLDivElement>(null)
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null)
  const [reactionPickerMsgId, setReactionPickerMsgId] = useState<string | null>(null)

  // Auto-scroll to bottom on new message when user is near bottom
  useEffect(() => {
    const el = msgsContainerRef.current
    if (!el) return
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    if (dist < 200 || messages.length <= 20) el.scrollTop = el.scrollHeight
  }, [messages])

  // When the visible viewport resizes (soft keyboard opens/closes), keep the
  // latest message in view by re-pinning to the bottom if the user was near it.
  useEffect(() => {
    const el = msgsContainerRef.current
    if (!el) return
    const obs = new ResizeObserver(() => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight
      if (dist < 400) el.scrollTop = el.scrollHeight
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Click-outside closes the inline "+" reaction picker (desktop)
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

  return (
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
            const isMine = msg.sender_id === currentUserId
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
                          onReply(msg, senderName)
                          setHoveredMsgId(null)
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

                    {/* Inline order preview if the message links to an order */}
                    {(() => {
                      const oid = extractOrderId(msg.text)
                      return oid ? <OrderPreviewCard orderId={oid} isMine={isMine} /> : null
                    })()}

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
  )
}
