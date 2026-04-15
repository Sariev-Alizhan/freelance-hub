import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || !user || user.email !== adminEmail) {
    console.warn(`[admin] unauthorized attempt by ${user?.email ?? 'unauthenticated'}`)
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action, userId } = await request.json()
  if (!userId || !action) return Response.json({ error: 'Missing params' }, { status: 400 })

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

  return Response.json({ ok: true })
}
