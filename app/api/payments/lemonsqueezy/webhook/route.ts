import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient as createServiceClient } from '@supabase/supabase-js'

// Next.js App Router — must disable body parsing to read raw bytes for HMAC
export const dynamic = 'force-dynamic'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LS_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'utf8'),
      Buffer.from(signature, 'utf8')
    )
  } catch {
    return false
  }
}

const PLAN_DAYS: Record<string, number> = {
  monthly: 30, quarterly: 90, annual: 365,
}

async function activatePremium(db: any, userId: string, plan: string, lsOrderId: string) {
  const days  = PLAN_DAYS[plan] ?? 30
  const until = new Date(Date.now() + days * 86400_000).toISOString()

  await db.from('payments').insert({
    user_id:        userId,
    type:           'premium',
    amount_kzt:     0,
    status:         'paid',
    kaspi_order_id: `ls_${lsOrderId}`,
  }).catch((e: Error) => console.error('[ls/webhook] payment insert:', e.message))

  const { error } = await db
    .from('freelancer_profiles')
    .update({ is_premium: true, premium_until: until })
    .eq('user_id', userId)

  if (error) throw new Error(`activate premium: ${error.message}`)

  await db.from('notifications').insert({
    user_id: userId,
    type:    'order_accepted',
    title:   '🎉 Premium активирован!',
    body:    `Ваш FreelanceHub Premium (${plan}) активен до ${new Date(until).toLocaleDateString('ru')}.`,
    link:    '/dashboard',
  }).catch((e: Error) => console.error('[ls/webhook] notification insert (activate):', e.message))

  console.log(`[ls/webhook] ✅ premium activated user=${userId} plan=${plan} until=${until}`)
}

async function deactivatePremium(db: any, userId: string) {
  await db.from('freelancer_profiles')
    .update({ is_premium: false, premium_until: null })
    .eq('user_id', userId)

  await db.from('notifications').insert({
    user_id: userId,
    type:    'new_response',
    title:   'Premium подписка отменена',
    body:    'Ваш Premium был отменён. Вы перешли на бесплатный план.',
    link:    '/premium',
  }).catch((e: Error) => console.error('[ls/webhook] notification insert (deactivate):', e.message))

  console.log(`[ls/webhook] ℹ️ premium deactivated user=${userId}`)
}

export async function POST(req: NextRequest) {
  // Read raw body BEFORE any parsing — required for HMAC
  const rawBody  = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    console.error('[ls/webhook] ❌ invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const eventName: string  = payload.meta?.event_name ?? ''
  const customData         = payload.meta?.custom_data ?? {}
  const userId: string     = customData.user_id ?? ''
  const plan: string       = customData.plan ?? 'monthly'
  const lsOrderId: string  = String(payload.data?.id ?? '')

  console.log(`[ls/webhook] event=${eventName} user=${userId || '?'} plan=${plan}`)

  if (!userId && eventName !== 'order_refunded') {
    console.warn('[ls/webhook] missing user_id — skipping')
    return NextResponse.json({ ok: true, action: 'skipped_no_user' })
  }

  const db = serviceClient() as any

  try {
    switch (eventName) {
      // ── Successful one-time purchase ──────────────────────────
      case 'order_created': {
        const status: string = payload.data?.attributes?.status ?? ''
        if (status !== 'paid') {
          return NextResponse.json({ ok: true, action: 'not_paid_yet' })
        }
        await activatePremium(db, userId, plan, lsOrderId)
        break
      }

      // ── Subscription activated / renewed ─────────────────────
      case 'subscription_created':
      case 'subscription_resumed':
      case 'subscription_payment_success': {
        await activatePremium(db, userId, plan, lsOrderId)
        break
      }

      // ── Subscription cancelled / expired ─────────────────────
      case 'subscription_cancelled':
      case 'subscription_expired': {
        await deactivatePremium(db, userId)
        break
      }

      default:
        console.log(`[ls/webhook] unhandled event: ${eventName}`)
    }
  } catch (err: any) {
    console.error('[ls/webhook] handler error:', err?.message)
    return NextResponse.json({ error: err?.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, event: eventName })
}
