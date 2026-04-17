'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import data from '@emoji-mart/data'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CornerUpLeft, Send, Copy, Trash2, AlertCircle, MoreHorizontal,
  Languages, Pin, Smile, ChevronRight, ChevronLeft, Plus,
} from 'lucide-react'

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
  const [pickerOpen, setPickerOpen] = useState(false)
  const [moreOpen,   setMoreOpen]   = useState(false)

  useEffect(() => {
    if (!open) { setPickerOpen(false); setMoreOpen(false) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
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
                onClick={() => setPickerOpen(p => !p)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34, height: 34, borderRadius: 999,
                  background: pickerOpen ? 'var(--fh-primary-muted)' : 'var(--fh-surface-2)',
                  border: 'none', cursor: 'pointer',
                  color: pickerOpen ? 'var(--fh-primary)' : 'var(--fh-t2)',
                  marginLeft: 2,
                }}
                aria-label="More reactions"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Inline emoji-mart picker */}
            {pickerOpen && (
              <div
                style={{
                  marginBottom: 10, borderRadius: 18, overflow: 'hidden',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
                  border: '1px solid var(--fh-border-2)',
                }}
              >
                <EmojiMartPicker
                  data={data}
                  onEmojiSelect={(e: { native: string }) => handleReact(e.native)}
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
                  <Row icon={CornerUpLeft}     label="Reply"          onClick={() => { onReply();   onClose() }} />
                  <Row icon={Send}             label="Forward"        onClick={() => { onForward(); onClose() }} />
                  <Row icon={Copy}             label="Copy"           onClick={() => { onCopy();    onClose() }} />
                  <Row icon={Trash2}           label="Delete for you" onClick={() => { onDelete();  onClose() }} />
                  <Row icon={AlertCircle}      label="Report"         danger onClick={() => { onReport(); onClose() }} />
                  <Row icon={MoreHorizontal}   label="More"           hasArrow onClick={() => setMoreOpen(true)} />
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
                    Back
                  </button>
                  <Row icon={Languages} label="Translate"   onClick={() => { onTranslate();  onClose() }} />
                  <Row icon={Pin}       label="Pin"         onClick={() => { onPin();        onClose() }} />
                  <Row icon={Smile}     label="Add sticker" onClick={() => { onAddSticker(); onClose() }} />
                </>
              )}
            </div>
          </motion.div>
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
