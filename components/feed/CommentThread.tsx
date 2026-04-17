'use client'
import { useCallback, useEffect, useState } from 'react'
import { Send, X } from 'lucide-react'
import UserAvatar from './UserAvatar'
import { timeAgo } from './utils'
import type { Comment, FeedProfile, FeedUser } from './types'

/**
 * Feed card comment thread. Lazy-loads comments the first time the parent
 * opens it, supports posting + deleting own comments. `open` controls both
 * visibility and the initial fetch trigger.
 */
export default function CommentThread({ itemId, user, profile, open }: {
  itemId: string
  user: FeedUser
  profile: FeedProfile
  open: boolean
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    if (loaded) return
    setLoading(true)
    const res = await fetch(`/api/feed/comments?item_id=${encodeURIComponent(itemId)}`)
    const data = await res.json()
    setComments(data.comments ?? [])
    setLoading(false)
    setLoaded(true)
  }, [itemId, loaded])

  useEffect(() => { if (open) load() }, [open, load])

  async function submit() {
    if (!text.trim() || posting || !user) return
    setPosting(true)
    const res = await fetch('/api/feed/comments', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, content: text.trim() }),
    })
    const data = await res.json()
    if (data.comment) { setComments(p => [...p, data.comment]); setText('') }
    setPosting(false)
  }

  if (!open) return null

  return (
    <div style={{ borderTop: '1px solid var(--fh-sep)', background: 'var(--fh-surface-2)', borderRadius: '0 0 16px 16px' }}>
      {user && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <UserAvatar url={profile?.avatar_url} name={profile?.full_name} size={26} />
          <div className="flex-1 flex gap-2">
            <input
              value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submit() }}
              placeholder="Write a comment…"
              className="flex-1 rounded-full px-3 py-1.5 text-[13px] outline-none"
              style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', color: 'var(--fh-t1)', fontFamily: 'inherit' }}
            />
            <button onClick={submit} disabled={!text.trim() || posting}
              className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: text.trim() ? 'var(--fh-primary)' : 'var(--fh-border)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      <div className="px-4 pb-3 space-y-2">
        {loading ? <p className="text-center text-[11px] py-2" style={{ color: 'var(--fh-t4)' }}>Loading…</p>
          : comments.length === 0 ? <p className="text-center text-[11px] py-2" style={{ color: 'var(--fh-t4)' }}>No comments yet</p>
          : comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <UserAvatar url={c.profiles?.avatar_url} name={c.profiles?.full_name} size={24} />
              <div className="flex-1 rounded-xl px-3 py-1.5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 590, color: 'var(--fh-t1)' }}>{c.profiles?.full_name ?? 'User'}</span>
                <span style={{ fontSize: 11, color: 'var(--fh-t4)', marginLeft: 6 }}>{timeAgo(c.created_at)}</span>
                <p style={{ fontSize: 12, color: 'var(--fh-t2)', lineHeight: 1.4, marginTop: 2 }}>{c.content}</p>
              </div>
              {user?.id === c.user_id && (
                <button onClick={async () => {
                  await fetch(`/api/feed/comments?id=${c.id}`, { method: 'DELETE' })
                  setComments(p => p.filter(x => x.id !== c.id))
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 2, alignSelf: 'start', marginTop: 4 }}>
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}
