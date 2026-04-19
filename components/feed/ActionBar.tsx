'use client'
import { Bookmark, MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import type { FeedUser, Reactions } from './types'

/**
 * LinkedIn-style footer for a feed card: the reactions summary row
 * ("👍 N", "M reposts") on top, then Like / Comment / Share / Save
 * buttons. The parent owns reaction state and the comment toggle.
 */
export default function ActionBar({ reactions, onReact, commentsOpen, onToggleComments, user }: {
  reactions: Reactions
  onReact: (action: string) => void
  commentsOpen: boolean
  onToggleComments: () => void
  user: FeedUser
}) {
  const { t } = useLang()
  const fc = t.feedCard
  const liked = reactions.mine.includes('like')
  const saved = reactions.mine.includes('save')
  const totalLikes = reactions.likes

  return (
    <div>
      {(totalLikes > 0 || reactions.reposts > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', borderTop: '0.5px solid var(--fh-sep)' }}>
          {totalLikes > 0 && (
            <span style={{ fontSize: 12, color: 'var(--fh-t4)' }}>
              👍 {totalLikes}
            </span>
          )}
          {reactions.reposts > 0 && (
            <span style={{ fontSize: 12, color: 'var(--fh-t4)', marginLeft: 'auto' }}>
              {reactions.reposts} {fc.reposts}
            </span>
          )}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', borderTop: '0.5px solid var(--fh-sep)', padding: '2px 4px' }}>
        <button onClick={() => onReact('like')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 4px', background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', borderRadius: 8, color: liked ? '#27a644' : 'var(--fh-t4)', fontWeight: liked ? 700 : 500, fontSize: 13, transition: 'background 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
          <ThumbsUp style={{ width: 16, height: 16 }} />
          <span>{fc.like}</span>
        </button>
        <button onClick={onToggleComments}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, color: commentsOpen ? 'var(--fh-primary)' : 'var(--fh-t4)', fontWeight: commentsOpen ? 700 : 500, fontSize: 13, transition: 'background 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
          <MessageCircle style={{ width: 16, height: 16 }} />
          <span>{fc.comment}</span>
        </button>
        <button onClick={() => onReact('repost')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, color: 'var(--fh-t4)', fontWeight: 500, fontSize: 13, transition: 'background 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
          <Share2 style={{ width: 16, height: 16 }} />
          <span>{fc.share}</span>
        </button>
        <button onClick={() => onReact('save')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px 4px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 8, color: saved ? '#f59e0b' : 'var(--fh-t4)', fontWeight: saved ? 700 : 500, fontSize: 13, transition: 'background 0.12s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}>
          <Bookmark style={{ width: 16, height: 16 }} />
          <span>{fc.save}</span>
        </button>
      </div>
    </div>
  )
}
