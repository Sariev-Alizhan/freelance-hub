import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/** Timing-safe string equality to prevent timing attacks */
function safeEqual(a: string, b: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

/**
 * Verify Kaspi HMAC-SHA256 signature.
 * Kaspi sends: X-Kaspi-Signature: hex(HMAC-SHA256(rawBody, KASPI_WEBHOOK_SECRET))
 */
function verifyKaspiSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.KASPI_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const digest = crypto.createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  return safeEqual(digest, signature)
}

// POST /api/payments/kaspi-webhook
// Production: receives Kaspi Pay payment notification (HMAC-signed).
// Dev/staging: accepts { simulate: true, userId, type } with ADMIN_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const rawBody = await request.text()
  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return Response.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const db = serviceClient() as any

  // ── Simulation mode (server-side admin only) ───────────────────────────────
  if (body.simulate === true) {
    const adminSecret = process.env.ADMIN_WEBHOOK_SECRET
    if (!adminSecret || typeof body.secret !== 'string' || !safeEqual(body.secret, adminSecret)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, type } = body
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (
      typeof userId !== 'string' || !UUID_RE.test(userId) ||
      !['premium', 'verification', 'promotion'].includes(type as string)
    ) {
      return Response.json({ error: 'Invalid params' }, { status: 400 })
    }

    await activateProduct(db, userId, type as string, 0, 'simulated')
    return Response.json({ ok: true, mode: 'simulated' })
  }

  // ── Real Kaspi Pay webhook — requires valid HMAC signature ─────────────────
  const sig = request.headers.get('X-Kaspi-Signature') ?? ''
  if (!verifyKaspiSignature(rawBody, sig)) {
    console.error('[kaspi-webhook] invalid or missing HMAC signature — rejecting')
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, userId, type, amount, status: kaspiStatus } = body as Record<string, unknown>

  if (typeof userId !== 'string' || !userId) {
    return Response.json({ error: 'Missing userId' }, { status: 400 })
  }
  if (!['premium', 'verification', 'promotion'].includes(type as string)) {
    return Response.json({ error: 'Invalid type' }, { status: 400 })
  }

  if (kaspiStatus !== 'PAID') {
    return Response.json({ ok: true, action: 'none' })
  }

  // ── Idempotency check: reject duplicate webhook for same order ─────────────
  if (orderId && typeof orderId === 'string') {
    const { data: existing } = await db
      .from('payments')
      .select('id')
      .eq('kaspi_order_id', orderId)
      .maybeSingle()
    if (existing) {
      console.warn(`[kaspi-webhook] duplicate orderId ${orderId} — ignoring`)
      return Response.json({ ok: true, action: 'duplicate_ignored' })
    }
  }

  await activateProduct(db, userId, type as string, Number(amount) || 0, 'paid', orderId as string | undefined)
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
