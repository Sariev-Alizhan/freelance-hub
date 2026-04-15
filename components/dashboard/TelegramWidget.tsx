'use client'
import { useState, useEffect } from 'react'
import { Send, Check, Loader2, X, ExternalLink } from 'lucide-react'

export default function TelegramWidget() {
  const [connected, setConnected]   = useState<boolean | null>(null)
  const [loading,   setLoading]     = useState(true)
  const [linking,   setLinking]     = useState(false)
  const [botUrl,    setBotUrl]      = useState<string | null>(null)
  const [waiting,   setWaiting]     = useState(false)

  // Check connection status on mount
  useEffect(() => {
    fetch('/api/telegram/connect')
      .then(r => r.ok ? r.json() : null)
      .then(d => { setConnected(d?.connected ?? false) })
      .catch(() => { setConnected(false) })
      .finally(() => setLoading(false))
  }, [])

  // Poll for connection after user opens bot link
  useEffect(() => {
    if (!waiting) return
    const interval = setInterval(async () => {
      const r = await fetch('/api/telegram/connect').catch(() => null)
      const d = r?.ok ? await r.json() : null
      if (d?.connected) {
        setConnected(true)
        setWaiting(false)
        setBotUrl(null)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [waiting])

  async function connect() {
    setLinking(true)
    try {
      const r = await fetch('/api/telegram/connect', { method: 'POST' })
      const d = await r.json()
      if (d.url) {
        setBotUrl(d.url)
        setWaiting(true)
        window.open(d.url, '_blank')
      }
    } finally {
      setLinking(false)
    }
  }

  async function disconnect() {
    await fetch('/api/telegram/connect', { method: 'DELETE' })
    setConnected(false)
    setBotUrl(null)
    setWaiting(false)
  }

  if (loading) return null

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(38,161,209,0.06) 0%, rgba(38,161,209,0.03) 100%)',
        border: '1px solid rgba(38,161,209,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(38,161,209,0.12)', border: '1px solid rgba(38,161,209,0.2)' }}
        >
          <Send className="h-4 w-4" style={{ color: '#26a1d1', width: '17px', height: '17px' }} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: 'var(--fh-t1)' }}>Telegram notifications</p>
          <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>
            {connected ? 'Connected — you\'ll get new order alerts' : 'Get new order alerts instantly'}
          </p>
        </div>
        {connected && (
          <span
            className="flex items-center gap-1 rounded-full"
            style={{ padding: '2px 8px', background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.25)', fontSize: '10px', fontWeight: 590, color: '#27a644' }}
          >
            <Check className="h-2.5 w-2.5" /> On
          </span>
        )}
      </div>

      {connected ? (
        // Connected state
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--fh-t3)', lineHeight: 1.6 }}>
            When a new order matches your category, you'll receive an instant Telegram message with a direct link.
          </p>
          <button
            onClick={disconnect}
            className="flex items-center gap-1.5 text-xs transition-all"
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              background: 'rgba(229,72,77,0.06)',
              border: '1px solid rgba(229,72,77,0.18)',
              color: '#e5484d',
              fontWeight: 510,
            }}
          >
            <X className="h-3 w-3" /> Disconnect
          </button>
        </div>
      ) : waiting && botUrl ? (
        // Waiting for user to confirm in Telegram
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: '#26a1d1' }} />
            <span className="text-xs" style={{ color: 'var(--fh-t3)' }}>Waiting for you to open the bot…</span>
          </div>
          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-all"
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              background: 'rgba(38,161,209,0.1)',
              border: '1px solid rgba(38,161,209,0.25)',
              color: '#26a1d1',
              fontWeight: 590,
              display: 'inline-flex',
            }}
          >
            <ExternalLink className="h-3 w-3" /> Open Telegram bot
          </a>
        </div>
      ) : (
        // Disconnected state
        <div>
          <p className="text-xs mb-3" style={{ color: 'var(--fh-t3)', lineHeight: 1.6 }}>
            Connect Telegram to get instant notifications when new orders match your skills.
          </p>
          <button
            onClick={connect}
            disabled={linking}
            className="flex items-center gap-1.5 text-xs transition-all disabled:opacity-60"
            style={{
              padding: '7px 16px',
              borderRadius: '6px',
              background: '#26a1d1',
              color: '#fff',
              fontWeight: 590,
            }}
          >
            {linking
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Send className="h-3.5 w-3.5" />
            }
            Connect Telegram
          </button>
        </div>
      )}
    </div>
  )
}
