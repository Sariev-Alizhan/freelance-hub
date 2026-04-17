'use client'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, RefreshCw, X } from 'lucide-react'
import { CURRENT_RELEASE } from '@/lib/company-report'
import { FEED_RELEASES, EDITOR_POSTS, type FeedRelease, type EditorPost } from '@/lib/feed-content'
import { useProfile } from '@/lib/context/ProfileContext'
import { useUser } from '@/lib/hooks/useUser'
import { useToastHelpers } from '@/lib/context/ToastContext'
import StoriesBar from '@/components/stories/StoriesBar'
import NewsCard from '@/components/feed/NewsCard'
import PostCard from '@/components/feed/PostCard'
import UpdateCard from '@/components/feed/UpdateCard'
import ReleaseCard from '@/components/feed/ReleaseCard'
import EditorCard from '@/components/feed/EditorCard'
import ComposePost from '@/components/feed/ComposePost'
import type { NewsItem, UserPost, Reactions } from '@/components/feed/types'

type FeedItem =
  | { kind: 'news';    data: NewsItem }
  | { kind: 'post';    data: UserPost }
  | { kind: 'update' }
  | { kind: 'release'; data: FeedRelease }
  | { kind: 'editor';  data: EditorPost  }

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

  const [pullY,    setPullY]   = useState(0)
  const touchStart             = useRef(0)
  const PULL_THRESHOLD         = 72

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

  useEffect(() => {
    function onStart(e: TouchEvent) {
      touchStart.current = window.scrollY === 0 ? e.touches[0].clientY : 0
    }
    function onMove(e: TouchEvent) {
      if (!touchStart.current) return
      const delta = e.touches[0].clientY - touchStart.current
      if (delta > 0) setPullY(Math.min(delta * 0.5, PULL_THRESHOLD + 12))
      else { setPullY(0); touchStart.current = 0 }
    }
    function onEnd() {
      if (pullY >= PULL_THRESHOLD && !loading && !refreshing) load(true)
      setPullY(0); touchStart.current = 0
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove',  onMove,  { passive: true })
    window.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('touchend',   onEnd)
    }
  }, [pullY, loading, refreshing, load])

  useEffect(() => { load() }, [load])

  const handleReact = useCallback(async (itemId: string, action: string) => {
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
  }, [user, reactions, toastOk, toastErr, toastInfo])

  const handleNewPost = useCallback((post: UserPost) => {
    setUserPosts(p => [post, ...p])
  }, [])

  const handleDeletePost = useCallback(async (id: string) => {
    await fetch(`/api/feed/posts?id=${id}`, { method: 'DELETE' })
    setUserPosts(p => p.filter(x => x.id !== id))
    toastOk('Post deleted')
  }, [toastOk])

  const getR = (id: string): Reactions => reactions[id] ?? { likes: 0, dislikes: 0, saves: 0, reposts: 0, mine: [] }

  const feedItems: FeedItem[] = useMemo(() => {
    const q = query.toLowerCase()

    const filteredNews = q
      ? news.filter(n => n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q) || n.source_label.toLowerCase().includes(q))
      : news

    const filteredPosts = q
      ? userPosts.filter(p => p.content.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)) || (p.profiles?.full_name ?? '').toLowerCase().includes(q))
      : userPosts

    const items: FeedItem[] = []

    if (!q) {
      items.push({ kind: 'update' })
      if (EDITOR_POSTS[0]) items.push({ kind: 'editor',  data: EDITOR_POSTS[0] })
      if (FEED_RELEASES[0]) items.push({ kind: 'release', data: FEED_RELEASES[0] })
    }

    const curated: FeedItem[] = q ? [] : [
      ...FEED_RELEASES.slice(1).map(r => ({ kind: 'release' as const, data: r })),
      ...EDITOR_POSTS.slice(1).map(p => ({ kind: 'editor'  as const, data: p })),
    ]

    let pi = 0
    let ni = 0
    let ci = 0
    let pos = 0

    while (ni < filteredNews.length || pi < filteredPosts.length || ci < curated.length) {
      if (pos > 0 && pos % 4 === 0 && ci < curated.length) {
        items.push(curated[ci++])
      } else if (pos % 6 === 0 && pi < filteredPosts.length) {
        items.push({ kind: 'post', data: filteredPosts[pi++] })
      } else if (ni < filteredNews.length) {
        items.push({ kind: 'news', data: filteredNews[ni++] })
      } else if (pi < filteredPosts.length) {
        items.push({ kind: 'post', data: filteredPosts[pi++] })
      } else if (ci < curated.length) {
        items.push(curated[ci++])
      }
      pos++
    }

    return items
  }, [news, userPosts, query])

  return (
    <div>
      {pullY > 0 && (
        <div className="flex justify-center pt-2 pb-1 md:hidden" style={{ height: pullY, overflow: 'hidden', transition: 'height 0.1s' }}>
          <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-t4)', opacity: pullY / PULL_THRESHOLD }} />
        </div>
      )}
      {refreshing && (
        <div className="flex justify-center py-2 md:hidden">
          <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--fh-primary)' }} />
        </div>
      )}

      {/* Desktop: constrained width */}
      <div className="hidden sm:block mx-auto max-w-[640px] px-4 sm:px-6">
        <div className="sticky z-20 pt-4 pb-3" style={{ top: 'var(--feed-sticky-top, 0px)', background: 'var(--fh-canvas)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}>
          <div className="flex items-center gap-2" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', borderRadius: 24, padding: '10px 16px' }}>
            <Search className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setQuery(search) }} placeholder="Search posts, news, topics…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--fh-t1)', fontFamily: 'inherit' }} />
            {search && <button onClick={() => { setSearch(''); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 0 }}><X className="h-3.5 w-3.5" /></button>}
          </div>
        </div>
        {!query && <div style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', borderRadius: 18, padding: '4px 12px', marginBottom: 12, overflow: 'hidden' }}><StoriesBar currentUserId={user?.id} /></div>}
        {!query && <ComposePost user={user} profile={profile} onPost={handleNewPost} />}
        {loading ? <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="rounded-2xl animate-pulse" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)', height: 140 }} />)}</div> : feedItems.length === 0 ? <div className="flex flex-col items-center justify-center py-20 gap-3 text-center"><Search className="h-8 w-8" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} /><p style={{ fontSize: 14, color: 'var(--fh-t4)' }}>Ничего не найдено</p><button onClick={() => { setSearch(''); setQuery('') }} style={{ fontSize: 13, color: 'var(--fh-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Очистить</button></div> : <div className="space-y-3">{feedItems.map((item) => { if (item.kind === 'update') return <UpdateCard key="update" reactions={getR(`update-v${CURRENT_RELEASE.version}`)} onReact={handleReact} user={user} profile={profile} />; if (item.kind === 'release') return <ReleaseCard key={`rel-${item.data.version}`} release={item.data} reactions={getR(`rel-${item.data.version}`)} onReact={handleReact} user={user} profile={profile} />; if (item.kind === 'editor') return <EditorCard key={`ed-${item.data.id}`} post={item.data} reactions={getR(`ed-${item.data.id}`)} onReact={handleReact} user={user} profile={profile} />; if (item.kind === 'post') return <PostCard key={item.data.id} post={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} onDelete={handleDeletePost} />; return <NewsCard key={item.data.id} item={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} /> })}</div>}
        <div className="h-8" />
      </div>

      {/* Mobile: edge-to-edge Instagram layout */}
      <div className="sm:hidden">
        {!query && (
          <div style={{ borderBottom: '0.5px solid var(--fh-sep)', paddingBottom: 2 }}>
            <StoriesBar currentUserId={user?.id} />
          </div>
        )}

        {query && (
          <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--fh-sep)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--fh-surface-2)', borderRadius: 12, padding: '10px 14px' }}>
              <Search style={{ width: 16, height: 16, flexShrink: 0, color: 'var(--fh-t4)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') setQuery(search) }} placeholder="Поиск…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--fh-t1)', fontFamily: 'inherit' }} autoFocus />
              <button onClick={() => { setSearch(''); setQuery('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: 0 }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
          </div>
        )}

        {!query && <ComposePost user={user} profile={profile} onPost={handleNewPost} mobile />}

        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ borderBottom: '0.5px solid var(--fh-sep)', padding: '16px', display: 'flex', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--fh-surface-2)', flexShrink: 0, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 12, borderRadius: 6, background: 'var(--fh-surface-2)', marginBottom: 8, width: '40%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 10, borderRadius: 5, background: 'var(--fh-surface-2)', width: '80%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            ))}
          </div>
        ) : feedItems.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 12, textAlign: 'center' }}>
            <Search style={{ width: 32, height: 32, color: 'var(--fh-t4)', opacity: 0.3 }} />
            <p style={{ fontSize: 15, color: 'var(--fh-t4)' }}>Ничего не найдено</p>
            <button onClick={() => { setSearch(''); setQuery('') }} style={{ fontSize: 14, color: 'var(--fh-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>Очистить поиск</button>
          </div>
        ) : (
          <div>
            {feedItems.map((item) => {
              if (item.kind === 'update')  return <UpdateCard  key="update" reactions={getR(`update-v${CURRENT_RELEASE.version}`)} onReact={handleReact} user={user} profile={profile} />
              if (item.kind === 'release') return <ReleaseCard key={`rel-${item.data.version}`} release={item.data} reactions={getR(`rel-${item.data.version}`)} onReact={handleReact} user={user} profile={profile} />
              if (item.kind === 'editor')  return <EditorCard  key={`ed-${item.data.id}`} post={item.data} reactions={getR(`ed-${item.data.id}`)} onReact={handleReact} user={user} profile={profile} />
              if (item.kind === 'post')    return <PostCard    key={item.data.id} post={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} onDelete={handleDeletePost} />
              return <NewsCard key={item.data.id} item={item.data} reactions={getR(item.data.id)} onReact={handleReact} user={user} profile={profile} />
            })}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
