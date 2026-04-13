import { createClient as createServiceClient } from '@supabase/supabase-js'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// POST /api/payments/kaspi-webhook
// Production: receives Kaspi Pay payment notification.
// Dev/staging: accepts { simulate: true, userId, type } to manually activate.
export async function POST(request: Request) {
  const body = await request.json()
  const db = serviceClient() as any

  // ── Simulation mode (admin only, no real Kaspi signature) ──────────────────
  if (body.simulate === true) {
    const adminSecret = process.env.ADMIN_WEBHOOK_SECRET
    if (!adminSecret || body.secret !== adminSecret) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, type } = body
    if (!userId || !['premium', 'verification', 'promotion'].includes(type)) {
      return Response.json({ error: 'Invalid params' }, { status: 400 })
    }

    await activateProduct(db, userId, type, 0, 'simulated')
    return Response.json({ ok: true, mode: 'simulated' })
  }

  // ── Real Kaspi Pay webhook ─────────────────────────────────────────────────
  // TODO: verify Kaspi HMAC signature from X-Kaspi-Signature header
  // const sig = request.headers.get('X-Kaspi-Signature')
  // if (!verifyKaspiSignature(sig, body, process.env.KASPI_SECRET!)) {
  //   return Response.json({ error: 'Invalid signature' }, { status: 401 })
  // }

  const { orderId, userId, type, amount, status: kaspiStatus } = body

  if (kaspiStatus !== 'PAID') {
    return Response.json({ ok: true, action: 'none' })
  }

  await activateProduct(db, userId, type, amount, 'paid', orderId)
  return Response.json({ ok: true, mode: 'kaspi' })
}

async function activateProduct(
  db: any,
  userId: string,
  type: string,
  amount: number,
  status: string,
  kaspiOrderId?: string,
) {
  // Record payment
  await db.from('payments').insert({
    user_id: userId,
    type,
    amount_kzt: amount,
    status,
    kaspi_order_id: kaspiOrderId ?? null,
  })

  if (type === 'premium') {
    // Grant 30-day premium
    const until = new Date(Date.now() + 30 * 86400_000).toISOString()
    await db.from('freelancer_profiles')
      .update({ is_premium: true, premium_until: until })
      .eq('user_id', userId)
  }

  if (type === 'verification') {
    await db.from('freelancer_profiles')
      .update({ is_verified: true, verification_requested: false, verification_requested_at: null })
      .eq('user_id', userId)
  }

  if (type === 'promotion') {
    // Grant 7-day promotion (isPromoted stored in freelancer_profiles or orders — extend as needed)
    // Placeholder: set a promoted_until field if added later
  }
}
