'use client'
import { BadgeCheck } from 'lucide-react'
import CardShell from './CardShell'
import type { EditorPost } from '@/lib/feed-content'
import type { FeedProfile, FeedUser, Reactions } from './types'

export default function EditorCard({ post, reactions, onReact, user, profile }: {
  post: EditorPost
  reactions: Reactions
  onReact: (id: string, action: string) => void
  user: FeedUser
  profile: FeedProfile
}) {
  const itemId = `ed-${post.id}`
  return (
    <CardShell itemId={itemId} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}>
          {post.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }} className="truncate">
              {post.author}
            </span>
            <BadgeCheck style={{ width: 13, height: 13, color: 'var(--fh-primary)', flexShrink: 0 }} />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{
              background: `${post.tagColor}22`, color: post.tagColor,
            }}>
              {post.tag}
            </span>
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>·</span>
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
              {new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 15, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1.3 }}>
        {post.title}
      </p>
      <p style={{ fontSize: 13, color: 'var(--fh-t2)', lineHeight: 1.6, marginBottom: 8 }}>
        {post.body}
      </p>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {post.tags.map(t => (
            <span key={t} style={{
              fontSize: 11, color: 'var(--fh-primary)', fontWeight: 510,
            }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </CardShell>
  )
}
