'use client'
import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import {
  Search, Sparkles, X, Loader2, ChevronDown, SlidersHorizontal,
  Code2, Palette, BarChart2, Target, PenLine, Video, Bot, Brain, Blocks,
} from 'lucide-react'
import FreelancerCard from '@/components/freelancers/FreelancerCard'
import FeaturedRow from '@/components/freelancers/FeaturedRow'
import { CATEGORIES } from '@/lib/mock'
import { Freelancer, CategorySlug, AvailabilityStatus } from '@/lib/types'
import { useLang } from '@/lib/context/LanguageContext'

// CATEGORIES.icon references Figma (not in lucide-react) — alias to Palette.
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code2, Figma: Palette, BarChart2, Target, PenLine, Video, Bot, Brain, Blocks, Sparkles,
}

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
  defaultCategory?: CategorySlug | 'all'
}

export default function FreelancersClient({ realFreelancers = [], defaultCategory }: Props) {
  const { t } = useLang()
  const p = t.pages.freelancers
  const router   = useRouter()
  const pathname = usePathname()
  const sp       = useSearchParams()

  const [inputVal,  setInputVal]  = useState(sp.get('q') ?? '')
  const [search,    setSearch]    = useState(sp.get('q') ?? '')
  const [category,  setCategory]  = useState<CategorySlug | 'all'>((sp.get('cat') as CategorySlug) ?? defaultCategory ?? 'all')
  const [sortBy,    setSortBy]    = useState<'rating' | 'price' | 'orders'>((sp.get('sort') as 'rating' | 'price' | 'orders') ?? 'rating')
  const [page,      setPage]      = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters,   setFilters]   = useState<Filters>({ priceMin: '', priceMax: '', minRating: 0, availability: 'all' })

  const [aiMode,      setAiMode]      = useState(false)
  const [aiQuery,     setAiQuery]     = useState('')
  const [aiLoading,   setAiLoading]   = useState(false)
  const [aiResults,   setAiResults]   = useState<SmartResult[] | null>(null)
  const [aiInterpret, setAiInterpret] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

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

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { all: allFreelancers.length }
    for (const f of allFreelancers) counts[f.category] = (counts[f.category] ?? 0) + 1
    return counts
  }, [allFreelancers])

  const noSearchActive = !search && category === 'all' && !aiMode

  const activeFiltersCount = [
    filters.priceMin !== '', filters.priceMax !== '',
    filters.minRating > 0, filters.availability !== 'all',
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    let list = allFreelancers
    if (category !== 'all') list = list.filter((f) => f.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((f) =>
        f.name.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.skills.some((s) => s.toLowerCase().includes(q))
      )
    }
    if (filters.priceMin) list = list.filter(f => f.priceFrom >= parseInt(filters.priceMin))
    if (filters.priceMax) list = list.filter(f => f.priceFrom <= parseInt(filters.priceMax))
    if (filters.minRating > 0) list = list.filter(f => f.rating >= filters.minRating)
    if (filters.availability !== 'all') list = list.filter(f => (f.availability ?? 'open') === filters.availability)
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
    setAiLoading(true); setAiResults(null)
    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery, type: 'freelancers' }),
      })
      const data = await res.json()
      setAiResults(data.results ?? [])
      setAiInterpret(data.interpretation ?? '')
    } catch { setAiResults([]) }
    finally { setAiLoading(false) }
  }

  function enableAiMode()  { setAiMode(true);  setAiResults(null); setAiQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  function disableAiMode() { setAiMode(false); setAiResults(null); setAiQuery('') }

  return (
    <div className="page-shell page-shell--wide pb-safe-mobile">

      {/* ── Editorial header ───────────────────────────────────── */}
      <div className="mb-5 sm:mb-8">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 14,
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--fh-t3)',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 24, height: 2, borderRadius: 2,
              background: '#27a644',
              boxShadow: '0 0 12px rgba(39,166,68,0.55)',
            }}
          />
          <span>{p.eyebrow}</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 4.5vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.035em',
            color: 'var(--fh-t1)',
            margin: 0,
            lineHeight: 1.0,
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          {p.headlineLead}{' '}
          <span
            style={{
              fontFamily:
                'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {p.headlineItalic}
          </span>
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fh-t3)', marginTop: 10 }}>
          {p.subtitle}
        </p>
      </div>

      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        {aiMode ? (
          <div className="relative flex-1">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fh-primary)' }} />
            <input
              ref={inputRef}
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runSmartSearch()}
              placeholder="Describe who you're looking for…"
              className="w-full outline-none transition-all"
              style={{
                padding: '10px 14px 10px 36px', borderRadius: '8px',
                background: 'var(--fh-primary-muted)', border: '1px solid var(--fh-primary)',
                color: 'var(--fh-t1)', fontSize: '14px',
              }}
            />
          </div>
        ) : (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--fh-t4)' }} />
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={p.searchPlaceholder}
              className="w-full outline-none transition-all"
              style={{
                padding: '10px 14px 10px 36px', borderRadius: '8px',
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t1)', fontSize: '14px',
              }}
              onFocus={e => { e.currentTarget.style.border = '1px solid var(--fh-primary)' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
            />
          </div>
        )}

        {aiMode ? (
          <>
            <button
              onClick={runSmartSearch}
              disabled={aiLoading || !aiQuery.trim()}
              className="flex items-center gap-2 transition-all disabled:opacity-50 active:scale-[0.97] flex-shrink-0"
              style={{
                padding: '10px 16px', borderRadius: '8px',
                background: 'var(--fh-primary)', color: '#fff', fontSize: '14px', fontWeight: 600,
              }}
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              <span className="hidden sm:inline">Search</span>
            </button>
            <button
              onClick={disableAiMode}
              className="flex items-center gap-2 transition-all active:scale-[0.97] flex-shrink-0"
              style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t3)', fontSize: '13px', fontWeight: 500,
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value as typeof sortBy)}
              className="outline-none transition-all flex-shrink-0"
              style={{
                padding: '10px 10px', borderRadius: '8px',
                background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t2)', fontSize: '13px', fontWeight: 500,
              }}
            >
              <option value="rating">{p.sortRating}</option>
              <option value="price">{p.sortPrice}</option>
              <option value="orders">{p.sortOrders}</option>
            </select>
            <button
              onClick={() => setShowFilters(p => !p)}
              className="relative flex items-center gap-1.5 transition-all active:scale-[0.97] flex-shrink-0"
              style={{
                padding: '10px 12px', borderRadius: '8px',
                background: showFilters || activeFiltersCount > 0 ? 'var(--fh-primary-muted)' : 'var(--fh-surface-2)',
                border: showFilters || activeFiltersCount > 0 ? '1px solid var(--fh-primary)' : '1px solid var(--fh-border-2)',
                color: showFilters || activeFiltersCount > 0 ? 'var(--fh-primary)' : 'var(--fh-t3)',
                fontSize: '13px', fontWeight: 500,
              }}
            >
              <SlidersHorizontal className="h-4 w-4" />
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
            <button
              onClick={enableAiMode}
              className="flex items-center gap-1.5 transition-all active:scale-[0.97] flex-shrink-0"
              style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'var(--fh-primary-muted)', border: '1px solid var(--fh-primary)',
                color: 'var(--fh-primary)', fontSize: '13px', fontWeight: 600,
              }}
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI</span>
            </button>
          </>
        )}
      </div>

      {/* ── Filter panel ────────────────────────────────────────── */}
      {showFilters && !aiMode && (
        <div className="mb-4 p-4 rounded-xl" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Price from', key: 'priceMin', placeholder: '0' },
              { label: 'Price to',   key: 'priceMax', placeholder: '∞' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                <input
                  type="number" value={filters[f.key as keyof Filters] as string}
                  onChange={e => { setFilters(prev => ({ ...prev, [f.key]: e.target.value })); setPage(1) }}
                  placeholder={f.placeholder}
                  className="w-full outline-none"
                  style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>Min rating</label>
              <select value={filters.minRating} onChange={e => { setFilters(f => ({ ...f, minRating: Number(e.target.value) })); setPage(1) }}
                className="w-full outline-none" style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)' }}>
                <option value={0}>Any</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={4.5}>4.5+</option>
                <option value={4.8}>4.8+</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 510, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>Availability</label>
              <select value={filters.availability} onChange={e => { setFilters(f => ({ ...f, availability: e.target.value as AvailabilityStatus | 'all' })); setPage(1) }}
                className="w-full outline-none" style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '13px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)' }}>
                <option value="all">All</option>
                <option value="open">Available</option>
                <option value="busy">Busy</option>
                <option value="vacation">On vacation</option>
              </select>
            </div>
          </div>
          {activeFiltersCount > 0 && (
            <button onClick={() => { setFilters({ priceMin: '', priceMax: '', minRating: 0, availability: 'all' }); setPage(1) }}
              style={{ marginTop: '10px', fontSize: '12px', color: 'var(--fh-primary)', fontWeight: 510, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* ── Featured row (top picks) — only on default view ─── */}
      {noSearchActive && !showFilters && activeFiltersCount === 0 && (
        <FeaturedRow freelancers={allFreelancers} />
      )}

      {/* ── Category tabs with icons + counts ─────────────────── */}
      {!(aiMode && aiResults) && (
        <div className="overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 mb-5 sm:mb-8">
          <div className="flex gap-1.5" style={{ width: 'max-content', paddingBottom: 4 }}>
            {[{ slug: 'all' as const, label: p.catAll, icon: 'Sparkles', color: 'var(--fh-primary)' }, ...CATEGORIES].map((cat) => {
              const active = category === cat.slug
              const Icon = CATEGORY_ICONS[cat.icon]
              const count = categoryCounts[cat.slug] ?? 0
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategory(cat.slug)}
                  className="flex-shrink-0 transition-all active:scale-[0.97] inline-flex items-center gap-1.5"
                  style={{
                    padding: '7px 12px 7px 10px', borderRadius: 999, fontSize: 13,
                    fontWeight: active ? 590 : 510,
                    background: active ? 'var(--fh-t1)' : 'var(--fh-surface-2)',
                    border: active ? '1px solid var(--fh-t1)' : '1px solid var(--fh-border)',
                    color: active ? 'var(--fh-canvas)' : 'var(--fh-t3)',
                    whiteSpace: 'nowrap',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {Icon && (
                    <Icon style={{
                      width: 13, height: 13,
                      color: active ? 'var(--fh-canvas)' : (cat.slug === 'all' ? 'var(--fh-t4)' : cat.color),
                    }} />
                  )}
                  {cat.label}
                  {count > 0 && (
                    <span style={{
                      marginLeft: 1, padding: '1px 6px', borderRadius: 999,
                      background: active ? 'rgba(0,0,0,0.15)' : 'var(--fh-surface)',
                      fontSize: 10, fontWeight: 700,
                      color: active ? 'var(--fh-canvas)' : 'var(--fh-t4)',
                      lineHeight: 1.4,
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── AI results ──────────────────────────────────────────── */}
      {aiMode && aiResults !== null ? (
        <>
          {aiInterpret && (
            <div className="mb-5 flex items-start gap-3 rounded-xl px-4 py-3"
              style={{ background: 'var(--fh-primary-muted)', border: '1px solid var(--fh-primary)' }}>
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--fh-primary)' }} />
              <div style={{ fontSize: '13px' }}>
                <span style={{ color: 'var(--fh-t3)' }}>AI interpreted as: </span>
                <span style={{ color: 'var(--fh-t1)', fontWeight: 510 }}>{aiInterpret}</span>
              </div>
            </div>
          )}
          <div className="mb-4" style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>
            AI found: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{aiRanked.length}</span> matching freelancers
          </div>
          {aiRanked.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--fh-t4)', opacity: 0.4 }} />
              <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>Nothing found</p>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>Try a different query or use classic search</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {aiRanked.map(({ freelancer, score, reason }) => (
                <div key={freelancer.id} className="relative">
                  <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1 rounded-full text-white shadow-md"
                    style={{ padding: '2px 8px', background: 'var(--fh-primary)', fontSize: '10px', fontWeight: 590 }}>
                    <Sparkles className="h-2.5 w-2.5" />
                    {score}%
                  </div>
                  <FreelancerCard freelancer={freelancer} />
                  <div className="mt-1.5 px-2 py-1 rounded-lg truncate"
                    style={{ background: 'var(--fh-primary-muted)', fontSize: '11px', color: 'var(--fh-primary)', fontWeight: 510 }}>
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
              {p.foundN}: <span style={{ color: 'var(--fh-t1)', fontWeight: 590 }}>{filtered.length}</span> {p.freelancersWord}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ fontSize: '16px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>
                {search || category !== 'all' ? p.empty.notFoundTitle : p.empty.noYetTitle}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', maxWidth: '380px', margin: '0 auto', lineHeight: 1.6 }}>
                {search || category !== 'all' ? p.empty.notFoundSub : p.empty.noYetSub}
              </p>
              {!search && category === 'all' && (
                <a href="/founders" className="inline-block mt-4 active:scale-[0.97] transition-all"
                  style={{ padding: '12px 26px', borderRadius: 999, background: 'var(--fh-t1)', color: 'var(--fh-canvas)', fontSize: 14, fontWeight: 590, letterSpacing: '-0.01em', textDecoration: 'none' }}>
                  {p.empty.cta}
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
                  <button onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-2 transition-all active:scale-[0.97]"
                    style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t2)', fontSize: '14px', fontWeight: 510 }}>
                    <ChevronDown className="h-4 w-4" />
                    Show more ({filtered.length - paginated.length})
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
