import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

/**
 * POST /api/ai/smart-search/enrich
 * Body: { ids: string[], type: 'freelancers' | 'orders' }
 * Returns: { items: Record<string, { title, subtitle, meta }> }
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`ai:enrich:${user.id}`, 60, 60_000)
  if (!rl.success) {
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  const { ids, type } = await request.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ items: {} })
  }
  // Cap fan-out so a malicious client can't pump huge id lists into Supabase.
  const capped = ids.slice(0, 100).filter((x: unknown) => typeof x === 'string')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  if (type === 'freelancers') {
    const { data } = await db
      .from('freelancer_profiles')
      .select('user_id, title, category, price_from, price_to, level, rating, profiles!inner(full_name, location)')
      .in('user_id', capped)

    const items: Record<string, { title: string; subtitle: string; meta?: string }> = {}
    for (const fp of data ?? []) {
      const name     = fp.profiles?.full_name || 'Freelancer'
      const loc      = fp.profiles?.location  || ''
      const price    = fp.price_to
        ? `$${fp.price_from}–$${fp.price_to}`
        : fp.price_from ? `from $${fp.price_from}` : ''
      const subtitle = [fp.title, fp.category, loc].filter(Boolean).join(' · ')

      items[fp.user_id] = {
        title:    name,
        subtitle: subtitle || fp.title || '',
        meta:     price || undefined,
      }
    }
    return Response.json({ items })
  }

  // orders
  const { data } = await db
    .from('orders')
    .select('id, title, category, budget_min, budget_max, deadline, status')
    .in('id', capped)

  const items: Record<string, { title: string; subtitle: string; meta?: string }> = {}
  for (const o of data ?? []) {
    const budget = o.budget_max
      ? `$${o.budget_min}–$${o.budget_max}`
      : o.budget_min ? `from $${o.budget_min}` : 'Negotiable'

    items[o.id] = {
      title:    o.title,
      subtitle: [o.category, o.deadline].filter(Boolean).join(' · '),
      meta:     budget,
    }
  }
  return Response.json({ items })
}
