'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, ArrowRight } from 'lucide-react'

interface Viewer {
  user_id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  title: string | null
  last_viewed_at: string
}

interface Data {
  viewers: Viewer[]
  total: number
  anonymous: number
  days: number
}

function timeAgo(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000
  if (s < 60) return 'только что'
  if (s < 3600) return `${Math.floor(s / 60)} мин`
  if (s < 86400) return `${Math.floor(s / 3600)} ч`
  if (s < 604800) return `${Math.floor(s / 86400)} д`
  return new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short' })
}

export default function ProfileViewersWidget() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile/viewers?days=30&limit=5')
      .then(r => r.ok ? r.json() : null)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!data) return null
  if (data.total === 0) return null

  return (
    <div className="rounded-2xl border border-subtle bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Eye className="h-3.5 w-3.5" style={{ color: 'var(--fh-primary)' }} />
            <span className="text-sm font-semibold">Просмотры профиля</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {data.total} {pluralize(data.total, ['просмотр', 'просмотра', 'просмотров'])} за {data.days} дн.
          </div>
        </div>
        <Link
          href="/dashboard?tab=analytics"
          className="text-xs flex items-center gap-1"
          style={{ color: 'var(--fh-primary)' }}
        >
          Все <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {data.viewers.length > 0 ? (
        <div className="space-y-2">
          {data.viewers.map(v => (
            <Link
              key={v.user_id}
              href={v.username ? `/u/${v.username}` : `/freelancers/${v.user_id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-subtle transition-colors"
            >
              <div
                className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0"
                style={{ background: 'var(--fh-surface-2)' }}
              >
                {v.avatar_url && (
                  <Image src={v.avatar_url} alt="" width={36} height={36} className="h-full w-full object-cover" unoptimized />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {v.full_name ?? v.username ?? 'Без имени'}
                </div>
                {v.title && (
                  <div className="text-xs text-muted-foreground truncate">{v.title}</div>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {timeAgo(v.last_viewed_at)}
              </span>
            </Link>
          ))}
          {data.anonymous > 0 && (
            <div className="text-xs text-muted-foreground pt-2 border-t border-subtle text-center">
              + {data.anonymous} {pluralize(data.anonymous, ['анонимный', 'анонимных', 'анонимных'])} {pluralize(data.anonymous, ['просмотр', 'просмотра', 'просмотров'])}
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {data.anonymous} анонимных — войдите, чтобы видеть профили
        </div>
      )}
    </div>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1]
  return forms[2]
}
