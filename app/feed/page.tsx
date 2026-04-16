'use client'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Search, ThumbsUp, ThumbsDown, Bookmark, Share2,
  MessageCircle, RefreshCw, Send, X, CheckCircle2,
  ArrowUp, ExternalLink, Plus, Hash,
} from 'lucide-react'
import { CURRENT_RELEASE } from '@/lib/company-report'
import { useProfile } from '@/lib/context/ProfileContext'
import { useUser } from '@/lib/hooks/useUser'
import { useToastHelpers } from '@/lib/context/ToastContext'

// ── Types ─────────────────────────────────────────────────────────────────────

interface NewsItem {
  id: string
  title: string
  url: string | null
  author: string
  points: number
  num_comments: number
  created_at: string
  source: string
  source_label: string
  hn_url: string
}

interface UserPost {
  id: string
  content: string
  tags: string[]
  created_at: string
  user_id: string
  profiles: { full_name: string | null; avatar_url: string | null; username: string | null } | null
}

type FeedItem =
  | { kind: 'news';   data: NewsItem }
  | { kind: 'post';   data: UserPost }
  | { kind: 'update' }

interface Reactions {
  likes: number; dislikes: number; saves: number; reposts: number; mine: string[]
}

interface Comment {
  id: string; content: string; created_at: string; user_id: string
  profiles: { full_name: string | null; avatar_url: string | null; username: string | null } | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SRC_COLOR: Record<string, string> = {
  hn: '#f97316', reddit_ai: '#ff4500', reddit_ml: '#7170ff', reddit_llama: '#27a644',
}
const SRC_BG: Record<string, string> = {
  hn: 'rgba(249,115,22,0.1)', reddit_ai: 'rgba(255,69,0,0.1)',
  reddit_ml: 'rgba(113,112,255,0.1)', reddit_llama: 'rgba(39,166,68,0.1)',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

function UserAvatar({ url, name, size = 32 }: { url?: string | null; name?: string | null; size?: number }) {
  if (url) return <Image src={url} alt={name ?? ''} width={size} height={size} className="rounded-full object-cover flex-shrink-0" style={{ width: size, height: size }} unoptimized />
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.38, background: '#7170ff', flexShrink: 0 }}>
      {(name ?? '?')[0]?.toUpperCase()}
    </div>
  )
}

// ── CommentThread ─────────────────────────────────────────────────────────────

function CommentThread({ itemId, user, profile, open }: {
  itemId: string; user: { id: string } | null
  profile: { avatar_url: string | null; full_name: string | null } | null; open: boolean
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
    setLoading(false); setLoaded(true)
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
              style={{ background: text.trim() ? '#7170ff' : 'var(--fh-border)', color: '#fff', border: 'none', cursor: 'pointer' }}>
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

// ── ActionBar ─────────────────────────────────────────────────────────────────

function ActionBar({ itemId, reactions, onReact, commentsOpen, onToggleComments, user }: {
  itemId: string; reactions: Reactions; onReact: (a: string) => void
  commentsOpen: boolean; onToggleComments: () => void; user: { id: string } | null
}) {
  const liked = reactions.mine.includes('like')
  const disliked = reactions.mine.includes('dislike')
  const saved = reactions.mine.includes('save')

  const Btn = ({ active, color, icon, count, onClick }: { active: boolean; color: string; icon: React.ReactNode; count?: number; onClick: () => void }) => (
    <button onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-[12px] font-semibold"
      style={{ background: active ? `${color}15` : 'transparent', color: active ? color : 'var(--fh-t4)', border: 'none', cursor: user ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      {icon}{count !== undefined && count > 0 && <span>{count}</span>}
    </button>
  )

  return (
    <div className="flex items-center gap-0.5 px-3 py-2" style={{ borderTop: '1px solid var(--fh-sep)' }}>
      <Btn active={liked}    color="#27a644" icon={<ThumbsUp   className="h-3.5 w-3.5" />} count={reactions.likes}    onClick={() => onReact('like')}    />
      <Btn active={disliked} color="#e5484d" icon={<ThumbsDown className="h-3.5 w-3.5" />} count={reactions.dislikes} onClick={() => onReact('dislike')} />
      <button onClick={onToggleComments}
        className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-[12px] font-semibold"
        style={{ background: commentsOpen ? 'rgba(113,112,255,0.1)' : 'transparent', color: commentsOpen ? '#7170ff' : 'var(--fh-t4)', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => { if (!commentsOpen) (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
        onMouseLeave={e => { if (!commentsOpen) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
        <MessageCircle className="h-3.5 w-3.5" />
      </button>
      <Btn active={saved} color="#f59e0b" icon={<Bookmark className="h-3.5 w-3.5" />} onClick={() => onReact('save')} />
      <button onClick={() => onReact('repost')}
        className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-[12px] ml-auto"
        style={{ background: 'transparent', color: 'var(--fh-t4)', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--fh-surface-2)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
        <Share2 className="h-3.5 w-3.5" />
        {reactions.reposts > 0 && <span style={{ fontSize: 12, color: 'var(--fh-t4)' }}>{reactions.reposts}</span>}
      </button>
    </div>
  )
}

// ── Card shell (uniform look) ─────────────────────────────────────────────────

function CardShell({ children, itemId, reactions, onReact, user, profile }: {
  children: React.ReactNode; itemId: string; reactions: Reactions
  onReact: (id: string, action: string) => void
  user: { id: string } | null; profile: { avatar_url: string | null; full_name: string | null } | null
}) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
      <div style={{ padding: '14px 16px 0' }}>{children}</div>
      <ActionBar itemId={itemId} reactions={reactions} onReact={a => onReact(itemId, a)}
        commentsOpen={commentsOpen} onToggleComments={() => setCommentsOpen(o => !o)} user={user} />
      <CommentThread itemId={itemId} user={user} profile={profile} open={commentsOpen} />
    </div>
  )
}

// ── News card ─────────────────────────────────────────────────────────────────

function NewsCard({ item, reactions, onReact, user, profile }: {
  item: NewsItem; reactions: Reactions
  onReact: (id: string, action: string) => void
  user: { id: string } | null; profile: { avatar_url: string | null; full_name: string | null } | null
}) {
  const color = SRC_COLOR[item.source] ?? '#888'
  const bg    = SRC_BG[item.source] ?? 'var(--fh-surface-2)'
  const href  = item.url ?? item.hn_url

  return (
    <CardShell itemId={item.id} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      {/* Source + meta */}
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

      {/* Title */}
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

// ── User post card ────────────────────────────────────────────────────────────

function PostCard({ post, reactions, onReact, user, profile, onDelete }: {
  post: UserPost; reactions: Reactions
  onReact: (id: string, action: string) => void
  user: { id: string } | null; profile: { avatar_url: string | null; full_name: string | null } | null
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = post.content.length > 220
  const displayContent = expanded || !isLong ? post.content : post.content.slice(0, 220) + '…'

  return (
    <CardShell itemId={post.id} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      {/* Author */}
      <div className="flex items-center gap-2 mb-2">
        <UserAvatar url={post.profiles?.avatar_url} name={post.profiles?.full_name} size={28} />
        <div className="flex-1 min-w-0">
          <span style={{ fontSize: 13, fontWeight: 590, color: 'var(--fh-t1)' }}>
            {post.profiles?.full_name ?? post.profiles?.username ?? 'User'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--fh-t4)', marginLeft: 6 }}>{timeAgo(post.created_at)}</span>
        </div>
        {user?.id === post.user_id && (
          <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 4 }}>
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <p style={{ fontSize: 14, color: 'var(--fh-t1)', lineHeight: 1.6, marginBottom: 6 }}>
        {displayContent}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(o => !o)} style={{ fontSize: 12, color: '#7170ff', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 6 }}>
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {post.tags.map(t => (
            <span key={t} className="rounded-full px-2 py-0.5 text-[11px]"
              style={{ background: 'rgba(113,112,255,0.08)', color: '#7170ff' }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </CardShell>
  )
}

// ── Update card (platform release) ───────────────────────────────────────────

function UpdateCard({ reactions, onReact, user, profile }: {
  reactions: Reactions; onReact: (id: string, action: string) => void
  user: { id: string } | null; profile: { avatar_url: string | null; full_name: string | null } | null
}) {
  const rel = CURRENT_RELEASE
  const itemId = `update-v${rel.version}`
  const allShipped = rel.reports.flatMap(d => d.done.map(item => ({ emoji: d.emoji, item }))).slice(0, 8)

  return (
    <CardShell itemId={itemId} reactions={reactions} onReact={onReact} user={user} profile={profile}>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: 'rgba(113,112,255,0.12)', border: '1px solid rgba(113,112,255,0.2)' }}>
          🚀
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(113,112,255,0.12)', color: '#7170ff' }}>
              v{rel.version}
            </span>
            <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>
              {new Date(rel.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em', marginTop: 2 }}>{rel.title}</p>
        </div>
        <Link href="/updates" style={{ marginLeft: 'auto', fontSize: 11, color: '#7170ff', textDecoration: 'none', flexShrink: 0 }}>
          All updates →
        </Link>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <CheckCircle2 className="h-3 w-3 text-green-400" />
        <span style={{ fontSize: 10, fontWeight: 700, color: '#27a644', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Just shipped · {allShipped.length} features
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

// ── Compose post ──────────────────────────────────────────────────────────────

function ComposePost({ user, profile, onPost }: {
  user: { id: string } | null
  profile: { avatar_url: string | null; full_name: string | null } | null
  onPost: (post: UserPost) => void
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
            Share what's on your mind about your work…
          </span>
          <Plus className="h-4 w-4 flex-shrink-0" style={{ color: '#7170ff' }} />
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

              {/* Tags input */}
              <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px]"
                    style={{ background: 'rgba(113,112,255,0.1)', color: '#7170ff' }}>
                    #{t}
                    <button onClick={() => setTags(p => p.filter(x => x !== t))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7170ff', padding: 0 }}>
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

              {/* Bottom row */}
              <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--fh-sep)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>{text.length}/2000</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setOpen(false); setText(''); setTags([]) }}
                    style={{ fontSize: 13, color: 'var(--fh-t4)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={submit} disabled={!text.trim() || posting}
                    className="px-4 py-1.5 rounded-lg text-[13px] font-semibold text-white transition-opacity"
                    style={{ background: '#7170ff', border: 'none', cursor: text.trim() ? 'pointer' : 'not-allowed', opacity: text.trim() ? 1 : 0.5 }}>
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

// ── Main FeedPage ─────────────────────────────────────────────────────────────

export default function FeedPage() {
  const { user } = useUser()
  const { profile } = useProfile()
  const { success: toastOk, error: toastErr, info: toastInfo } = useToastHelpers()

  const [news,       setNews]       = useState<NewsItem[]>([])
  const [userPosts,  setUserPosts]  = useState<UserPost[]>([])
  const [reactions,  setReactions]  = useState<Record<string, Reactions>>({})
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search,     setSearch]     = useState('')
  const [query,      setQuery]      = useState('')   // committed search

  // Load news + posts in parallel
  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const [newsRes, postsRes] = await Promise.all([
        fetch('/api/ai/news'),
        fetch('/api/feed/posts?limit=60'),
      ])
      const [newsData, postsData] = await Promise.all([newsRes.json(), postsRes.json()])
      const items: NewsItem[] = newsData.items ?? []
      const posts: UserPost[] = postsData.posts ?? []
      setNews(items)
      setUserPosts(posts)

      // Batch-load reactions
      const updateId = `update-v${CURRENT_RELEASE.version}`
      const ids = [updateId, ...items.map(i => i.id), ...posts.map(p => p.id)]
      if (ids.length) {
        const rRes = await fetch(`/api/feed/react?item_ids=${ids.join(',')}`)
        const rData: Record<string, Reactions> = await rRes.json()
        setReactions(prev => ({ ...prev, ...rData }))
      }
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // React handler with optimistic update
  async function handleReact(itemId: string, action: string) {
    if (!user) { toastErr('Sign in to react'); return }

    if (action === 'repost') {
      try { await navigator.clipboard.writeText(window.location.href) } catch {}
      toastOk('Link copied!')
    }

    setReactions(prev => {
      const cur = prev[itemId] ?? { likes: 0, dislikes: 0, saves: 0, reposts: 0, mine: [] }
      const hasMine = cur.mine.includes(action)
      const opposite = action === 'like' ? 'dislike' : action === 'dislike' ? 'like' : null
      const newMine = hasMine ? cur.mine.filter(a => a !== action) : [...cur.mine.filter(a => a !== opposite), action]
      const delta = (a: string) => { const had = cur.mine.includes(a); const has = newMine.includes(a); return has && !had ? 1 : !has && had ? -1 : 0 }
      return { ...prev, [itemId]: { likes: cur.likes + delta('like'), dislikes: cur.dislikes + delta('dislike'), saves: cur.saves + delta('save'), reposts: cur.reposts + delta('repost'), mine: newMine } }
    })

    if (action === 'save') {
      const was = reactions[itemId]?.mine.includes('save')
      was ? toastInfo('Removed from saved') : toastOk('Saved!')
    }

    await fetch('/api/feed/react', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item_id: itemId, action }) })
  }

  function handleNewPost(post: UserPost) {
    setUserPosts(p => [post, ...p])
  }

  async function handleDeletePost(id: string) {
    await fetch(`/api/feed/posts?id=${id}`, { method: 'DELETE' })
    setUserPosts(p => p.filter(x => x.id !== id))
    toastOk('Post deleted')
  }

  const getR = (id: string): Reactions => reactions[id] ?? { likes: 0, dislikes: 0, saves: 0, reposts: 0, mine: [] }

  // Build unified feed: interleave user posts and news, platform update first
  const feedItems: FeedItem[] = useMemo(() => {
    const q = query.toLowerCase()

    const filteredNews = q
      ? news.filter(n => n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q) || n.source_label.toLowerCase().includes(q))
      : news

    const filteredPosts = q
      ? userPosts.filter(p => p.content.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)) || (p.profiles?.full_name ?? '').toLowerCase().includes(q))
      : userPosts

    const items: FeedItem[] = []

    // Platform update first (pinned, no search filter)
    if (!q) items.push({ kind: 'update' })

    // Interleave: 1 post every 5 news items
    let pi = 0
    let ni = 0
    let pos = 0

    while (ni < filteredNews.length || pi < filteredPosts.length) {
      if (pos % 6 === 0 && pi < filteredPosts.length) {
        items.push({ kind: 'post', data: filteredPosts[pi++] })
      } else if (ni < filteredNews.length) {
        items.push({ kind: 'news', data: filteredNews[ni++] })
      } else if (pi < filteredPosts.length) {
        items.push({ kind: 'post', data: filteredPosts[pi++] })
      }
      pos++
    }

    return items
  }, [news, userPosts, query])

  return (
    <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-6">

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        <div
          className="flex items-center gap-2 flex-1"
          style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', borderRadius: 24, padding: '10px 16px' }}
        >
          <Search className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') setQuery(search) }}
            placeholder="Search posts, news, topics…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--fh-t1)', fontFamily: 'inherit' }}
          />
          {search && (
            <button onClick={() => { setSearch(''); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 0 }}>
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center justify-center rounded-full flex-shrink-0 transition-colors"
          style={{ width: 42, height: 42, background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', color: 'var(--fh-t4)', cursor: 'pointer' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t2)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--fh-t4)' }}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Compose post ───────────────────────────────────────────────────── */}
      {!query && <ComposePost user={user} profile={profile} onPost={handleNewPost} />}

      {/* ── Feed ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', height: 140 }} />
          ))}
        </div>
      ) : feedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Search className="h-8 w-8" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
          <p style={{ fontSize: 14, color: 'var(--fh-t4)' }}>Nothing found for "{query}"</p>
          <button onClick={() => { setSearch(''); setQuery('') }} style={{ fontSize: 13, color: '#7170ff', background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {feedItems.map((item, i) => {
            if (item.kind === 'update') {
              return <UpdateCard key="update" reactions={getR(`update-v${CURRENT_RELEASE.version}`)} onReact={handleReact} user={user} profile={profile} />
            }
            if (item.kind === 'post') {
              return <PostCard key={item.data.id} post={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} onDelete={handleDeletePost} />
            }
            return <NewsCard key={item.data.id} item={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} />
          })}
        </div>
      )}

      <div className="h-8" />
    </div>
  )
}
