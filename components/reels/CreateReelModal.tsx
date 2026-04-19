'use client'
import { useRef, useState } from 'react'
import { X, Film, Loader2, Upload } from 'lucide-react'
import { uploadMedia } from '@/lib/storage'

interface Props {
  onClose:  () => void
  onCreate: () => void
}

const MAX_SIZE_MB = 80
const MAX_SECONDS = 300

export default function CreateReelModal({ onClose, onCreate }: Props) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [caption,  setCaption]  = useState('')
  const [duration, setDuration] = useState<number | null>(null)
  const [aspect,   setAspect]   = useState<number | null>(null)
  const [err,      setErr]      = useState<string | null>(null)
  const [busy,     setBusy]     = useState(false)
  const fileRef   = useRef<HTMLInputElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)

  async function pick(file: File) {
    setErr(null)
    if (!file.type.startsWith('video/')) { setErr('Выберите видеофайл'); return }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErr(`Файл больше ${MAX_SIZE_MB} MB`); return
    }

    setBusy(true)
    const res = await uploadMedia(file, 'reels')
    setBusy(false)
    if (!res) { setErr('Не удалось загрузить видео'); return }
    setVideoUrl(res.url)
  }

  function onMeta() {
    const v = videoRef.current
    if (!v) return
    if (v.duration && Number.isFinite(v.duration)) {
      if (v.duration > MAX_SECONDS) {
        setErr(`Видео должно быть короче ${MAX_SECONDS} секунд`)
        setVideoUrl(null)
        return
      }
      setDuration(Math.round(v.duration))
    }
    if (v.videoWidth && v.videoHeight) {
      setAspect(+(v.videoWidth / v.videoHeight).toFixed(3))
    }
  }

  async function publish() {
    if (!videoUrl) return
    setBusy(true)
    const r = await fetch('/api/reels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_url:        videoUrl,
        caption:          caption.trim() || undefined,
        duration_seconds: duration ?? undefined,
        aspect_ratio:     aspect ?? undefined,
      }),
    }).catch(() => null)
    setBusy(false)
    if (!r || !r.ok) { setErr('Не удалось опубликовать'); return }
    onCreate()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--fh-surface)',
          borderRadius: 20,
          width: 'min(560px, 96vw)',
          maxHeight: '94vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: '1px solid var(--fh-border)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--fh-sep)',
        }}>
          <Film size={18} style={{ color: '#7170ff', marginRight: 8 }} />
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--fh-t1)' }}>
            Создать Reel
          </span>
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
              background: '#000', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}>
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls playsInline
                  onLoadedMetadata={onMeta}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textAlign: 'center' }}>
                  <Film size={28} style={{ marginBottom: 6, opacity: 0.6 }} />
                  <div>Предпросмотр</div>
                </div>
              )}
            </div>
            {duration !== null && (
              <div style={{
                marginTop: 8, fontSize: 11, color: 'var(--fh-t4)',
                textAlign: 'center',
              }}>
                {duration}s{aspect ? ` · ${aspect.toFixed(2)}` : ''}
              </div>
            )}
          </div>

          {/* Right: controls */}
          <div style={{
            flex: 1, padding: '12px 20px 20px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {/* Upload */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) pick(e.target.files[0]) }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  border: '1.5px dashed var(--fh-border)',
                  background: 'var(--fh-surface-2)',
                  color: 'var(--fh-t3)', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {videoUrl ? 'Заменить видео' : 'Выбрать видео'}
              </button>
              <div style={{
                fontSize: 11, color: 'var(--fh-t4)', marginTop: 6, textAlign: 'center',
              }}>
                Вертикальное, до {MAX_SECONDS}s, &lt; {MAX_SIZE_MB} MB
              </div>
            </div>

            {/* Caption */}
            <div>
              <div style={{
                fontSize: 11, fontWeight: 600, color: 'var(--fh-t4)',
                marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                Описание <span style={{ textTransform: 'none', letterSpacing: 0, opacity: 0.7 }}>({caption.length}/500)</span>
              </div>
              <textarea
                placeholder="Расскажите о своём видео..."
                value={caption}
                onChange={e => setCaption(e.target.value.slice(0, 500))}
                rows={3}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 12,
                  border: '1.5px solid var(--fh-border)',
                  background: 'var(--fh-surface-2)',
                  color: 'var(--fh-t1)', fontSize: 14, resize: 'none',
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                }}
              />
            </div>

            {err && (
              <div style={{
                padding: '8px 12px', borderRadius: 8,
                background: 'rgba(244,63,94,0.1)', color: '#f43f5e',
                fontSize: 12,
              }}>
                {err}
              </div>
            )}

            {/* Publish */}
            <button
              type="button"
              onClick={publish}
              disabled={busy || !videoUrl}
              style={{
                marginTop: 'auto',
                padding: '12px', borderRadius: 12,
                background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
                border: 'none', cursor: busy || !videoUrl ? 'default' : 'pointer',
                color: '#fff', fontWeight: 700, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (busy || !videoUrl) ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : 'Опубликовать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
