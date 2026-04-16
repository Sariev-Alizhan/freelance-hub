'use client'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, Zap, Plus, ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import OrderCard from '@/components/orders/OrderCard'
import SaveSearchButton from '@/components/orders/SaveSearchButton'
import { CATEGORIES } from '@/lib/mock'
import { CategorySlug, Order } from '@/lib/types'

const PAGE_SIZE = 12

interface Props {
  realOrders?: Order[]
  currentUserId?: string
}

export default function OrdersClient({ realOrders = [], currentUserId }: Props) {
  const router    = useRouter()
  const pathname  = usePathname()
  const sp        = useSearchParams()

  const [search,     setSearch]     = useState(sp.get('q') ?? '')
  const [category,   setCategory]   = useState<CategorySlug | 'all'>((sp.get('cat') as CategorySlug) ?? 'all')
  const [urgentOnly, setUrgentOnly] = useState(sp.get('urgent') === '1')
  const [page,       setPage]       = useState(1)
  const [inputVal,   setInputVal]   = useState(sp.get('q') ?? '')
  const [sortBy,     setSortBy]     = useState<'newest' | 'budget_asc' | 'budget_desc' | 'responses'>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const [budgetMin,  setBudgetMin]  = useState('')
  const [budgetMax,  setBudgetMax]  = useState('')

  const activeFiltersCount = [budgetMin !== '', budgetMax !== ''].filter(Boolean).length

  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  const syncUrl = useCallback((q: string, cat: string, urgent: boolean) => {
    const params = new URLSearchParams()
    if (q)       params.set('q', q)
    if (cat !== 'all') params.set('cat', cat)
    if (urgent)  params.set('urgent', '1')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])

  useEffect(() => { syncUrl(search, category, urgentOnly) }, [search, category, urgentOnly, syncUrl])

  function handleCategory(c: CategorySlug | 'all') { setCategory(c); setPage(1) }
  function handleUrgent() { setUrgentOnly(v => !v); setPage(1) }

  const allOrders = useMemo(() => realOrders, [realOrders])

  const filtered = useMemo(() => {
    let list = allOrders
    if (category !== 'all') list = list.filter((o) => o.category === category)
    if (urgentOnly) list = list.filter((o) => o.isUrgent)
    if (budgetMin) list = list.filter((o) => o.budget.max >= parseInt(budgetMin))
    if (budgetMax) list = list.filter((o) => o.budget.min <= parseInt(budgetMax))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          o.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (sortBy === 'budget_asc')  list = [...list].sort((a, b) => a.budget.min - b.budget.min)
    if (sortBy === 'budget_desc') list = [...list].sort((a, b) => b.budget.max - a.budget.max)
    if (sortBy === 'responses')   list = [...list].sort((a, b) => a.responsesCount - b.responsesCount)
    list = [...list].sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0))
    return list
  }, [search, category, urgentOnly, budgetMin, budgetMax, sortBy, allOrders])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore   = paginated.length < filtered.length

  return (
    <div className="page-shell page-shell--wide pb-safe-mobile">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div>
          <h1 style={{
            fontSize: 'clamp(20px, 3.5vw, 30px)', fontWeight: 510,
            letterSpacing: '-0.04em', color: 'var(--fh-t1)', marginBottom: '4px',
          }}>
            Orders
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>
            Find projects in your field
          </p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-1.5 transition-all active:scale-[0.97]"
          style={{
            padding: '8px 14px', borderRadius: '8px',
            background: 'var(--fh-primary)', color: '#fff',
            fontSize: '13px', fontWeight: 600,
          }}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Post a Job</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* ── Search + filters row ────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fh-t4)' }} />
          <input
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search orders..."
            className="w-full transition-all outline-none"
            style={{
              padding: '10px 14px 10px 36px', borderRadius: '8px',
              background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t1)', fontSize: '14px',
            }}
            onFocus={e => { e.currentTarget.style.border = '1px solid var(--fh-primary)'; e.currentTarget.style.opacity = '0.8' }}
            onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)'; e.currentTarget.style.opacity = '1' }}
          />
        </div>
        <button
          onClick={handleUrgent}
          className="flex items-center gap-1.5 transition-all active:scale-[0.97] flex-shrink-0"
          style={{
            padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
            border: urgentOnly ? '1px solid rgba(229,72,77,0.3)' : '1px solid var(--fh-border-2)',
            background: urgentOnly ? 'rgba(229,72,77,0.08)' : 'var(--fh-surface-2)',
            color: urgentOnly ? '#e5484d' : 'var(--fh-t3)',
          }}
        >
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">Urgent</span>
        </button>
        <button
          onClick={() => setShowFilters(v => !v)}
          className="relative flex items-center gap-1.5 transition-all active:scale-[0.97] flex-shrink-0"
          style={{
            padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 500,
            border: (showFilters || activeFiltersCount > 0) ? '1px solid var(--fh-primary)' : '1px solid var(--fh-border-2)',
            background: (showFilters || activeFiltersCount > 0) ? 'var(--fh-primary-muted)' : 'var(--fh-surface-2)',
            color: (showFilters || activeFiltersCount > 0) ? 'var(--fh-primary)' : 'var(--fh-t3)',
          }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--fh-primary)', color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{activeFiltersCount}</span>
          )}
        </button>
        <div className="hidden sm:flex">
          <SaveSearchButton keyword={search} category={category} urgentOnly={urgentOnly} />
        </div>
      </div>

      {/* ── Filter panel ────────────────────────────────────────── */}
      {showFilters && (
        <div className="mb-4 p-4 rounded-xl flex flex-wrap gap-4 items-end"
          style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)' }}>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 510 }}>Budget, ₸</label>
            <div className="flex items-center gap-2">
              <input
                type="number" placeholder="from" value={budgetMin}
                onChange={e => { setBudgetMin(e.target.value); setPage(1) }}
                className="outline-none"
                style={{ width: '90px', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)' }}
              />
              <span style={{ color: 'var(--fh-t4)', fontSize: '12px' }}>—</span>
              <input
                type="number" placeholder="to" value={budgetMax}
                onChange={e => { setBudgetMax(e.target.value); setPage(1) }}
                className="outline-none"
                style={{ width: '90px', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)' }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 510 }}>Sort by</label>
            <div className="flex flex-wrap gap-1.5">
              {([
                { value: 'newest',      label: 'Newest' },
                { value: 'budget_desc', label: '↓ Budget' },
                { value: 'budget_asc',  label: '↑ Budget' },
                { value: 'responses',   label: 'Fewer responses' },
              ] as const).map(opt => (
                <button key={opt.value} onClick={() => { setSortBy(opt.value); setPage(1) }}
                  style={{
                    padding: '7px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 510,
                    background: sortBy === opt.value ? 'var(--fh-primary-muted)' : 'var(--fh-surface)',
                    border: sortBy === opt.value ? '1px solid var(--fh-primary)' : '1px solid var(--fh-border-2)',
                    color: sortBy === opt.value ? 'var(--fh-primary)' : 'var(--fh-t3)',
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button onClick={() => { setBudgetMin(''); setBudgetMax(''); setSortBy('newest'); setPage(1) }}
              className="flex items-center gap-1"
              style={{ fontSize: '12px', color: 'var(--fh-t4)', marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X className="h-3.5 w-3.5" /> Reset
            </button>
          )}
        </div>
      )}

      {/* ── Category tabs — horizontal scroll on mobile ──────── */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 sm:mb-8">
        <div className="flex gap-1.5" style={{ width: 'max-content', paddingBottom: 4 }}>
          {[{ slug: 'all' as const, label: 'All' }, ...CATEGORIES].map((cat) => {
            const active = category === cat.slug
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategory(cat.slug)}
                className="flex-shrink-0 transition-all active:scale-[0.97]"
                style={{
                  padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: active ? 600 : 500,
                  background: active ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
                  border: active ? '1px solid transparent' : '1px solid var(--fh-border)',
                  color: active ? '#fff' : 'var(--fh-t3)',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Count ───────────────────────────────────────────────── */}
      <div className="mb-4" style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
        Found: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{filtered.length}</span> orders
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--fh-primary-muted)', border: '1px solid var(--fh-border)' }}>
            <Zap className="h-6 w-6" style={{ color: 'var(--fh-primary)' }} />
          </div>
          <div className="text-center">
            <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              {search || urgentOnly || category !== 'all' ? 'Nothing found' : 'No orders yet'}
            </p>
            <p style={{ fontSize: '14px', color: 'var(--fh-t3)', maxWidth: '320px', lineHeight: 1.6 }}>
              {search || urgentOnly || category !== 'all'
                ? 'Try changing the filters or clearing the search.'
                : 'The platform just launched — be the first! Post a job for free.'}
            </p>
          </div>
          {!search && !urgentOnly && category === 'all' && (
            <Link href="/orders/new" className="transition-all active:scale-[0.97]"
              style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--fh-primary)', color: '#fff', fontSize: '14px', fontWeight: 510 }}>
              Post a Job — Free
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paginated.map((order) => (
              <OrderCard key={order.id} order={order} currentUserId={currentUserId} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-2 transition-all active:scale-[0.97]"
                style={{
                  padding: '10px 24px', borderRadius: '8px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t2)', fontSize: '14px', fontWeight: 510,
                }}
              >
                <ChevronDown className="h-4 w-4" />
                Show more ({filtered.length - paginated.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
