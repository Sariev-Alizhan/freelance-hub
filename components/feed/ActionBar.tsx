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
      <style>{`
        .fh-action-bar { display: flex; align-items: center; border-top: 0.5px solid var(--fh-sep); padding: 2px 4px; }
        .fh-action-btn {
          flex: 1; display: flex; align-items: center; justify-content: center;
          gap: 5px; padding: 8px 4px; background: none; border: none; border-radius: 8px;
          font-weight: 500; font-size: 13px; color: var(--fh-t4);
          white-space: nowrap; min-width: 0; overflow: hidden;
          transition: background 0.12s;
        }
        .fh-action-btn .fh-action-label {
          overflow: hidden; text-overflow: ellipsis; min-width: 0;
        }
        .fh-action-btn:hover { background: var(--fh-surface-2); }
        @media (max-width: 420px) {
          .fh-action-btn { font-size: 12px; gap: 4px; padding: 8px 2px; }
        }
        @media (max-width: 360px) {
          .fh-action-btn .fh-action-label { display: none; }
        }
      `}</style>
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
      <div className="fh-action-bar">
        <button onClick={() => onReact('like')}
          className="fh-action-btn"
          style={{ cursor: user ? 'pointer' : 'default', color: liked ? '#27a644' : undefined, fontWeight: liked ? 700 : undefined }}>
          <ThumbsUp style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span className="fh-action-label">{fc.like}</span>
        </button>
        <button onClick={onToggleComments}
          className="fh-action-btn"
          style={{ cursor: 'pointer', color: commentsOpen ? 'var(--fh-primary)' : undefined, fontWeight: commentsOpen ? 700 : undefined }}>
          <MessageCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span className="fh-action-label">{fc.comment}</span>
        </button>
        <button onClick={() => onReact('repost')}
          className="fh-action-btn"
          style={{ cursor: 'pointer' }}>
          <Share2 style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span className="fh-action-label">{fc.share}</span>
        </button>
        <button onClick={() => onReact('save')}
          className="fh-action-btn"
          style={{ cursor: 'pointer', color: saved ? '#f59e0b' : undefined, fontWeight: saved ? 700 : undefined }}>
          <Bookmark style={{ width: 16, height: 16, flexShrink: 0 }} />
          <span className="fh-action-label">{fc.save}</span>
        </button>
      </div>
    </div>
  )
}
