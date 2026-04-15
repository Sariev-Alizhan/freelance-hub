'use client'
import { useState } from 'react'
import { Share2, Check, Link as LinkIcon } from 'lucide-react'

interface Props {
  url: string
  username: string
}

export default function ShareProfileButton({ url, username }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Native share (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ title: `@${username} on FreelanceHub`, url })
        return
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // last resort
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
        padding: '9px 16px', borderRadius: '8px',
        background: copied ? 'rgba(39,166,68,0.08)' : 'transparent',
        border: copied ? '1px solid rgba(39,166,68,0.25)' : '1px solid var(--fh-border)',
        color: copied ? '#27a644' : 'var(--fh-t4)',
        fontSize: '12px', fontWeight: 510, cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {copied
        ? <><Check className="h-3.5 w-3.5" /> Link copied!</>
        : <><Share2 className="h-3.5 w-3.5" /> Share profile</>
      }
    </button>
  )
}
