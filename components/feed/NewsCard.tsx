'use client'
import { ArrowUp, ExternalLink } from 'lucide-react'
import CardShell from './CardShell'
import { timeAgo, SRC_COLOR, SRC_BG } from './utils'
import type { FeedProfile, FeedUser, NewsItem, Reactions } from './types'

export default function NewsCard({ item, reactions, onReact, user, profile }: {
  item: NewsItem
  reactions: Reactions
  onReact: (id: string, action: string) => void
  user: FeedUser
  profile: FeedProfile
}) {
  const color = SRC_COLOR[item.source] ?? '#888'
  const bg    = SRC_BG[item.source] ?? 'var(--fh-surface-2)'
  const href  = item.url ?? item.hn_url

  return (
    <CardShell itemId={item.id} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: bg, color }}>{item.source_label}</span>
        <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{item.author}</span>
        <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>·</span>
        <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{timeAgo(item.created_at)}</span>
        <div className="ml-auto flex items-center gap-0.5">
          <ArrowUp className="h-3 w-3" style={{ color }} />
          <span style={{ fontSize: 11, color, fontWeight: 700 }}>{item.points}</span>
        </div>
      </div>

      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 10 }}>
        <p className="line-clamp-3" style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
          {item.title}
        </p>
        <span className="inline-flex items-center gap-1 mt-1" style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
          <ExternalLink className="h-2.5 w-2.5" />
          {item.source_label}
        </span>
      </a>
    </CardShell>
  )
}
