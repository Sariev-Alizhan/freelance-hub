import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

const SYSTEM = `You are an AI job-matching engine for FreelanceHub platform.
Given a freelancer's profile and a list of open orders, rank the orders by relevance.

Respond STRICTLY in JSON without markdown:
{
  "matches": [
    {
      "id": "order-uuid",
      "score": 92,
      "reason": "Exact match: React + Node.js skills",
      "highlight": "Senior-level budget matches your rate"
    }
  ]
}

Rules:
- score 0–100, include only score >= 40
- Return at most 5 best matches, sorted descending by score
- reason: concise (≤8 words), specific to skill/category overlap
- highlight: one additional selling point (budget fit, timeline, category match)
- If nothing fits — matches: []`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`ai:job-match:${user.id}`, 10, 60_000)
  if (!rl.success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Load freelancer profile ───────────────────────────────
  const { data: fp } = await db
    .from('freelancer_profiles')
    .select('title, category, skills, level, price_from, price_to, rating, profiles!inner(bio)')
    .eq('user_id', user.id)
    .single()

  if (!fp) {
    return Response.json({ error: 'Complete your freelancer profile first' }, { status: 400 })
  }

  // ── Load open orders (excluding own) ─────────────────────
  const { data: orders } = await db
    .from('orders')
    .select('id, title, description, category, skills, budget_min, budget_max, deadline, is_urgent')
    .eq('status', 'open')
    .neq('client_id', user.id)
    .order('created_at', { ascending: false })
    .limit(60)

  if (!orders || orders.length === 0) {
    return Response.json({ matches: [] })
  }

  const profileSummary = [
    `Title: ${fp.title}`,
    `Category: ${fp.category}`,
    `Skills: ${(fp.skills ?? []).join(', ')}`,
    `Level: ${fp.level}`,
    `Rate: ${fp.price_from}–${fp.price_to ?? '?'} ₸/hr`,
    fp.profiles?.bio ? `Bio: ${String(fp.profiles.bio).slice(0, 200)}` : '',
  ].filter(Boolean).join('\n')

  const orderList = orders.map((o: {
    id: string; title: string; description: string; category: string
    skills: string[]; budget_min: number; budget_max: number; deadline: string; is_urgent: boolean
  }) =>
    `[${o.id}] ${o.title} | ${o.category} | Skills: ${(o.skills ?? []).join(', ')} | Budget: ${o.budget_min}–${o.budget_max} ₸ | Deadline: ${o.deadline}${o.is_urgent ? ' | URGENT' : ''}`
  ).join('\n')

  const prompt = `Freelancer profile:\n${profileSummary}\n\nOpen orders:\n${orderList}`

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-haiku-4-5-20251001',
      maxOutputTokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const json = JSON.parse(text.trim())
    const matchIds: string[] = (json.matches ?? []).map((m: { id: string }) => m.id)

    // Enrich with full order data
    const orderMap = new Map(orders.map((o: { id: string }) => [o.id, o]))
    const enriched = (json.matches ?? [])
      .map((m: { id: string; score: number; reason: string; highlight: string }) => {
        const order = orderMap.get(m.id)
        if (!order) return null
        return { ...m, order }
      })
      .filter(Boolean)

    return Response.json({ matches: enriched, count: matchIds.length })
  } catch {
    return Response.json({ matches: [] })
  }
}
