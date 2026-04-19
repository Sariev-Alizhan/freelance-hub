import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRateLimit } from '@/lib/security'

const ALLOWED_PLANS = new Set(['monthly', 'yearly', 'lifetime'])

/**
 * POST /api/premium/waitlist
 * Records the user's upgrade intent (plan, timestamp).
 * When payments are enabled, this will be replaced by Kaspi Pay / Stripe checkout.
 */
export async function POST(request: Request) {
  const rl = applyRateLimit(request, 'premium:waitlist', { limit: 5, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json()
  const safePlan = typeof plan === 'string' && ALLOWED_PLANS.has(plan) ? plan : 'monthly'

  try {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any

    // Upsert into premium_waitlist (table created below)
    await db.from('premium_waitlist').upsert({
      user_id:    user.id,
      plan:       safePlan,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Also insert an in-app notification confirming receipt
    await db.from('notifications').insert({
      user_id: user.id,
      type:    'order_completed',
      title:   'Premium upgrade request received',
      body:    'We\'ll reach out within 24 hours to complete your upgrade. Thank you!',
      link:    '/premium',
    }).catch((e: Error) => console.error('[premium/waitlist] notification insert:', e.message))
  } catch (e) {
    console.error('[premium/waitlist]', e)
  }

  return Response.json({ ok: true })
}
