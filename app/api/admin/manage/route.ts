import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { applyRateLimit, isValidUUID, logSecurityEvent } from '@/lib/security'
import { isAdmin } from '@/lib/auth/isAdmin'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// POST /api/admin/manage
// Body: { action: 'verify' | 'unverify' | 'grant_premium' | 'revoke_premium', userId: string }
export async function POST(request: Request) {
  const rl = applyRateLimit(request, 'admin:manage', { limit: 60, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!isAdmin(user)) {
    logSecurityEvent('unauthorized', { route: '/api/admin/manage', email: user?.email ?? 'anon' }, request)
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { action, paymentId } = body
  const userId = body?.userId
  if (!userId || !action) return Response.json({ error: 'Missing params' }, { status: 400 })
  if (!isValidUUID(userId)) return Response.json({ error: 'Invalid userId' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = serviceClient() as any

  if (action === 'verify') {
    await db.from('freelancer_profiles')
      .update({ is_verified: true, verification_requested: false, verification_requested_at: null })
      .eq('user_id', userId)
    // Record simulated payment
    await db.from('payments').insert({ user_id: userId, type: 'verification', amount_kzt: 5000, status: 'simulated' })
  }

  if (action === 'unverify') {
    await db.from('freelancer_profiles')
      .update({ is_verified: false })
      .eq('user_id', userId)
  }

  if (action === 'grant_premium') {
    const until = new Date(Date.now() + 30 * 86400_000).toISOString()
    await db.from('freelancer_profiles')
      .update({ is_premium: true, premium_until: until })
      .eq('user_id', userId)
    await db.from('payments').insert({ user_id: userId, type: 'premium', amount_kzt: 2000, status: 'simulated' })
  }

  if (action === 'revoke_premium') {
    await db.from('freelancer_profiles')
      .update({ is_premium: false, premium_until: null })
      .eq('user_id', userId)
  }

  if (action === 'reject_verification') {
    await db.from('freelancer_profiles')
      .update({ verification_requested: false, verification_requested_at: null })
      .eq('user_id', userId)
  }

  if (action === 'approve_payment') {
    if (!paymentId) return Response.json({ error: 'Missing paymentId' }, { status: 400 })

    // Get plan from the payment record
    const { data: payment } = await db
      .from('payments')
      .select('kaspi_order_id')
      .eq('id', paymentId)
      .single()

    const plan = String(payment?.kaspi_order_id ?? '').replace('card_', '')
    const days = plan === 'quarterly' ? 90 : plan === 'annual' ? 365 : 30
    const until = new Date(Date.now() + days * 86400_000).toISOString()

    await db.from('freelancer_profiles')
      .update({ is_premium: true, premium_until: until })
      .eq('user_id', userId)

    await db.from('payments')
      .update({ status: 'paid' })
      .eq('id', paymentId)

    await db.from('notifications').insert({
      user_id: userId,
      type:    'order_accepted',
      title:   'Premium активирован!',
      body:    `Ваш платёж подтверждён. FreelanceHub Premium активен до ${new Date(until).toLocaleDateString('ru')}.`,
      link:    '/dashboard',
    }).catch((e: Error) => console.error('[admin/approve_payment] notify:', e.message))
  }

  if (action === 'reject_payment') {
    if (!paymentId) return Response.json({ error: 'Missing paymentId' }, { status: 400 })
    await db.from('payments')
      .update({ status: 'rejected' })
      .eq('id', paymentId)
    await db.from('notifications').insert({
      user_id: userId,
      type:    'new_response',
      title:   'Платёж не подтверждён',
      body:    'Ваш чек не прошёл проверку. Напишите в поддержку или отправьте новый чек.',
      link:    '/premium',
    }).catch((e: Error) => console.error('[admin/reject_payment] notify:', e.message))
  }

  return Response.json({ ok: true })
}
