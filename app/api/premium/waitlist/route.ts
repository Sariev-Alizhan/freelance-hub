import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/premium/waitlist
 * Records the user's upgrade intent (plan, timestamp).
 * When payments are enabled, this will be replaced by Kaspi Pay / Stripe checkout.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json()

  try {
    const admin = createAdminClient()
    const db = admin as any

    // Upsert into premium_waitlist (table created below)
    await db.from('premium_waitlist').upsert({
      user_id:    user.id,
      plan:       plan ?? 'monthly',
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
