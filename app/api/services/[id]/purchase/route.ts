// POST /api/services/[id]/purchase
// Buy a specific tier of a service. Creates an order with the freelancer
// already selected (via a pre-accepted response), so there's no back-and-forth.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { applyRateLimit } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rl = applyRateLimit(req, 'services:purchase', { limit: 10, windowMs: 60 * 60_000 })
  if (rl) return rl

  const { id: serviceId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { tier?: 'basic' | 'standard' | 'premium' }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!body.tier || !['basic','standard','premium'].includes(body.tier)) {
    return NextResponse.json({ error: 'tier required' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: service } = await db
    .from('services')
    .select(`
      id, freelancer_id, title, description, category, is_active, skills,
      tiers:service_tiers(id, tier, title, price, delivery_days, revisions)
    `)
    .eq('id', serviceId)
    .maybeSingle()

  if (!service || !service.is_active) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 404 })
  }
  if (service.freelancer_id === user.id) {
    return NextResponse.json({ error: "Can't buy your own service" }, { status: 400 })
  }

  interface Tier { id: string; tier: string; title: string; price: number; delivery_days: number; revisions: number }
  const tier = (service.tiers as Tier[]).find(t => t.tier === body.tier)
  if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })

  // Freemium gate mirrors /api/orders: free clients = 2 orders/month.
  const { data: clientProfile } = await db
    .from('freelancer_profiles')
    .select('is_premium, premium_until')
    .eq('user_id', user.id)
    .maybeSingle()
  const isPremiumClient = clientProfile?.is_premium &&
    (!clientProfile.premium_until || new Date(clientProfile.premium_until) > new Date())

  if (!isPremiumClient) {
    const { data: orderCount } = await db.rpc('orders_this_month', { uid: user.id })
    if ((orderCount ?? 0) >= 2) {
      return NextResponse.json(
        { error: 'Достигнут лимит заказов (2 в месяц). Перейдите на Premium.' },
        { status: 429 },
      )
    }
  }

  const a = admin()
  const title = `${tier.title} — ${service.title}`.slice(0, 200)
  const deadline = `${tier.delivery_days} day${tier.delivery_days === 1 ? '' : 's'}`
  const revisionsLabel = tier.revisions === -1 ? 'unlimited' : String(tier.revisions)
  const description = [
    service.description,
    '',
    `— Package: ${tier.title}`,
    `— Delivery: ${tier.delivery_days} days`,
    `— Revisions: ${revisionsLabel}`,
  ].join('\n')

  const { data: order, error: orderErr } = await a.from('orders').insert({
    client_id:       user.id,
    title,
    description,
    category:        service.category,
    budget_min:      tier.price,
    budget_max:      tier.price,
    budget_type:     'fixed',
    deadline,
    skills:          service.skills ?? [],
    is_urgent:       false,
    status:          'in_progress',          // skip the "open" browse phase
    service_id:      service.id,
    service_tier_id: tier.id,
  }).select('id').single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // Pre-accept the freelancer — instant match, no bidding step.
  await a.from('responses').insert({
    order_id:      order.id,
    freelancer_id: service.freelancer_id,
    message:       `Service package auto-accepted: ${tier.title}`,
    price:         tier.price,
    status:        'accepted',
  })

  // Bump purchase counter (best-effort; slight race on concurrent buys is OK)
  const { data: fresh } = await a.from('services')
    .select('purchases_count').eq('id', service.id).maybeSingle<{ purchases_count: number }>()
  await a.from('services')
    .update({ purchases_count: (fresh?.purchases_count ?? 0) + 1 })
    .eq('id', service.id)

  return NextResponse.json({ order_id: order.id }, { status: 201 })
}
