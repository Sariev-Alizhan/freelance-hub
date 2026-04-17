'use client'
import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import ComposePost from '@/components/feed/ComposePost'
import type { UserPost } from '@/components/feed/types'

interface Post {
  id: string
  content: string
  tags: string[]
  created_at: string
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function ProfilePosts({ userId, isOwner }: { userId: string; isOwner?: boolean }) {
  const [posts,   setPosts]   = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const { user }    = useUser()
  const { profile } = useProfile()

  useEffect(() => {
    fetch(`/api/feed/posts?user_id=${userId}&limit=20`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId])

  function prependPost(p: UserPost) {
    setPosts(prev => [{
      id: p.id, content: p.content, tags: p.tags ?? [], created_at: p.created_at,
    }, ...prev])
  }

  return (
    <div style={{
      borderRadius: 14, padding: '20px',
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
    }}>
      <h2 style={{ fontSize: 14, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 14 }}>Posts</h2>

      {isOwner && user && (
        <div style={{ marginBottom: 14 }}>
          <ComposePost user={user} profile={profile} onPost={prependPost} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="animate-pulse rounded-xl h-20"
              style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-sep)' }} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2 text-center">
          <FileText className="h-7 w-7" style={{ color: 'var(--fh-t4)', opacity: 0.3 }} />
          <p style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
            {isOwner ? 'Share your first post above' : 'No posts yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="rounded-xl p-3"
              style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-sep)' }}>
              <p style={{ fontSize: 14, color: 'var(--fh-t1)', lineHeight: 1.6 }}
                className={post.content.length > 240 ? 'line-clamp-4' : ''}>
                {post.content}
              </p>
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {post.tags.map(t => (
                    <span key={t} className="rounded-full px-2 py-0.5 text-[11px]"
                      style={{ background: 'rgba(113,112,255,0.08)', color: '#7170ff' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, color: 'var(--fh-t4)', marginTop: 6 }}>{timeAgo(post.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
