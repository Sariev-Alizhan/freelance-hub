'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ImagePlus, Loader2, Hash } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'post' | 'story' | 'reel' | 'live'

const TABS: { id: Tab; label: string }[] = [
  { id: 'post',  label: 'POST'  },
  { id: 'story', label: 'STORY' },
  { id: 'reel',  label: 'REEL'  },
  { id: 'live',  label: 'LIVE'  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function CreateSheet({ open, onClose }: Props) {
  const [tab,     setTab]     = useState<Tab>('post')
  const [caption, setCaption] = useState('')
  const [imgUrl,  setImgUrl]  = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const reset = useCallback(() => {
    setCaption(''); setImgUrl(null); setUploading(false); setPublishing(false)
  }, [])

  const close = useCallback(() => { reset(); onClose() }, [reset, onClose])

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${tab === 'story' ? 'stories' : 'posts'}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: false })
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      setImgUrl(data.publicUrl)
    }
    setUploading(false)
  }

  async function publish() {
    if (publishing) return
    setPublishing(true)

    try {
      if (tab === 'post') {
        // Posts: text + optional image (image URL encoded as trailing line; renderer picks it up)
        const body = imgUrl
          ? `${caption.trim()}\n\n${imgUrl}`
          : caption.trim()
        if (!body) return
        const res = await fetch('/api/feed/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: body }),
        })
        if (!res.ok) return
      }

      if (tab === 'story') {
        if (!imgUrl && !caption.trim()) return
        const res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: imgUrl ? 'image' : 'text',
            content: caption.trim() || null,
            bg_color: '#5e6ad2',
            media_url: imgUrl ?? null,
          }),
        })
        if (!res.ok) return
      }

      close()
      router.refresh()
    } finally {
      setPublishing(false)
    }
  }

  const canPublish = tab === 'post'
    ? (!!caption.trim() || !!imgUrl) && !publishing && !uploading
    : tab === 'story'
    ? (!!imgUrl || !!caption.trim()) && !publishing && !uploading
    : false

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            }}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 38 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: '#0a0a0f', color: '#fff',
              display: 'flex', flexDirection: 'column',
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Top bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)',
            }}>
              <button onClick={close} aria-label="Close"
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}>
                <X style={{ width: 24, height: 24 }} />
              </button>
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>
                New {tab}
              </span>
              <button onClick={publish} disabled={!canPublish}
                style={{
                  background: 'none', border: 'none', cursor: canPublish ? 'pointer' : 'default',
                  color: canPublish ? '#60a5fa' : 'rgba(255,255,255,0.3)',
                  fontSize: 16, fontWeight: 600, padding: 4,
                }}>
                {publishing ? <Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> : 'Share'}
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {(tab === 'post' || tab === 'story') && (
                <>
                  {/* Preview / picker */}
                  <div style={{
                    aspectRatio: tab === 'story' ? '9 / 16' : '1 / 1',
                    maxHeight: '60vh',
                    margin: 16, borderRadius: 12, overflow: 'hidden',
                    background: '#151520', border: '1px dashed rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', cursor: 'pointer',
                  }} onClick={() => fileRef.current?.click()}>
                    {uploading ? (
                      <Loader2 style={{ width: 32, height: 32 }} className="animate-spin" />
                    ) : imgUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgUrl} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                        <ImagePlus style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.4)' }} />
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                          Tap to pick a photo
                        </span>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                  </div>

                  {/* Caption */}
                  <div style={{ padding: '0 16px 24px' }}>
                    <textarea
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder={tab === 'story' ? 'Add a line of text (optional)…' : 'Write a caption…'}
                      maxLength={tab === 'post' ? 1900 : 200}
                      rows={3}
                      style={{
                        width: '100%', background: '#151520', border: 'none',
                        color: '#fff', fontSize: 15, lineHeight: 1.5,
                        resize: 'none', outline: 'none', padding: 12,
                        borderRadius: 10,
                      }}
                    />
                    {tab === 'post' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.4)',
                      }}>
                        <Hash style={{ width: 12, height: 12 }} />
                        Use #tags in your caption
                      </div>
                    )}
                  </div>
                </>
              )}

              {(tab === 'reel' || tab === 'live') && (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: 40, gap: 12, minHeight: '50vh',
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
                  }}>
                    {tab === 'reel' ? '🎬' : '📡'}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600 }}>
                    {tab === 'reel' ? 'Reels coming soon' : 'Live coming soon'}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 280 }}>
                    {tab === 'reel'
                      ? 'Short vertical videos with music — on the roadmap.'
                      : 'Live broadcasting from the browser — planned.'}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom tab switcher (pill) */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              padding: '12px 16px 20px',
            }}>
              <div style={{
                display: 'inline-flex', gap: 2,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 999, padding: 4,
                backdropFilter: 'blur(8px)',
              }}>
                {TABS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setImgUrl(null); setCaption('') }}
                    style={{
                      padding: '8px 18px', borderRadius: 999,
                      fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                      border: 'none', cursor: 'pointer',
                      background: tab === t.id ? '#fff' : 'transparent',
                      color: tab === t.id ? '#000' : 'rgba(255,255,255,0.6)',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
