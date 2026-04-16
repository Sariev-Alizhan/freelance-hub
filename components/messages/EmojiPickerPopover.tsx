'use client'
import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import data from '@emoji-mart/data'
import { Smile } from 'lucide-react'

// Loaded client-side only — emoji-mart doesn't support SSR
const EmojiMartPicker = dynamic(() => import('@emoji-mart/react'), { ssr: false })

// ── FreelanceHub exclusive sticker pack ──────────────────────────────────────
export const FH_STICKERS = [
  { id: 'deal',     emoji: '🤝', label: 'Deal!',       color: '#5e6ad2' },
  { id: 'launch',   emoji: '🚀', label: "Let's go!",   color: '#7170ff' },
  { id: 'done',     emoji: '✅', label: 'Done!',        color: '#27a644' },
  { id: 'fire',     emoji: '🔥', label: 'Urgent!',      color: '#f97316' },
  { id: 'idea',     emoji: '💡', label: 'Great idea!',  color: '#f59e0b' },
  { id: 'deadline', emoji: '⏰', label: 'Deadline!',    color: '#e5484d' },
  { id: 'thanks',   emoji: '💜', label: 'Thanks!',      color: '#a855f7' },
  { id: 'paid',     emoji: '💰', label: 'Paid!',        color: '#27a644' },
  { id: 'approve',  emoji: '💎', label: 'Quality!',     color: '#06b6d4' },
  { id: 'busy',     emoji: '😅', label: 'Busy rn',      color: '#8a8f98' },
  { id: 'think',    emoji: '🤔', label: 'Let me think', color: '#f59e0b' },
  { id: 'hi',       emoji: '👋', label: 'Hello!',       color: '#5e6ad2' },
]

// Set of exact sticker texts so the bubble renderer can detect them
export const FH_STICKER_SET = new Set(FH_STICKERS.map(s => `${s.emoji} ${s.label}`))

type Tab = 'emoji' | 'stickers'

interface Props {
  onEmoji:   (emoji: string) => void
  onSticker: (text: string)  => void
  isDark:    boolean
}

export default function EmojiPickerPopover({ onEmoji, onSticker, isDark }: Props) {
  const [open, setOpen] = useState(false)
  const [tab,  setTab]  = useState<Tab>('emoji')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex-shrink-0 flex items-center justify-center transition-colors"
        style={{
          width: 36, height: 36, borderRadius: 18, cursor: 'pointer',
          background: open ? 'rgba(113,112,255,0.12)' : 'var(--fh-surface-2)',
          border: `1px solid ${open ? 'rgba(113,112,255,0.3)' : 'var(--fh-border)'}`,
          color: open ? '#7170ff' : 'var(--fh-t4)',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.color = 'var(--fh-t2)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.color = 'var(--fh-t4)' }}
      >
        <Smile className="h-4 w-4" />
      </button>

      {/* Popover */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 10px)',
          left: 0,
          zIndex: 200,
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
          border: '1px solid var(--fh-border-2)',
          background: 'var(--fh-surface)',
          width: tab === 'emoji' ? 352 : 316,
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--fh-sep)',
            background: 'var(--fh-surface)',
            flexShrink: 0,
          }}>
            {(['emoji', 'stickers'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: '11px 0', fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', background: 'none',
                  color: tab === t ? '#7170ff' : 'var(--fh-t4)',
                  borderBottom: tab === t ? '2px solid #7170ff' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'color 0.15s',
                }}
              >
                {t === 'emoji' ? '😊  Emoji' : '🎨  Stickers'}
              </button>
            ))}
          </div>

          {/* Emoji tab */}
          {tab === 'emoji' && (
            <EmojiMartPicker
              data={data}
              onEmojiSelect={(e: { native: string }) => {
                onEmoji(e.native)
                setOpen(false)
              }}
              theme={isDark ? 'dark' : 'light'}
              previewPosition="none"
              skinTonePosition="none"
              navPosition="bottom"
              perLine={9}
              emojiSize={20}
              emojiButtonSize={32}
              maxFrequentRows={2}
            />
          )}

          {/* Stickers tab */}
          {tab === 'stickers' && (
            <div style={{ padding: 14, overflowY: 'auto' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, color: '#fff', fontWeight: 800,
                }}>
                  FH
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
                  FreelanceHub Pack
                </span>
                <span style={{ fontSize: 10, color: 'var(--fh-t4)', marginLeft: 'auto' }}>
                  Exclusive
                </span>
              </div>

              {/* Sticker grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {FH_STICKERS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { onSticker(`${s.emoji} ${s.label}`); setOpen(false) }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '10px 4px', borderRadius: 14,
                      border: '1px solid transparent',
                      cursor: 'pointer', background: `${s.color}10`,
                      transition: 'transform 0.1s, background 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1.06)'
                      el.style.background = `${s.color}20`
                      el.style.borderColor = `${s.color}40`
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLElement
                      el.style.transform = 'scale(1)'
                      el.style.background = `${s.color}10`
                      el.style.borderColor = 'transparent'
                    }}
                  >
                    <span style={{ fontSize: 30, lineHeight: 1 }}>{s.emoji}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: s.color,
                      textAlign: 'center', lineHeight: 1.2, letterSpacing: '-0.01em',
                    }}>
                      {s.label}
                    </span>
                    <span style={{
                      fontSize: 8, color: 'var(--fh-t4)',
                      fontWeight: 600, letterSpacing: '0.04em',
                    }}>
                      FH
                    </span>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--fh-sep)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 4,
                  background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, color: '#fff', fontWeight: 800,
                }}>FH</div>
                <span style={{ fontSize: 10, color: 'var(--fh-t4)' }}>
                  FreelanceHub · Official Sticker Pack v1
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
