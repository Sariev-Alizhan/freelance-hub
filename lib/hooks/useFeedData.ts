'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CURRENT_RELEASE } from '@/lib/company-report'
import { FEED_RELEASES, EDITOR_POSTS, type FeedRelease, type EditorPost } from '@/lib/feed-content'
import { useToastHelpers } from '@/lib/context/ToastContext'
import type { UserPost, Reactions } from '@/components/feed/types'

export type FeedItem =
  | { kind: 'post';    data: UserPost }
  | { kind: 'update' }
  | { kind: 'release'; data: FeedRelease }
  | { kind: 'editor';  data: EditorPost  }

/**
 * Owns all data for the feed page: news + user posts + batched reactions,
 * optimistic like/save/repost handlers, create/delete for user posts, and
 * the interleaved `feedItems` list (news + posts + curated cards) filtered
 * by the committed search `query`.
 */
export function useFeedData({
  user,
  query,
}: {
  user: { id: string } | null
  query: string
}) {
  const { success: toastOk, error: toastErr, info: toastInfo } = useToastHelpers()

  const [userPosts,  setUserPosts]  = useState<UserPost[]>([])
  const [reactions,  setReactions]  = useState<Record<string, Reactions>>({})
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true)
    try {
      const postsRes = await fetch('/api/feed/posts?limit=60')
      const postsData = await postsRes.json()
      const posts: UserPost[] = postsData.posts ?? []
      setUserPosts(posts)

      const updateId = `update-v${CURRENT_RELEASE.version}`
      const ids = [updateId, ...posts.map(p => p.id)]
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

  const getR = useCallback(
    (id: string): Reactions => reactions[id] ?? { likes: 0, dislikes: 0, saves: 0, reposts: 0, mine: [] },
    [reactions],
  )

  const feedItems: FeedItem[] = useMemo(() => {
    const q = query.toLowerCase()

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
    let ci = 0
    let pos = 0

    while (pi < filteredPosts.length || ci < curated.length) {
      if (pos > 0 && pos % 4 === 0 && ci < curated.length) {
        items.push(curated[ci++])
      } else if (pi < filteredPosts.length) {
        items.push({ kind: 'post', data: filteredPosts[pi++] })
      } else if (ci < curated.length) {
        items.push(curated[ci++])
      }
      pos++
    }

    return items
  }, [userPosts, query])

  return {
    loading, refreshing, load,
    handleReact, handleNewPost, handleDeletePost,
    getR, feedItems,
  }
}
