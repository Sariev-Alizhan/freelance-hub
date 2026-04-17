'use client'
import { useState, type ReactNode } from 'react'
import ActionBar from './ActionBar'
import CommentThread from './CommentThread'
import type { FeedProfile, FeedUser, Reactions } from './types'

/**
 * The rounded "Instagram-style" container shared by every feed card.
 * Wraps the caller's markup, then the action bar + lazy comment thread.
 * Owns only the "comments open" toggle — reactions come in as props so
 * the parent can do one batch-load + optimistic update across all cards.
 */
export default function CardShell({ children, itemId, reactions, onReact, user, profile }: {
  children: ReactNode
  itemId: string
  reactions: Reactions
  onReact: (id: string, action: string) => void
  user: FeedUser
  profile: FeedProfile
}) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  return (
    <div
      className="sm:rounded-2xl sm:border overflow-hidden"
      style={{
        background: 'var(--fh-surface)',
        borderBottom: '0.5px solid var(--fh-sep)',
      }}
    >
      <div style={{ padding: '14px 16px 0' }}>{children}</div>
      <ActionBar
        reactions={reactions}
        onReact={a => onReact(itemId, a)}
        commentsOpen={commentsOpen}
        onToggleComments={() => setCommentsOpen(o => !o)}
        user={user}
      />
      <CommentThread itemId={itemId} user={user} profile={profile} open={commentsOpen} />
    </div>
  )
}
