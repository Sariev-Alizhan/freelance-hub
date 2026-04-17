'use client'
import CardShell from './CardShell'
import type { FeedRelease } from '@/lib/feed-content'
import type { FeedProfile, FeedUser, Reactions } from './types'

export default function ReleaseCard({ release, reactions, onReact, user, profile }: {
  release: FeedRelease
  reactions: Reactions
  onReact: (id: string, action: string) => void
  user: FeedUser
  profile: FeedProfile
}) {
  const itemId = `rel-${release.version}`
  return (
    <CardShell itemId={itemId} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--fh-primary-muted)', border: '1px solid rgba(113,112,255,0.2)' }}>
          {release.emoji}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)' }}>
              v{release.version}
            </span>
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
              {new Date(release.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em', marginTop: 2 }} className="truncate">
            {release.title}
          </p>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--fh-t2)', lineHeight: 1.55, marginBottom: 8 }}>
        {release.summary}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 2 }}>
        {release.highlights.map((h, i) => (
          <div key={i} style={{ fontSize: 12, color: 'var(--fh-t3)', lineHeight: 1.5 }}>{h}</div>
        ))}
      </div>
    </CardShell>
  )
}
