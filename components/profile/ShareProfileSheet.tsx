'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { Share2, Copy, Check, X, QrCode as QrIcon } from 'lucide-react'

interface Props {
  url: string
  username: string
}

/** Share profile — QR + copy + native share, bottom sheet. */
export default function ShareProfileSheet({ url, username }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || qrDataUrl) return
    QRCode.toDataURL(url, {
      width: 480,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrDataUrl).catch(() => {})
  }, [open, url, qrDataUrl])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function nativeShare() {
    if (!navigator.share) return copy()
    try {
      await navigator.share({ title: `@${username} on FreelanceHub`, url })
    } catch {
      // user cancelled
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--fh-border)',
          color: 'var(--fh-t4)',
          fontSize: 12, fontWeight: 510, cursor: 'pointer',
        }}
      >
        <Share2 style={{ width: 14, height: 14 }} />
        Share profile
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
              }}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
                background: 'var(--card)',
                borderRadius: '20px 20px 0 0',
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
                maxHeight: '90dvh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
                <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--fh-border-2)' }} />
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 16px 14px',
              }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                    Share profile
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fh-t4)', marginTop: 2 }}>@{username}</div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close" style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--fh-surface-2)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--fh-t3)',
                }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {/* QR */}
              <div style={{
                margin: '0 16px', padding: 20, borderRadius: 20,
                background: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: 240,
              }}>
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrDataUrl} alt={`QR for @${username}`} width={240} height={240} style={{ display: 'block' }} />
                ) : (
                  <QrIcon style={{ width: 40, height: 40, color: '#ddd' }} />
                )}
              </div>

              {/* URL row */}
              <div style={{
                margin: '14px 16px 0', padding: '12px 14px', borderRadius: 12,
                background: 'var(--fh-surface-2)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{
                  flex: 1, minWidth: 0, fontSize: 13, color: 'var(--fh-t2)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {url.replace(/^https?:\/\//, '')}
                </span>
                <button onClick={copy} style={{
                  padding: '6px 10px', borderRadius: 8,
                  background: copied ? 'rgba(39,166,68,0.12)' : 'var(--fh-surface)',
                  border: `1px solid ${copied ? 'rgba(39,166,68,0.3)' : 'var(--fh-border)'}`,
                  color: copied ? '#27a644' : 'var(--fh-t3)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {copied ? <><Check style={{ width: 13, height: 13 }} /> Copied</> : <><Copy style={{ width: 13, height: 13 }} /> Copy</>}
                </button>
              </div>

              {/* Share button */}
              <div style={{ padding: '14px 16px 0' }}>
                <button onClick={nativeShare} style={{
                  width: '100%', padding: '13px 16px', borderRadius: 12,
                  background: 'var(--fh-primary)', color: '#fff',
                  border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <Share2 style={{ width: 15, height: 15 }} />
                  Share via apps
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
