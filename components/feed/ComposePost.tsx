'use client'
import { useRef, useState } from 'react'
import { Hash, Plus, X } from 'lucide-react'
import UserAvatar from './UserAvatar'
import { useToastHelpers } from '@/lib/context/ToastContext'
import type { FeedProfile, FeedUser, UserPost } from './types'

export default function ComposePost({ user, profile, onPost, mobile }: {
  user: FeedUser
  profile: FeedProfile
  onPost: (post: UserPost) => void
  mobile?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [posting, setPosting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { success: ok, error: err } = useToastHelpers()

  function addTag(raw: string) {
    const t = raw.replace(/[^a-zA-ZА-Яа-я0-9_]/g, '').slice(0, 30)
    if (t && !tags.includes(t) && tags.length < 5) setTags(p => [...p, t])
    setTagInput('')
  }

  async function submit() {
    if (!text.trim() || posting || !user) return
    setPosting(true)
    const res = await fetch('/api/feed/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text.trim(), tags }),
    })
    const data = await res.json()
    if (data.post) { onPost(data.post); setText(''); setTags([]); setOpen(false); ok('Post published!') }
    else err('Failed to post')
    setPosting(false)
  }

  if (!user) return null

  // Mobile: slim Instagram-style row, tapping opens full compose
  if (mobile && !open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 50) }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 16px',
          background: 'none', border: 'none', borderBottom: '0.5px solid var(--fh-sep)',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <UserAvatar url={profile?.avatar_url} name={profile?.full_name} size={36} />
        <span style={{
          flex: 1, fontSize: 15, color: 'var(--fh-t4)',
          letterSpacing: '-0.01em',
        }}>
          Что у вас нового?
        </span>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--fh-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Plus style={{ width: 16, height: 16, color: 'var(--fh-primary)' }} />
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-2" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
      {!open ? (
        <button
          onClick={() => { setOpen(true); setTimeout(() => textareaRef.current?.focus(), 50) }}
          className="w-full flex items-center gap-3 px-4 py-3"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <UserAvatar url={profile?.avatar_url} name={profile?.full_name} size={34} />
          <span className="flex-1 rounded-full px-4 py-2 text-[13px]"
            style={{ background: 'var(--fh-surface-2)', color: 'var(--fh-t4)', border: '1px solid var(--fh-border)' }}>
            Share what&apos;s on your mind about your work…
          </span>
          <Plus className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--fh-primary)' }} />
        </button>
      ) : (
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <UserAvatar url={profile?.avatar_url} name={profile?.full_name} size={34} />
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={e => { setText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px' }}
                placeholder="Share something about your work, a tip, question, or achievement…"
                rows={3}
                maxLength={2000}
                style={{
                  width: '100%', background: 'none', border: 'none', outline: 'none',
                  fontSize: 14, color: 'var(--fh-t1)', lineHeight: 1.6, resize: 'none',
                  fontFamily: 'inherit', minHeight: 80,
                }}
              />

              <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                    style={{ background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)' }}>
                    #{t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-primary)', padding: 0 }}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {tags.length < 5 && (
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" style={{ color: 'var(--fh-t4)' }} />
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                      onBlur={() => { if (tagInput) addTag(tagInput) }}
                      placeholder="Add tag"
                      style={{ background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--fh-t4)', width: 70, fontFamily: 'inherit' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--fh-sep)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{text.length}/2000</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setOpen(false); setText(''); setTags([]) }}
                    style={{ fontSize: 13, color: 'var(--fh-t4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={submit} disabled={!text.trim() || posting}
                    className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-opacity"
                    style={{ background: 'var(--fh-primary)', border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.5 }}>
                    {posting ? '…' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
