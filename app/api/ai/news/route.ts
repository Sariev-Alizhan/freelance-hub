import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit } from '@/lib/security'

export const dynamic = 'force-dynamic'
// Revalidate every 30 minutes across all sources
export const revalidate = 1800

export interface NewsItem {
  id:           string
  title:        string
  url:          string | null
  author:       string
  points:       number
  num_comments: number
  created_at:   string
  source:       'hn' | 'reddit_ai' | 'reddit_ml' | 'reddit_llama'
  source_label: string
  hn_url:       string
}

// ── HackerNews Algolia ────────────────────────────────────────────────────────
const HN_URL = 'https://hn.algolia.com/api/v1/search?query=artificial+intelligence+LLM+GPT+Claude+AI+agent&tags=story&numericFilters=points>=10&hitsPerPage=40'

async function fetchHN(): Promise<NewsItem[]> {
  const res = await fetch(HN_URL, {
    next: { revalidate: 1800 },
    headers: { 'User-Agent': 'FreelanceHub/1.1' },
  })
  if (!res.ok) throw new Error('HN API error')
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data.hits || []) as any[])
    .filter((h: { title?: string; points?: number }) => h.title && (h.points ?? 0) >= 10)
    .slice(0, 30)
    .map((h: {
      objectID: string; title: string; url?: string; author?: string;
      points?: number; num_comments?: number; created_at?: string;
    }) => ({
      id:           `hn-${h.objectID}`,
      title:        h.title,
      url:          h.url || null,
      author:       h.author || 'unknown',
      points:       h.points || 0,
      num_comments: h.num_comments || 0,
      created_at:   h.created_at || new Date().toISOString(),
      source:       'hn' as const,
      source_label: 'Hacker News',
      hn_url:       `https://news.ycombinator.com/item?id=${h.objectID}`,
    }))
}

// ── Reddit AI subreddits ──────────────────────────────────────────────────────
type RedditSource = 'reddit_ai' | 'reddit_ml' | 'reddit_llama'
const REDDIT_SOURCES: Array<{ id: RedditSource; sub: string; label: string; limit: number }> = [
  { id: 'reddit_ai',    sub: 'artificial',      label: 'r/artificial',    limit: 20 },
  { id: 'reddit_ml',    sub: 'MachineLearning', label: 'r/ML',            limit: 15 },
  { id: 'reddit_llama', sub: 'LocalLLaMA',      label: 'r/LocalLLaMA',   limit: 15 },
]

async function fetchReddit(source: typeof REDDIT_SOURCES[number]): Promise<NewsItem[]> {
  const url = `https://www.reddit.com/r/${source.sub}/hot.json?limit=${source.limit}&t=day`
  const res = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      'User-Agent': 'FreelanceHub/1.1 (news aggregator; contact raimzhan1907@gmail.com)',
      Accept: 'application/json',
    },
  })
  if (!res.ok) throw new Error(`Reddit ${source.sub} error ${res.status}`)
  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = (data?.data?.children || []) as any[]

  return posts
    .filter((p: { data?: { stickied?: boolean; score?: number; title?: string } }) => {
      const d = p?.data
      return d && !d.stickied && (d.score ?? 0) >= 5 && d.title
    })
    .slice(0, source.limit)
    .map((p: {
      data: {
        id: string; title: string; url?: string; author?: string; permalink?: string;
        score?: number; num_comments?: number; created_utc?: number; is_self?: boolean;
      }
    }) => {
      const d = p.data
      const postUrl = d.is_self
        ? `https://reddit.com${d.permalink}`
        : (d.url || `https://reddit.com${d.permalink}`)
      return {
        id:           `${source.id}-${d.id}`,
        title:        d.title,
        url:          postUrl,
        author:       d.author || 'unknown',
        points:       d.score || 0,
        num_comments: d.num_comments || 0,
        created_at:   d.created_utc ? new Date(d.created_utc * 1000).toISOString() : new Date().toISOString(),
        source:       source.id,
        source_label: source.label,
        hn_url:       `https://reddit.com${d.permalink}`,
      }
    })
}

// ── Merge and de-duplicate ────────────────────────────────────────────────────
function mergeAndSort(groups: NewsItem[][]): NewsItem[] {
  const seen = new Set<string>()
  const all: NewsItem[] = []
  for (const group of groups) {
    for (const item of group) {
      // Deduplicate by URL (strip query params + trailing slash)
      const key = item.url
        ? item.url.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase()
        : item.id
      if (seen.has(key)) continue
      seen.add(key)
      all.push(item)
    }
  }
  // Sort: newest first, then by points as tiebreaker
  return all.sort((a, b) => {
    const ta = new Date(a.created_at).getTime()
    const tb = new Date(b.created_at).getTime()
    if (Math.abs(ta - tb) > 86400_000) return tb - ta // >1 day apart: by date
    return b.points - a.points                         // same day: by points
  })
}

// ── Fallback ──────────────────────────────────────────────────────────────────
const FALLBACK: NewsItem[] = [
  { id: 'f1', title: 'Claude 4 — Anthropic\'s Most Capable Model', url: 'https://anthropic.com', author: 'anthropic', points: 1200, num_comments: 340, created_at: new Date().toISOString(), source: 'hn', source_label: 'Hacker News', hn_url: 'https://news.ycombinator.com' },
  { id: 'f2', title: 'AI Agents Are Transforming Freelance Work in 2026', url: null, author: 'ai_researcher', points: 450, num_comments: 120, created_at: new Date().toISOString(), source: 'reddit_ai', source_label: 'r/artificial', hn_url: 'https://reddit.com/r/artificial' },
  { id: 'f3', title: 'OpenAI o4 sets new benchmark on reasoning tasks', url: null, author: 'ml_news', points: 890, num_comments: 210, created_at: new Date().toISOString(), source: 'reddit_ml', source_label: 'r/ML', hn_url: 'https://reddit.com/r/MachineLearning' },
  { id: 'f4', title: 'Local LLMs now run GPT-4 class tasks on consumer hardware', url: null, author: 'llama_fan', points: 650, num_comments: 180, created_at: new Date().toISOString(), source: 'reddit_llama', source_label: 'r/LocalLLaMA', hn_url: 'https://reddit.com/r/LocalLLaMA' },
]

// ── Handler ───────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const rl = applyRateLimit(req, 'news', { limit: 20, windowMs: 60_000 })
  if (rl) return rl

  try {
    // Fetch all sources in parallel; individual failures are non-fatal
    const results = await Promise.allSettled([
      fetchHN(),
      ...REDDIT_SOURCES.map(s => fetchReddit(s)),
    ])

    const groups: NewsItem[][] = []
    for (const r of results) {
      if (r.status === 'fulfilled') groups.push(r.value)
    }

    if (groups.length === 0) {
      return NextResponse.json({ items: FALLBACK, cached_at: new Date().toISOString(), fallback: true })
    }

    const items = mergeAndSort(groups).slice(0, 80)
    return NextResponse.json({ items, cached_at: new Date().toISOString(), sources: groups.length })
  } catch {
    return NextResponse.json({ items: FALLBACK, cached_at: new Date().toISOString(), fallback: true })
  }
}
