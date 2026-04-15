/**
 * POST /api/payments/lemonsqueezy/test
 * Симулирует успешный LemonSqueezy webhook для тестирования Premium активации.
 * Только для разработки — защищён ADMIN_WEBHOOK_SECRET.
 *
 * Body: { secret: string, userId: string, plan?: 'monthly'|'quarterly'|'annual' }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

const PLAN_DAYS: Record<string, number> = {
  monthly: 30, quarterly: 90, annual: 365,
}

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_WEBHOOK_SECRET
  if (!adminSecret) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 })
  }

  const body = await req.json()

  if (body.secret !== adminSecret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, plan = 'monthly' } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const db = serviceClient() as any
  const days  = PLAN_DAYS[plan] ?? 30
  const until = new Date(Date.now() + days * 86400_000).toISOString()

  await db.from('payments').insert({
    user_id:        userId,
    type:           'premium',
    amount_kzt:     0,
    status:         'simulated',
    kaspi_order_id: `ls_test_${Date.now()}`,
  })

  const { error } = await db
    .from('freelancer_profiles')
    .update({ is_premium: true, premium_until: until })
    .eq('user_id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await db.from('notifications').insert({
    user_id: userId,
    type:    'order_accepted',
    title:   '🎉 Premium активирован (тест)',
    body:    `Тестовая активация. Premium до ${new Date(until).toLocaleDateString('ru')}.`,
    link:    '/dashboard',
  }).catch(() => {})

  return NextResponse.json({ ok: true, plan, until, userId })
}
