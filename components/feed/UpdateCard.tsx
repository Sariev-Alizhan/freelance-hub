'use client'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import CardShell from './CardShell'
import { CURRENT_RELEASE } from '@/lib/company-report'
import { useLang } from '@/lib/context/LanguageContext'
import type { FeedProfile, FeedUser, Reactions } from './types'

export default function UpdateCard({ reactions, onReact, user, profile }: {
  reactions: Reactions
  onReact: (id: string, action: string) => void
  user: FeedUser
  profile: FeedProfile
}) {
  const { t, lang } = useLang()
  const fc = t.feedCard
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'kz' ? 'kk-KZ' : 'en-US'
  const rel = CURRENT_RELEASE
  const itemId = `update-v${rel.version}`
  const allShipped = rel.reports.flatMap(d => d.done.map(item => ({ emoji: d.emoji, item }))).slice(0, 8)

  return (
    <CardShell itemId={itemId} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--fh-primary-muted)', border: '1px solid rgba(113,112,255,0.2)' }}>
          🚀
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)' }}>
              v{rel.version}
            </span>
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
              {new Date(rel.date).toLocaleDateString(locale, { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em', marginTop: 2 }}>{rel.title}</p>
        </div>
        <Link href="/updates" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--fh-primary)', textDecoration: 'none', flexShrink: 0 }}>
          {fc.allUpdates}
        </Link>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <CheckCircle2 className="h-3 w-3 text-green-400" />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#27a644', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {fc.justShipped} · {allShipped.length} {fc.featuresLabel}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        {allShipped.map((s, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <span className="text-sm flex-shrink-0">{s.emoji}</span>
            <span className="line-clamp-1" style={{ fontSize: 11, color: 'var(--fh-t3)', lineHeight: 1.4 }}>{s.item}</span>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
