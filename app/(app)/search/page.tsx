'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Film, Package, Briefcase, User, Play, Star } from 'lucide-react'

type Tab = 'all' | 'orders' | 'people' | 'reels' | 'services'

interface Profile {
  id: string; username: string | null; full_name: string | null
  avatar_url: string | null; bio: string | null; role: string | null
  is_verified: boolean | null
}

interface OrderHit {
  id: string; title: string; category: string | null
  budget_min: number | null; budget_max: number | null
  status: string | null; created_at: string
}
interface PersonHit {
  user_id: string; title: string | null; category: string | null
  price_from: number | null; price_to: number | null; rating: number | null
  profile: Profile | null
}
interface ReelHit {
  id: string; caption: string | null; thumbnail_url: string | null
  video_url: string; views: number | null; profile: Profile | null
}
interface ServiceHit {
  id: string; title: string; category: string | null
  cover_image: string | null; profile: Profile | null
}

interface Results {
  orders: OrderHit[]
  people: PersonHit[]
  reels: ReelHit[]
  services: ServiceHit[]
}

const TABS: { key: Tab; label: string; icon: typeof Search }[] = [
  { key: 'all', label: 'Все', icon: Search },
  { key: 'orders', label: 'Заказы', icon: Briefcase },
  { key: 'people', label: 'Люди', icon: User },
  { key: 'services', label: 'Услуги', icon: Package },
  { key: 'reels', label: 'Видео', icon: Film },
]

export default function SearchPage() {
  const router = useRouter()
  const params = useSearchParams()
  const initial = params.get('q') ?? ''
  const initialTab = (params.get('type') as Tab) || 'all'

  const [q, setQ] = useState(initial)
  const [tab, setTab] = useState<Tab>(initialTab)
  const [data, setData] = useState<Results | null>(null)
  const [loading, setLoading] = useState(false)

  // Debounced fetch
  const query = q.trim()
  const shortQuery = query.length < 2

  useEffect(() => {
    if (shortQuery) return

    const ctrl = new AbortController()
    const t = setTimeout(() => {
      setLoading(true)
      const qs = new URLSearchParams({ q: query, type: tab })
      fetch(`/api/search?${qs.toString()}`, { signal: ctrl.signal })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setData(d) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 220)

    return () => { ctrl.abort(); clearTimeout(t) }
  }, [query, tab, shortQuery])

  // Sync URL on blur/change (don't spam history)
  useEffect(() => {
    const query = q.trim()
    const qs = new URLSearchParams()
    if (query) qs.set('q', query)
    if (tab !== 'all') qs.set('type', tab)
    const str = qs.toString()
    router.replace(str ? `/search?${str}` : '/search', { scroll: false })
  }, [q, tab, router])

  const totalCount = useMemo(() => {
    if (!data) return 0
    return data.orders.length + data.people.length + data.reels.length + data.services.length
  }, [data])

  return (
    <div className="page-shell page-shell--wide">
      <div className="mb-4">
        <div
          className="flex items-center gap-2 px-4 rounded-full border border-subtle"
          style={{ background: 'var(--fh-surface-2)', height: 44 }}
        >
          <Search className="h-4 w-4" style={{ color: 'var(--fh-t4)' }} />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск заказов, людей, услуг, видео…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--fh-t1)' }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="text-xs"
              style={{ color: 'var(--fh-t4)' }}
            >
              Очистить
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-subtle overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === key ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {shortQuery ? (
        <EmptyPrompt />
      ) : loading && !data ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Ищу…</div>
      ) : totalCount === 0 ? (
        <div className="text-center py-12">
          <div className="text-sm font-medium mb-1">Ничего не найдено</div>
          <div className="text-xs text-muted-foreground">Попробуйте другой запрос</div>
        </div>
      ) : (
        <div className="space-y-8">
          {data && data.orders.length > 0 && (tab === 'all' || tab === 'orders') && (
            <Section title="Заказы" icon={Briefcase} count={data.orders.length}>
              {data.orders.map(o => <OrderCard key={o.id} o={o} />)}
            </Section>
          )}
          {data && data.people.length > 0 && (tab === 'all' || tab === 'people') && (
            <Section title="Люди" icon={User} count={data.people.length}>
              {data.people.map(p => <PersonCard key={p.user_id} p={p} />)}
            </Section>
          )}
          {data && data.services.length > 0 && (tab === 'all' || tab === 'services') && (
            <Section title="Услуги" icon={Package} count={data.services.length}>
              {data.services.map(s => <ServiceCard key={s.id} s={s} />)}
            </Section>
          )}
          {data && data.reels.length > 0 && (tab === 'all' || tab === 'reels') && (
            <Section title="Reels" icon={Film} count={data.reels.length}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.reels.map(r => <ReelTile key={r.id} r={r} />)}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, icon: Icon, count, children }: {
  title: string; icon: typeof Search; count: number; children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4" style={{ color: 'var(--fh-primary)' }} />
        <h2 className="font-semibold text-sm">{title}</h2>
        <span className="text-xs text-muted-foreground">· {count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function EmptyPrompt() {
  return (
    <div className="text-center py-16">
      <Search className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--fh-t4)' }} />
      <div className="text-sm font-medium mb-1">Что ищете?</div>
      <div className="text-xs text-muted-foreground">
        Введите минимум 2 символа — ищем среди заказов, людей, услуг и Reels
      </div>
    </div>
  )
}

function OrderCard({ o }: { o: OrderHit }) {
  const budget = o.budget_min && o.budget_max
    ? `${o.budget_min.toLocaleString()}–${o.budget_max.toLocaleString()} ₸`
    : o.budget_min ? `от ${o.budget_min.toLocaleString()} ₸` : ''
  return (
    <Link
      href={`/orders/${o.id}`}
      className="block p-3 rounded-xl border border-subtle hover:bg-subtle transition-colors"
    >
      <div className="font-medium text-sm mb-0.5 line-clamp-1">{o.title}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {o.category && <span>{o.category}</span>}
        {o.category && budget && <span>·</span>}
        {budget && <span style={{ color: 'var(--fh-primary)' }}>{budget}</span>}
      </div>
    </Link>
  )
}

function PersonCard({ p }: { p: PersonHit }) {
  const prof = p.profile
  const href = prof?.username ? `/u/${prof.username}` : `/freelancers/${p.user_id}`
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-xl border border-subtle hover:bg-subtle transition-colors"
    >
      <div
        className="h-10 w-10 rounded-full bg-subtle flex-shrink-0 overflow-hidden"
        style={{ background: 'var(--fh-surface-2)' }}
      >
        {prof?.avatar_url && (
          <Image src={prof.avatar_url} alt="" width={40} height={40} className="h-full w-full object-cover" unoptimized />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{prof?.full_name ?? prof?.username ?? 'Без имени'}</div>
        <div className="text-xs text-muted-foreground truncate">
          {p.title ?? p.category ?? ''}
        </div>
      </div>
      {p.rating != null && p.rating > 0 && (
        <div className="flex items-center gap-1 text-xs flex-shrink-0">
          <Star className="h-3 w-3" style={{ color: 'var(--fh-primary)', fill: 'var(--fh-primary)' }} />
          {p.rating.toFixed(1)}
        </div>
      )}
    </Link>
  )
}

function ServiceCard({ s }: { s: ServiceHit }) {
  const prof = s.profile
  return (
    <Link
      href={`/u/${prof?.username ?? s.id}#service-${s.id}`}
      className="flex items-center gap-3 p-3 rounded-xl border border-subtle hover:bg-subtle transition-colors"
    >
      <div
        className="h-10 w-10 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: 'var(--fh-surface-2)' }}
      >
        {s.cover_image ? (
          <Image src={s.cover_image} alt="" width={40} height={40} className="h-full w-full object-cover" unoptimized />
        ) : (
          <Package className="h-full w-full p-2.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm line-clamp-1">{s.title}</div>
        <div className="text-xs text-muted-foreground">
          {prof?.full_name ?? prof?.username ?? ''} {s.category && `· ${s.category}`}
        </div>
      </div>
    </Link>
  )
}

function ReelTile({ r }: { r: ReelHit }) {
  return (
    <Link
      href={`/reels/${r.id}`}
      className="block relative rounded-xl overflow-hidden"
      style={{ aspectRatio: '9 / 16', background: 'var(--fh-surface-2)' }}
    >
      {r.thumbnail_url ? (
        <Image src={r.thumbnail_url} alt="" fill className="object-cover" unoptimized />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Play className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div
        className="absolute inset-0 flex items-end p-2"
        style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.7))' }}
      >
        <div className="text-white text-xs flex items-center gap-1">
          <Play className="h-3 w-3" />
          {r.views ?? 0}
        </div>
      </div>
    </Link>
  )
}
