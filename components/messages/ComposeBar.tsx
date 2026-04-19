'use client'
import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from 'react'
import { CornerUpLeft, FileText, Loader2, Paperclip, Send, X } from 'lucide-react'
import EmojiPickerPopover from './EmojiPickerPopover'
import { useLang } from '@/lib/context/LanguageContext'
import { humanSize } from './utils'

const MAX_MSG_LEN = 4000

/**
 * Bottom of the chat pane: reply preview, attachment preview, and the
 * input row (attach, emoji/sticker picker, textarea, send). Keyboard
 * handling is iOS-aware — the wrapper `paddingBottom` uses
 * `env(safe-area-inset-bottom)` which collapses to 0 while the keyboard
 * is up, letting the compose hug the keyboard top.
 *
 * `inputRef` is owned by the parent because it's also focused from the
 * message-list reply action and the long-press action sheet.
 */
export default function ComposeBar(props: {
  text: string
  setText: Dispatch<SetStateAction<string>>
  sending: boolean
  replyTo: { id: string; text: string; name: string } | null
  onClearReply: () => void
  attachment: File | null
  attachPreview: string | null
  uploadProgress: number | null
  clearAttachment: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileSelect: (e: ChangeEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLTextAreaElement | null>
  broadcastTyping: () => void
  insertEmoji: (emoji: string) => void
  sendSticker: (sticker: string) => void
  sendMessage: () => void
  isDark: boolean
}) {
  const {
    text, setText, sending,
    replyTo, onClearReply,
    attachment, attachPreview, uploadProgress, clearAttachment,
    fileInputRef, handleFileSelect,
    inputRef, broadcastTyping, insertEmoji, sendSticker, sendMessage,
    isDark,
  } = props
  const { t } = useLang()
  const tm = t.messagesPage

  return (
    <>
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
          <button onClick={onClearReply}
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
            // eslint-disable-next-line @next/next/no-img-element
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
            placeholder={tm.messageInput}
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
  )
}
