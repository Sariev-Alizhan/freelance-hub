'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import data from '@emoji-mart/data'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CornerUpLeft, Send, Copy, Trash2, AlertCircle, MoreHorizontal,
  Languages, Pin, Smile, ChevronRight, ChevronLeft, Plus,
} from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

const EmojiMartPicker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

export const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '😠', '👍']

interface Props {
  open: boolean
  onClose: () => void
  isDark: boolean
  onReact: (emoji: string) => void
  onReply: () => void
  onForward: () => void
  onCopy: () => void
  onDelete: () => void
  onReport: () => void
  onTranslate: () => void
  onPin: () => void
  onAddSticker: () => void
}

export default function MessageActionsSheet({
  open, onClose, isDark,
  onReact, onReply, onForward, onCopy, onDelete, onReport,
  onTranslate, onPin, onAddSticker,
}: Props) {
  const { t } = useLang()
  const tm = t.messagesPage
  const [pickerOpen, setPickerOpen] = useState(false)
  const [moreOpen,   setMoreOpen]   = useState(false)

  useEffect(() => {
    if (!open) { setPickerOpen(false); setMoreOpen(false) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pickerOpen) setPickerOpen(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, pickerOpen])

  function handleReact(emoji: string) {
    onReact(emoji)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => { if (pickerOpen) setPickerOpen(false); else onClose() }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          {pickerOpen ? (
            <FullEmojiSheet
              key="full-picker"
              isDark={isDark}
              onEmoji={handleReact}
              onClose={() => setPickerOpen(false)}
            />
          ) : (
            <motion.div
              key="sheet"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0,  opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              onClick={e => e.stopPropagation()}
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 0,
                padding: '0 12px',
                paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}
            >
              {/* Quick reactions bar */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '8px 10px',
                  borderRadius: 999,
                  background: 'var(--fh-surface)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
                  marginBottom: 10,
                  maxWidth: '100%',
                }}
              >
                {QUICK_REACTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => handleReact(e)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: 26, lineHeight: 1, padding: 4,
                    }}
                  >
                    {e}
                  </button>
                ))}
                <button
                  onClick={() => setPickerOpen(true)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 34, height: 34, borderRadius: 999,
                    background: 'var(--fh-surface-2)',
                    border: 'none', cursor: 'pointer',
                    color: 'var(--fh-t2)',
                    marginLeft: 2,
                  }}
                  aria-label="More reactions"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Action menu */}
              <div
                style={{
                  width: '100%', maxWidth: 360,
                  borderRadius: 16, overflow: 'hidden',
                  background: 'var(--fh-surface)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
                }}
              >
                {!moreOpen ? (
                  <>
                    <Row icon={CornerUpLeft}     label={tm.reply}        onClick={() => { onReply();   onClose() }} />
                    <Row icon={Send}             label={tm.forward}      onClick={() => { onForward(); onClose() }} />
                    <Row icon={Copy}             label={tm.copy}         onClick={() => { onCopy();    onClose() }} />
                    <Row icon={Trash2}           label={tm.deleteForYou} onClick={() => { onDelete();  onClose() }} />
                    <Row icon={AlertCircle}      label={tm.report}       danger onClick={() => { onReport(); onClose() }} />
                    <Row icon={MoreHorizontal}   label={tm.more}         hasArrow onClick={() => setMoreOpen(true)} />
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setMoreOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        width: '100%', padding: '14px 16px',
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        borderBottom: '1px solid var(--fh-sep)',
                        color: 'var(--fh-t2)', fontSize: 14, fontWeight: 600,
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {tm.back}
                    </button>
                    <Row icon={Languages} label={tm.translate}  onClick={() => { onTranslate();  onClose() }} />
                    <Row icon={Pin}       label={tm.pin}        onClick={() => { onPin();        onClose() }} />
                    <Row icon={Smile}     label={tm.addSticker} onClick={() => { onAddSticker(); onClose() }} />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface RowProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  danger?: boolean
  hasArrow?: boolean
}

function Row({ icon: Icon, label, onClick, danger, hasArrow }: RowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '14px 16px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        borderBottom: '1px solid var(--fh-sep)',
        color: danger ? '#e5484d' : 'var(--fh-t1)',
        fontSize: 15, fontWeight: 500,
        textAlign: 'left',
      }}
    >
      <Icon className="h-[18px] w-[18px]" />
      <span style={{ flex: 1 }}>{label}</span>
      {hasArrow && <ChevronRight className="h-4 w-4" style={{ color: 'var(--fh-t4)' }} />}
    </button>
  )
}

// ── Full-screen emoji picker bottom sheet (Instagram-style) ────────────────
interface FullProps {
  isDark: boolean
  onEmoji: (emoji: string) => void
  onClose: () => void
}
function FullEmojiSheet({ isDark, onEmoji, onClose }: FullProps) {
  const { t } = useLang()
  const tm = t.messagesPage
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 360, damping: 38 }}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '78dvh',
        background: 'var(--fh-surface)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        boxShadow: '0 -8px 32px rgba(0,0,0,0.28)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Drag handle */}
      <div
        onClick={onClose}
        style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '10px 0 6px', cursor: 'pointer', flexShrink: 0,
        }}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--fh-t4)', opacity: 0.35 }} />
      </div>

      {/* "Your reactions" label */}
      <div
        style={{
          padding: '0 16px 4px',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          color: 'var(--fh-t4)', textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {tm.yourReactions}
      </div>

      {/* Quick reactions row */}
      <div
        style={{
          padding: '4px 10px 10px',
          display: 'flex', alignItems: 'center',
          gap: 4, flexShrink: 0,
        }}
      >
        {QUICK_REACTIONS.map(e => (
          <button
            key={e}
            onClick={() => onEmoji(e)}
            style={{
              flex: 1, minWidth: 0, height: 44,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 28, lineHeight: 1, padding: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 12,
              transition: 'background 0.12s',
            }}
            onTouchStart={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
            onTouchEnd={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {e}
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--fh-sep)', flexShrink: 0 }} />

      {/* Full emoji-mart picker — must be block with explicit width for dynamicWidth to work */}
      <div style={{ flex: 1, minHeight: 0, width: '100%', position: 'relative' }}>
        <EmojiMartPicker
          data={data}
          onEmojiSelect={(e: { native: string }) => onEmoji(e.native)}
          theme={isDark ? 'dark' : 'light'}
          previewPosition="none"
          skinTonePosition="none"
          navPosition="bottom"
          searchPosition="sticky"
          dynamicWidth={true}
          emojiSize={24}
          emojiButtonSize={40}
          maxFrequentRows={2}
        />
      </div>
    </motion.div>
  )
}
