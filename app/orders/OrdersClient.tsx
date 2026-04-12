'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, Zap, Plus, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import OrderCard from '@/components/orders/OrderCard'
import { CATEGORIES } from '@/lib/mock'
import { CategorySlug, Order } from '@/lib/types'

const PAGE_SIZE = 12

interface Props {
  realOrders?: Order[]
}

export default function OrdersClient({ realOrders = [] }: Props) {
  const router    = useRouter()
  const pathname  = usePathname()
  const sp        = useSearchParams()

  const [search,     setSearch]     = useState(sp.get('q') ?? '')
  const [category,   setCategory]   = useState<CategorySlug | 'all'>((sp.get('cat') as CategorySlug) ?? 'all')
  const [urgentOnly, setUrgentOnly] = useState(sp.get('urgent') === '1')
  const [page,       setPage]       = useState(1)
  const [inputVal,   setInputVal]   = useState(sp.get('q') ?? '')

  // Debounce search input → state + URL
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(inputVal)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  // Sync filters → URL (no navigation, just replaces params)
  const syncUrl = useCallback((q: string, cat: string, urgent: boolean) => {
    const params = new URLSearchParams()
    if (q)       params.set('q', q)
    if (cat !== 'all') params.set('cat', cat)
    if (urgent)  params.set('urgent', '1')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])

  useEffect(() => { syncUrl(search, category, urgentOnly) }, [search, category, urgentOnly, syncUrl])

  function handleCategory(c: CategorySlug | 'all') {
    setCategory(c)
    setPage(1)
  }

  function handleUrgent() {
    setUrgentOnly(v => !v)
    setPage(1)
  }

  const allOrders = useMemo(() => realOrders, [realOrders])

  const filtered = useMemo(() => {
    let list = allOrders
    if (category !== 'all') list = list.filter((o) => o.category === category)
    if (urgentOnly) list = list.filter((o) => o.isUrgent)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    return list
  }, [search, category, urgentOnly, allOrders])

  const paginated  = filtered.slice(0, page * PAGE_SIZE)
  const hasMore    = paginated.length < filtered.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            style={{
              fontSize: 'clamp(22px, 3.5vw, 30px)',
              fontWeight: 510,
              letterSpacing: '-0.04em',
              color: '#f7f8f8',
              marginBottom: '6px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Заказы
          </h1>
          <p style={{ fontSize: '14px', color: '#8a8f98', fontWeight: 400 }}>
            Находите проекты по своей специальности
          </p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 transition-all"
          style={{
            padding: '9px 18px',
            borderRadius: '6px',
            background: '#5e6ad2',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 510,
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
        >
          <Plus className="h-4 w-4" />
          Разместить заказ
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: '#62666d' }}
          />
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Поиск по заказам..."
            className="w-full transition-all outline-none"
            style={{
              padding: '10px 14px 10px 36px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#f7f8f8',
              fontSize: '14px',
              fontWeight: 400,
            }}
            onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.35)' }}
            onBlur={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <button
          onClick={handleUrgent}
          className="flex items-center gap-2 transition-all"
          style={{
            padding: '10px 16px',
            borderRadius: '6px',
            border: urgentOnly ? '1px solid rgba(229,72,77,0.3)' : '1px solid rgba(255,255,255,0.08)',
            background: urgentOnly ? 'rgba(229,72,77,0.08)' : 'rgba(255,255,255,0.03)',
            color: urgentOnly ? '#e5484d' : '#8a8f98',
            fontSize: '13px',
            fontWeight: 510,
          }}
        >
          <Zap className="h-4 w-4" />
          Срочные
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap mb-8">
        {[{ slug: 'all' as const, label: 'Все' }, ...CATEGORIES].map((cat) => {
          const active = category === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategory(cat.slug)}
              className="transition-all"
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 510,
                background: active ? '#5e6ad2' : 'rgba(255,255,255,0.03)',
                border: active ? '1px solid rgba(113,112,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                color: active ? '#ffffff' : '#8a8f98',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <div className="mb-4" style={{ fontSize: '13px', color: '#62666d', fontWeight: 400 }}>
        Найдено:{' '}
        <span style={{ color: '#f7f8f8', fontWeight: 590 }}>{filtered.length}</span> заказов
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5">
          <div
            className="h-16 w-16 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.2)' }}
          >
            <Zap className="h-7 w-7" style={{ color: '#7170ff' }} />
          </div>
          <div className="text-center">
            <p style={{ fontSize: '16px', fontWeight: 510, color: '#f7f8f8', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              {search || urgentOnly || category !== 'all' ? 'Ничего не найдено' : 'Заказов пока нет'}
            </p>
            <p style={{ fontSize: '14px', color: '#8a8f98', maxWidth: '360px', lineHeight: 1.6 }}>
              {search || urgentOnly || category !== 'all'
                ? 'Попробуйте изменить фильтры или сбросить поиск.'
                : 'Платформа только запустилась — будьте первым! Разместите задачу бесплатно.'}
            </p>
          </div>
          {!search && !urgentOnly && category === 'all' && (
            <Link
              href="/orders/new"
              className="transition-all"
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                background: '#5e6ad2',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 510,
              }}
            >
              Разместить заказ бесплатно
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-2 transition-all"
                style={{
                  padding: '10px 24px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#d0d6e0',
                  fontSize: '14px',
                  fontWeight: 510,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              >
                <ChevronDown className="h-4 w-4" />
                Показать ещё ({filtered.length - paginated.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
