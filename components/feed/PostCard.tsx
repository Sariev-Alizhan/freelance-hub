'use client'
import { useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, X } from 'lucide-react'
import CardShell from './CardShell'
import UserAvatar from './UserAvatar'
import { timeAgo } from './utils'
import { useLang } from '@/lib/context/LanguageContext'
import type { FeedProfile, FeedUser, Reactions, UserPost } from './types'

export default function PostCard({ post, reactions, onReact, user, profile, onDelete }: {
  post: UserPost
  reactions: Reactions
  onReact: (id: string, action: string) => void
  user: FeedUser
  profile: FeedProfile
  onDelete: (id: string) => void
}) {
  const { t } = useLang()
  const fc = t.feedCard
  const [expanded, setExpanded] = useState(false)
  const isLong = post.content.length > 220
  const displayContent = expanded || !isLong ? post.content : post.content.slice(0, 220) + '…'

  return (
    <CardShell itemId={post.id} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <Link href={post.profiles?.username ? `/u/${post.profiles.username}` : '#'} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <UserAvatar url={post.profiles?.avatar_url} name={post.profiles?.full_name} size={40} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Link href={post.profiles?.username ? `/u/${post.profiles.username}` : '#'}
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              {post.profiles?.full_name ?? post.profiles?.username ?? fc.userFallback}
            </Link>
            {post.profiles?.is_verified && (
              <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-primary)' }} />
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--fh-t4)' }}>{timeAgo(post.created_at)}</span>
        </div>
        {user?.id === post.user_id ? (
          <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 4, flexShrink: 0 }}>
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <p style={{ fontSize: 14, color: 'var(--fh-t1)', lineHeight: 1.65, marginBottom: 8, letterSpacing: '-0.005em' }}>
        {displayContent}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(o => !o)} style={{ fontSize: 13, color: 'var(--fh-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8, fontWeight: 500 }}>
          {expanded ? fc.showLess : fc.showMore}
        </button>
      )}

      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
          {post.tags.map(t => (
            <span key={t} style={{ borderRadius: 99, padding: '2px 10px', fontSize: 12, background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)' }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </CardShell>
  )
}
