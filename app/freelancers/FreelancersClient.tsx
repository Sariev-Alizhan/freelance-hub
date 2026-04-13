'use client'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Search, Sparkles, X, Loader2, ChevronDown, SlidersHorizontal } from 'lucide-react'
import FreelancerCard from '@/components/freelancers/FreelancerCard'
import { CATEGORIES } from '@/lib/mock'
import { Freelancer, CategorySlug, AvailabilityStatus } from '@/lib/types'

interface Filters {
  priceMin: string
  priceMax: string
  minRating: number
  availability: AvailabilityStatus | 'all'
}

const PAGE_SIZE = 12

interface SmartResult { id: string; score: number; reason: string }

interface Props {
  realFreelancers?: Freelancer[]
}

export default function FreelancersClient({ realFreelancers = [] }: Props) {
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()

  const [inputVal,  setInputVal]  = useState(sp.get('q') ?? '')
  const [search,    setSearch]    = useState(sp.get('q') ?? '')
  const [category,  setCategory]  = useState<CategorySlug | 'all'>((sp.get('cat') as CategorySlug) ?? 'all')
  const [sortBy,    setSortBy]    = useState<'rating' | 'price' | 'orders'>((sp.get('sort') as 'rating' | 'price' | 'orders') ?? 'rating')
  const [page,      setPage]      = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters,   setFilters]   = useState<Filters>({
    priceMin: '', priceMax: '', minRating: 0, availability: 'all',
  })

  // AI mode
  const [aiMode,      setAiMode]      = useState(false)
  const [aiQuery,     setAiQuery]     = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [aiResults,   setAiResults]   = useState<SmartResult[] | null>(null)
  const [aiInterpret, setAiInterpret] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(inputVal); setPage(1) }, 300)
    return () => clearTimeout(t)
  }, [inputVal])

  const syncUrl = useCallback((q: string, cat: string, sort: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat !== 'all') params.set('cat', cat)
    if (sort !== 'rating') params.set('sort', sort)
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])

  useEffect(() => { syncUrl(search, category, sortBy) }, [search, category, sortBy, syncUrl])

  function handleCategory(c: CategorySlug | 'all') { setCategory(c); setPage(1) }
  function handleSort(s: 'rating' | 'price' | 'orders') { setSortBy(s); setPage(1) }

  const allFreelancers = useMemo(() => realFreelancers, [realFreelancers])

  const activeFiltersCount = [
    filters.priceMin !== '',
    filters.priceMax !== '',
    filters.minRating > 0,
    filters.availability !== 'all',
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    let list = allFreelancers
    if (category !== 'all') list = list.filter((f) => f.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    // Price filters
    if (filters.priceMin) list = list.filter(f => f.priceFrom >= parseInt(filters.priceMin))
    if (filters.priceMax) list = list.filter(f => f.priceFrom <= parseInt(filters.priceMax))
    // Rating filter
    if (filters.minRating > 0) list = list.filter(f => f.rating >= filters.minRating)
    // Availability filter
    if (filters.availability !== 'all') {
      list = list.filter(f => (f.availability ?? 'open') === filters.availability)
    }
    if (sortBy === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    if (sortBy === 'price')  list = [...list].sort((a, b) => a.priceFrom - b.priceFrom)
    if (sortBy === 'orders') list = [...list].sort((a, b) => b.completedOrders - a.completedOrders)
    return list
  }, [search, category, sortBy, allFreelancers, filters])

  const aiRanked = useMemo<Array<{ freelancer: Freelancer; score: number; reason: string }>>(() => {
    if (!aiResults) return []
    return aiResults
      .map((r) => {
        const freelancer = allFreelancers.find((f) => f.id === r.id)
        return freelancer ? { freelancer, score: r.score, reason: r.reason } : null
      })
      .filter(Boolean) as Array<{ freelancer: Freelancer; score: number; reason: string }>
  }, [aiResults, allFreelancers])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore   = paginated.length < filtered.length

  async function runSmartSearch() {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    setAiResults(null)
    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, type: 'freelancers' }),
      })
      const data = await res.json()
      setAiResults(data.results ?? [])
      setAiInterpret(data.interpretation ?? '')
    } catch {
      setAiResults([])
    } finally {
      setAiLoading(false)
    }
  }

  function enableAiMode()  { setAiMode(true);  setAiResults(null); setAiQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  function disableAiMode() { setAiMode(false); setAiResults(null); setAiQuery('') }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          style={{
            fontSize: 'clamp(22px, 3.5vw, 30px)',
            fontWeight: 510,
            letterSpacing: '-0.04em',
            color: 'var(--fh-t1)',
            marginBottom: '6px',
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          Фрилансеры
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--fh-t3)', fontWeight: 400 }}>
          Найдите идеального специалиста для вашего проекта
        </p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        {aiMode ? (
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#7170ff' }} />
            <input
              ref={inputRef}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSmartSearch()}
              placeholder="Опишите кого ищете — например: React-разработчик для стартапа"
              className="w-full outline-none transition-all"
              style={{
                padding: '10px 14px 10px 36px',
                borderRadius: '6px',
                background: 'rgba(113,112,255,0.06)',
                border: '1px solid rgba(113,112,255,0.3)',
                color: 'var(--fh-t1)',
                fontSize: '14px',
              }}
            />
          </div>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fh-t4)' }} />
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Поиск по имени, навыкам..."
              className="w-full outline-none transition-all"
              style={{
                padding: '10px 14px 10px 36px',
                borderRadius: '6px',
                background: 'var(--fh-surface-2)',
                border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t1)',
                fontSize: '14px',
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.35)' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
            />
          </div>
        )}

        {aiMode ? (
          <div className="flex gap-2">
            <button
              onClick={runSmartSearch}
              disabled={aiLoading || !aiQuery.trim()}
              className="flex items-center gap-2 transition-all disabled:opacity-50"
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                background: '#5e6ad2',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 510,
              }}
              onMouseEnter={e => { if (!aiLoading) e.currentTarget.style.background = '#828fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Найти
            </button>
            <button
              onClick={disableAiMode}
              className="flex items-center gap-2 transition-all"
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'var(--fh-surface-2)',
                border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t3)',
                fontSize: '13px',
                fontWeight: 510,
              }}
            >
              <X className="h-4 w-4" /> Обычный
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
              className="outline-none transition-all"
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'var(--fh-surface-2)',
                border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t2)',
                fontSize: '13px',
                fontWeight: 510,
              }}
            >
              <option value="rating">По рейтингу</option>
              <option value="price">По цене</option>
              <option value="orders">По заказам</option>
            </select>
            <button
              onClick={() => setShowFilters(p => !p)}
              className="relative flex items-center gap-1.5 transition-all"
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: showFilters || activeFiltersCount > 0 ? 'rgba(113,112,255,0.1)' : 'var(--fh-surface-2)',
                border: showFilters || activeFiltersCount > 0 ? '1px solid rgba(113,112,255,0.3)' : '1px solid var(--fh-border-2)',
                color: showFilters || activeFiltersCount > 0 ? '#7170ff' : 'var(--fh-t3)',
                fontSize: '13px',
                fontWeight: 510,
              }}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: '#7170ff', color: '#fff',
                  fontSize: '10px', fontWeight: 590,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{activeFiltersCount}</span>
              )}
            </button>
            <button
              onClick={enableAiMode}
              className="flex items-center gap-2 whitespace-nowrap transition-all"
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                background: 'rgba(113,112,255,0.06)',
                border: '1px solid rgba(113,112,255,0.2)',
                color: '#7170ff',
                fontSize: '13px',
                fontWeight: 590,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.06)' }}
            >
              <Sparkles className="h-4 w-4" />
              AI Поиск
            </button>
          </div>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && !aiMode && (
        <div
          className="mb-4 p-4 rounded-xl"
          style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Price min */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Цена от (₽)
              </label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={e => { setFilters(f => ({ ...f, priceMin: e.target.value })); setPage(1) }}
                placeholder="0"
                className="w-full outline-none"
                style={{
                  padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)',
                }}
              />
            </div>
            {/* Price max */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Цена до (₽)
              </label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={e => { setFilters(f => ({ ...f, priceMax: e.target.value })); setPage(1) }}
                placeholder="∞"
                className="w-full outline-none"
                style={{
                  padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)',
                }}
              />
            </div>
            {/* Min rating */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Рейтинг от
              </label>
              <select
                value={filters.minRating}
                onChange={e => { setFilters(f => ({ ...f, minRating: Number(e.target.value) })); setPage(1) }}
                className="w-full outline-none"
                style={{
                  padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)',
                }}
              >
                <option value={0}>Любой</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={4.5}>4.5+</option>
                <option value={4.8}>4.8+</option>
              </select>
            </div>
            {/* Availability */}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Доступность
              </label>
              <select
                value={filters.availability}
                onChange={e => { setFilters(f => ({ ...f, availability: e.target.value as AvailabilityStatus | 'all' })); setPage(1) }}
                className="w-full outline-none"
                style={{
                  padding: '8px 12px', borderRadius: '6px', fontSize: '13px',
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)',
                }}
              >
                <option value="all">Все</option>
                <option value="open">Открыт</option>
                <option value="busy">Занят</option>
                <option value="vacation">В отпуске</option>
              </select>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilters({ priceMin: '', priceMax: '', minRating: 0, availability: 'all' }); setPage(1) }}
              style={{ marginTop: '10px', fontSize: '12px', color: '#7170ff', fontWeight: 510, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {/* Category tabs */}
      {!(aiMode && aiResults) && (
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
                  background: active ? '#5e6ad2' : 'var(--fh-surface-2)',
                  border: active ? '1px solid rgba(113,112,255,0.3)' : '1px solid var(--fh-border)',
                  color: active ? '#ffffff' : 'var(--fh-t3)',
                }}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      )}

      {/* AI results */}
      {aiMode && aiResults !== null ? (
        <>
          {aiInterpret && (
            <div
              className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: 'rgba(113,112,255,0.06)', border: '1px solid rgba(113,112,255,0.18)' }}
            >
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#7170ff' }} />
              <div style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--fh-t3)' }}>AI понял запрос как: </span>
                <span style={{ color: 'var(--fh-t1)', fontWeight: 510 }}>{aiInterpret}</span>
              </div>
            </div>
          )}

          <div className="mb-4" style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
            AI нашёл: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{aiRanked.length}</span> подходящих фрилансеров
          </div>

          {aiRanked.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--fh-t4)', opacity: 0.4 }} />
              <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>Ничего не найдено</p>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>Попробуй другой запрос или используй обычный поиск</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {aiRanked.map(({ freelancer, score, reason }) => (
                <div key={freelancer.id} className="relative">
                  <div
                    className="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full text-white shadow-md"
                    style={{ padding: '2px 8px', background: '#5e6ad2', fontSize: '10px', fontWeight: 590 }}
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {score}%
                  </div>
                  <FreelancerCard freelancer={freelancer} />
                  <div
                    className="mt-1.5 px-2 py-1 rounded-lg truncate"
                    style={{ background: 'rgba(113,112,255,0.06)', fontSize: '11px', color: '#7170ff', fontWeight: 510 }}
                  >
                    {reason}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {!aiMode && (
            <div className="mb-4" style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
              Найдено: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{filtered.length}</span> фрилансеров
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>
                {search || category !== 'all' ? 'Ничего не найдено' : 'Фрилансеров пока нет'}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
                {search || category !== 'all'
                  ? 'Попробуйте изменить фильтры или поисковый запрос.'
                  : 'Платформа только запустилась. Зарегистрируйтесь как фрилансер и станьте одним из первых!'}
              </p>
              {!search && category === 'all' && (
                <a
                  href="/auth/register"
                  className="inline-block mt-4 transition-all"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    background: '#5e6ad2',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 510,
                  }}
                >
                  Зарегистрироваться бесплатно
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {paginated.map((f) => (
                  <FreelancerCard key={f.id} freelancer={f} />
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
                      background: 'var(--fh-surface-2)',
                      border: '1px solid var(--fh-border-2)',
                      color: 'var(--fh-t2)',
                      fontSize: '14px',
                      fontWeight: 510,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Показать ещё ({filtered.length - paginated.length})
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
