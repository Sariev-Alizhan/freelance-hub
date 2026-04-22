'use client'
import { useRef, useState } from 'react'
import { X, Type, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const BG_COLORS = [
  '#27a644', '#27a644', '#e5484d', '#f97316',
  '#f59e0b', '#27a644', '#06b6d4', '#a855f7',
  '#ec4899', '#0ea5e9', '#1a1a2e', '#374151',
]

type Tab = 'text' | 'image'

interface Props {
  onClose: () => void
  onCreate: () => void
}

export default function CreateStoryModal({ onClose, onCreate }: Props) {
  const [tab,    setTab]    = useState<Tab>('text')
  const [text,   setText]   = useState('')
  const [color,  setColor]  = useState(BG_COLORS[0])
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [busy,   setBusy]   = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function uploadImage(file: File) {
    setBusy(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `stories/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false })
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      setImgUrl(data.publicUrl)
    }
    setBusy(false)
  }

  async function publish() {
    if (tab === 'text' && !text.trim()) return
    if (tab === 'image' && !imgUrl)     return
    setBusy(true)
    await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:      tab,
        content:   tab === 'text' ? text.trim() : null,
        bg_color:  color,
        media_url: imgUrl ?? null,
      }),
    })
    setBusy(false)
    onCreate()
  }

  // ── live preview bg ────────────────────────────────────────────────────────
  const previewBg: React.CSSProperties = tab === 'image' && imgUrl
    ? { backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: color }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--fh-surface)',
          borderRadius: 20,
          width: 'min(520px, 96vw)',
          maxHeight: '92vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--fh-border)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--fh-sep)' }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--fh-t1)' }}>Создать историю</span>
          <button
            type="button" onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 0, flex: 1, overflow: 'hidden' }}>
          {/* Left: preview */}
          <div style={{ width: 200, flexShrink: 0, padding: 16 }}>
            <div style={{
              width: '100%', aspectRatio: '9/16', borderRadius: 16,
              ...previewBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {tab === 'text' && text ? (
                <p style={{
                  fontSize: text.length > 80 ? 13 : text.length > 40 ? 15 : 18,
                  fontWeight: 700, color: '#fff', textAlign: 'center',
                  padding: 12, lineHeight: 1.4, wordBreak: 'break-word',
                  textShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}>
                  {text}
                </p>
              ) : tab === 'image' && !imgUrl ? (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center' }}>
                  <ImageIcon size={28} style={{ marginBottom: 6, opacity: 0.6 }} />
                  <div>Выберите фото</div>
                </div>
              ) : tab === 'text' && !text ? (
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Предпросмотр</div>
              ) : null}
            </div>
          </div>

          {/* Right: controls */}
          <div style={{ flex: 1, padding: '12px 20px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Tab */}
            <div style={{ display: 'flex', gap: 8 }}>
              {(['text', 'image'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10, fontWeight: 600, fontSize: 13,
                    border: `1.5px solid ${tab === t ? '#27a644' : 'var(--fh-border)'}`,
                    background: tab === t ? 'rgba(39,166,68,0.1)' : 'var(--fh-surface-2)',
                    color: tab === t ? '#27a644' : 'var(--fh-t3)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {t === 'text' ? <><Type size={13} /> Текст</> : <><ImageIcon size={13} /> Фото</>}
                </button>
              ))}
            </div>

            {/* Text input */}
            {tab === 'text' && (
              <textarea
                placeholder="Что у вас нового?..."
                value={text}
                onChange={e => setText(e.target.value)}
                maxLength={300}
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid var(--fh-border)',
                  background: 'var(--fh-surface-2)',
                  color: 'var(--fh-t1)', fontSize: 14, resize: 'none',
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />
            )}

            {/* Image upload */}
            {tab === 'image' && (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]) }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12,
                    border: '1.5px dashed var(--fh-border)',
                    background: 'var(--fh-surface-2)',
                    color: 'var(--fh-t3)', fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  <ImageIcon size={16} />
                  {imgUrl ? 'Заменить фото' : 'Выбрать фото'}
                </button>
              </div>
            )}

            {/* Background palette (text stories) */}
            {tab === 'text' && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fh-t4)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Фон
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {BG_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: c, border: 'none', cursor: 'pointer',
                        outline: color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: 2,
                        transform: color === c ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Publish */}
            <button
              type="button"
              onClick={publish}
              disabled={busy || (tab === 'text' ? !text.trim() : !imgUrl)}
              style={{
                marginTop: 'auto',
                padding: '12px', borderRadius: 12,
                background: 'linear-gradient(135deg, #27a644, #27a644)',
                border: 'none', cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (busy || (tab === 'text' ? !text.trim() : !imgUrl)) ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Опубликовать историю'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
