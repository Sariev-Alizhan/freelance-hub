'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  Search, Sparkles, Loader2, X, Clock,
  ArrowRight, User, Briefcase,
} from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

interface SearchResult {
  id: string
  score: number
  reason: string
}

interface EnrichedResult extends SearchResult {
  title: string
  subtitle: string
  href: string
  meta?: string
}

type SearchType = 'freelancers' | 'orders'

const STORAGE_KEY = 'fh-ai-search-history'
const MAX_HISTORY = 6

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#27a644' : score >= 60 ? '#7170ff' : score >= 40 ? '#f59e0b' : '#8a8f98'
  const pct = score / 100
  const r = 16, cx = 20, cy = 20, circumference = 2 * Math.PI * r
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--fh-border)" strokeWidth="3" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - pct)}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>
        {score}
      </text>
    </svg>
  )
}

export default function AISearchPage() {
  const [type,          setType]          = useState<SearchType>('freelancers')
  const [query,         setQuery]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const [interpretation,setInterpretation]= useState('')
  const [rawResults,    setRawResults]    = useState<SearchResult[] | null>(null)
  const [enriched,      setEnriched]      = useState<EnrichedResult[]>([])
  const [history,       setHistory]       = useState<string[]>([])
  const [showHistory,   setShowHistory]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const td = t.aiPage
  const EXAMPLES: Record<SearchType, string[]> = {
    freelancers: td.exFreelancers,
    orders:      td.exOrders,
  }

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      setHistory(Array.isArray(h) ? h : [])
    } catch { /* ignore */ }
  }, [])

  // Close history dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function saveToHistory(q: string) {
    const next = [q, ...history.filter(h => h !== q)].slice(0, MAX_HISTORY)
    setHistory(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function removeFromHistory(q: string) {
    const next = history.filter(h => h !== q)
    setHistory(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  async function search(q?: string) {
    const finalQuery = (q ?? query).trim()
    if (!finalQuery) return
    setQuery(finalQuery)
    setShowHistory(false)
    setLoading(true)
    setRawResults(null)
    setEnriched([])
    setInterpretation('')
    saveToHistory(finalQuery)

    try {
      const res = await fetch('/api/ai/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery, type }),
      })
      const data = await res.json()
      setInterpretation(data.interpretation || finalQuery)
      const results: SearchResult[] = data.results ?? []
      setRawResults(results)

      // Enrich with real data
      if (results.length > 0) {
        const ids = results.map(r => r.id)
        const enrichRes = await fetch('/api/ai/smart-search/enrich', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids, type }),
        })
        if (enrichRes.ok) {
          const enrichData = await enrichRes.json()
          const map: Record<string, { title: string; subtitle: string; meta?: string }> = enrichData.items ?? {}
          setEnriched(results.map(r => ({
            ...r,
            title:    map[r.id]?.title    ?? '—',
            subtitle: map[r.id]?.subtitle ?? '',
            meta:     map[r.id]?.meta,
            href:     type === 'freelancers' ? `/freelancers/${r.id}` : `/orders/${r.id}`,
          })))
        } else {
          // Fallback: show without enrich
          setEnriched(results.map(r => ({
            ...r,
            title:    r.id.slice(0, 8) + '…',
            subtitle: r.reason,
            href:     type === 'freelancers' ? `/freelancers/${r.id}` : `/orders/${r.id}`,
          })))
        }
      }
    } catch {
      setInterpretation(td.searchFailed)
    } finally {
      setLoading(false)
    }
  }

  const hasResults = enriched.length > 0
  const noResults  = rawResults !== null && rawResults.length === 0

  return (
    <div className="min-h-[calc(100vh-52px)]" style={{ background: 'var(--fh-canvas)' }}>
      {/* Hero search section */}
      <div style={{
        padding: 'clamp(40px,6vw,80px) 16px clamp(32px,4vw,48px)',
        background: 'linear-gradient(180deg, rgba(94,106,210,0.04) 0%, transparent 100%)',
        borderBottom: hasResults || noResults ? '1px solid var(--fh-sep)' : 'none',
      }}>
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 14px', borderRadius: '100px', marginBottom: '20px',
            background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)',
            fontSize: '12px', fontWeight: 590, color: '#7170ff',
          }}>
            <Sparkles className="h-3.5 w-3.5" />
            {td.searchBadge}
          </div>

          <h1 style={{
            fontSize: 'clamp(26px,5vw,44px)', fontWeight: 510,
            letterSpacing: '-0.05em', color: 'var(--fh-t1)',
            marginBottom: '10px', lineHeight: 1.1,
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            {td.searchTitle}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--fh-t3)', marginBottom: '28px', lineHeight: 1.5 }}>
            {td.searchSubtitle}
          </p>

          {/* Type toggle */}
          <div style={{
            display: 'inline-flex', gap: '4px', padding: '4px',
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
            borderRadius: '10px', marginBottom: '20px',
          }}>
            {(['freelancers', 'orders'] as const).map(tk => (
              <button
                key={tk}
                onClick={() => { setType(tk); setRawResults(null); setEnriched([]) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 18px', borderRadius: '7px',
                  background: type === tk ? '#5e6ad2' : 'transparent',
                  color: type === tk ? '#fff' : 'var(--fh-t3)',
                  fontSize: '13px', fontWeight: 510, border: 'none', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tk === 'freelancers'
                  ? <><User className="h-3.5 w-3.5" /> {td.searchTypeFreelancers}</>
                  : <><Briefcase className="h-3.5 w-3.5" /> {td.searchTypeOrders}</>
                }
              </button>
            ))}
          </div>

          {/* Search input */}
          <div ref={panelRef} style={{ position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 6px 6px 16px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)',
              borderRadius: '14px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
              transition: 'border-color 0.15s',
            }}
              onFocus={() => history.length > 0 && setShowHistory(true)}
            >
              <Search className="h-4.5 w-4.5 flex-shrink-0" style={{ color: 'var(--fh-t4)', width: 18, height: 18 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => history.length > 0 && setShowHistory(true)}
                onKeyDown={e => {
                  if (e.key === 'Enter') search()
                  if (e.key === 'Escape') setShowHistory(false)
                }}
                placeholder={
                  type === 'freelancers'
                    ? td.searchPhFreelancers
                    : td.searchPhOrders
                }
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  fontSize: '14px', color: 'var(--fh-t1)', lineHeight: 1.5,
                  fontFamily: 'inherit',
                }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setRawResults(null); setEnriched([]) }}
                  style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', display: 'flex', padding: '4px' }}>
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => search()}
                disabled={!query.trim() || loading}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 18px', borderRadius: '9px',
                  background: query.trim() && !loading ? '#5e6ad2' : 'var(--fh-surface-2)',
                  border: '1px solid transparent',
                  color: query.trim() && !loading ? '#fff' : 'var(--fh-t4)',
                  fontSize: '13px', fontWeight: 590, cursor: query.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><Sparkles className="h-3.5 w-3.5" /> {td.searchBtn}</>
                }
              </button>
            </div>

            {/* History dropdown */}
            {showHistory && history.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                borderRadius: '12px', overflow: 'hidden', zIndex: 50,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              }}>
                <div style={{ padding: '8px 12px 4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock className="h-3 w-3" style={{ color: 'var(--fh-t4)' }} />
                  <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 590 }}>{td.searchRecent}</span>
                </div>
                {history.map(h => (
                  <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 8px' }}>
                    <button
                      onClick={() => search(h)}
                      style={{
                        flex: 1, textAlign: 'left', padding: '7px 8px', background: 'none', border: 'none',
                        cursor: 'pointer', fontSize: '13px', color: 'var(--fh-t2)', borderRadius: '6px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {h}
                    </button>
                    <button
                      onClick={() => removeFromHistory(h)}
                      style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', opacity: 0.5, display: 'flex', padding: '4px' }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Example chips */}
          {!hasResults && !loading && (
            <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
              {EXAMPLES[type].map(ex => (
                <button
                  key={ex}
                  onClick={() => { setQuery(ex); search(ex) }}
                  style={{
                    padding: '5px 14px', borderRadius: '100px',
                    background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                    color: 'var(--fh-t3)', fontSize: '12px', fontWeight: 400, cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(113,112,255,0.4)'; e.currentTarget.style.color = '#7170ff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--fh-border)'; e.currentTarget.style.color = 'var(--fh-t3)' }}
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="page-shell page-shell--reading">
        {/* Loading */}
        {loading && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#7170ff' }} />
              <span style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>
                {td.searchAnalyzing}
              </span>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                borderRadius: '12px', marginBottom: '8px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--fh-border)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 13, width: '55%', borderRadius: 4, background: 'var(--fh-border)', marginBottom: 8 }} />
                  <div style={{ height: 11, width: '35%', borderRadius: 4, background: 'var(--fh-border)' }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
          </div>
        )}

        {/* Interpretation header */}
        {!loading && interpretation && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Sparkles className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
              <span style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 590 }}>{td.searchInterpretedAs}</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--fh-t2)', fontStyle: 'italic', paddingLeft: '20px' }}>
              "{interpretation}"
            </p>
            {hasResults && (
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '6px', paddingLeft: '20px' }}>
                {td.searchFoundPrefix} {enriched.length} {enriched.length !== 1 ? td.searchMatchMany : td.searchMatchOne}
              </p>
            )}
          </div>
        )}

        {/* No results */}
        {!loading && noResults && (
          <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '14px', margin: '0 auto 16px',
              background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search className="h-6 w-6" style={{ color: '#7170ff' }} />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              {td.searchNoTitle}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fh-t3)', marginBottom: '20px' }}>
              {td.searchNoSub}
            </p>
            <Link
              href={type === 'freelancers' ? '/freelancers' : '/orders'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '9px 20px', borderRadius: '8px',
                background: '#5e6ad2', color: '#fff',
                fontSize: '13px', fontWeight: 510, textDecoration: 'none',
              }}
            >
              {td.searchBrowseAll} {type === 'freelancers' ? td.searchBrowseFreelancers : td.searchBrowseOrders} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Results list */}
        {!loading && hasResults && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {enriched.map((item, idx) => (
              <Link
                key={item.id}
                href={item.href}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    animation: `fadeUp 0.4s ${idx * 0.05}s both ease-out`,
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(113,112,255,0.35)'
                    el.style.boxShadow = '0 4px 16px rgba(94,106,210,0.08)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'var(--fh-border)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {/* Rank */}
                  <span style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 590, width: '16px', flexShrink: 0, textAlign: 'center' }}>
                    {idx + 1}
                  </span>

                  {/* Score ring */}
                  <ScoreRing score={item.score} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)',
                      letterSpacing: '-0.01em', marginBottom: '2px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.title}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--fh-t3)', marginBottom: '4px' }}>
                      {item.subtitle}
                    </p>
                    <p style={{
                      fontSize: '12px', color: '#7170ff', fontStyle: 'italic',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Sparkles style={{ width: 10, height: 10, flexShrink: 0 }} />
                      {item.reason}
                    </p>
                  </div>

                  {/* Meta + arrow */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {item.meta && (
                      <span style={{ fontSize: '12px', fontWeight: 590, color: '#27a644' }}>{item.meta}</span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: 'var(--fh-t4)' }} />
                  </div>
                </div>
              </Link>
            ))}

            {/* Browse all link */}
            <div style={{ textAlign: 'center', paddingTop: '12px' }}>
              <Link
                href={type === 'freelancers' ? '/freelancers' : '/orders'}
                style={{ fontSize: '13px', color: 'var(--fh-t4)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                {td.searchBrowseAll} {type === 'freelancers' ? td.searchBrowseFreelancers : td.searchBrowseOrders} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
