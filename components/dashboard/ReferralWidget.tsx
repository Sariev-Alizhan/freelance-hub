'use client'
import { useState, useEffect } from 'react'
import { Gift, Copy, Check, Users, Crown, ChevronRight, Share2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  username: string | null
}

interface Stats {
  total: number
  rewarded: number
  pending: number
}

export default function ReferralWidget({ username }: Props) {
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'
  const referralLink = username ? `${siteUrl}/r/${username}` : null

  useEffect(() => {
    fetch('/api/referrals/claim')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
  }, [])

  function copyLink() {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  function shareVia(channel: 'telegram' | 'twitter' | 'whatsapp') {
    if (!referralLink) return
    const text = encodeURIComponent(`Join me on FreelanceHub — work directly, 0% commission, pay any way you want. ${referralLink}`)
    const urls: Record<string, string> = {
      telegram:  `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`,
      twitter:   `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp:  `https://wa.me/?text=${text}`,
    }
    window.open(urls[channel], '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  // Progress toward next reward: every 1 referral = 1 month Premium
  const progress = stats ? Math.min((stats.total % 1 === 0 ? 0 : stats.total % 1) * 100, 100) : 0
  const nextRewardAt = stats ? stats.total + 1 : 1

  if (!username) return null

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(39,166,68,0.06) 0%, rgba(39,166,68,0.04) 100%)',
        border: '1px solid rgba(39,166,68,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(39,166,68,0.12)', border: '1px solid rgba(39,166,68,0.2)' }}
        >
          <Gift className="h-4.5 w-4.5" style={{ color: '#27a644', width: '18px', height: '18px' }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--fh-t1)' }}>Invite friends</p>
          <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>Get 1 month Premium for each referral</p>
        </div>
      </div>

      {/* Stats row */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="h-3.5 w-3.5" style={{ color: '#27a644' }} />
              <span className="text-lg font-bold" style={{ color: 'var(--fh-t1)' }}>{stats.total}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>referred</p>
          </div>
          <div
            className="rounded-xl p-3 text-center"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
          >
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Crown className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
              <span className="text-lg font-bold" style={{ color: 'var(--fh-t1)' }}>{stats.rewarded}</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--fh-t4)' }}>rewarded</p>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="mb-4 space-y-2">
        {[
          { n: '1', text: 'Share your link with a friend' },
          { n: '2', text: 'They register and post/complete an order' },
          { n: '3', text: 'You both get 1 month Premium free' },
        ].map(step => (
          <div key={step.n} className="flex items-center gap-2.5">
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(39,166,68,0.15)', color: '#27a644' }}
            >
              {step.n}
            </div>
            <span className="text-xs" style={{ color: 'var(--fh-t3)' }}>{step.text}</span>
          </div>
        ))}
      </div>

      {/* Link box */}
      <div
        className="flex items-center gap-2 rounded-xl p-2 pl-3 mb-3"
        style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
      >
        <span
          className="flex-1 text-xs font-mono truncate"
          style={{ color: 'var(--fh-t3)' }}
        >
          {referralLink}
        </span>
        <button
          onClick={copyLink}
          aria-label="Copy referral link"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
          style={{
            background: copied ? 'rgba(39,166,68,0.1)' : 'rgba(39,166,68,0.1)',
            border: copied ? '1px solid rgba(39,166,68,0.25)' : '1px solid rgba(39,166,68,0.25)',
            color: copied ? '#27a644' : '#27a644',
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Social share buttons */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs" style={{ color: 'var(--fh-t4)' }}>Share via:</span>
        {([
          { id: 'telegram',  label: 'Telegram', bg: 'rgba(0,136,204,0.1)',   border: 'rgba(0,136,204,0.25)',   color: '#0088cc' },
          { id: 'twitter',   label: 'X',        bg: 'rgba(0,0,0,0.08)',      border: 'rgba(0,0,0,0.15)',       color: 'var(--fh-t2)' },
          { id: 'whatsapp',  label: 'WhatsApp', bg: 'rgba(37,211,102,0.1)',  border: 'rgba(37,211,102,0.25)',  color: '#25d366' },
        ] as const).map(s => (
          <button
            key={s.id}
            onClick={() => shareVia(s.id)}
            aria-label={`Share on ${s.label}`}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
          >
            <Share2 className="h-3 w-3" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Progress bar toward next reward */}
      {stats && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ color: 'var(--fh-t4)' }}>
              {stats.rewarded} month{stats.rewarded !== 1 ? 's' : ''} Premium earned
            </span>
            <span className="text-xs" style={{ color: 'var(--fh-t4)' }}>
              Next reward at {nextRewardAt} referral{nextRewardAt !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fh-border-2)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((stats.total / nextRewardAt) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #27a644, #27a644)',
              }}
            />
          </div>
        </div>
      )}

      {/* CTA */}
      <Link
        href="/premium"
        className="flex items-center justify-between text-xs transition-colors group"
        style={{ color: 'var(--fh-t4)' }}
      >
        <span>Learn more about Premium</span>
        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  )
}
