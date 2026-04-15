import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

// POST /api/referrals/claim
// Called after new user registers — reads ref cookie, links referral
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const cookieStore = await cookies()
    const refCode = cookieStore.get('ref')?.value
    if (!refCode) return Response.json({ skipped: true })

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any

    // Find referrer by username or referral_code
    const { data: referrer } = await db
      .from('profiles')
      .select('id')
      .or(`username.eq.${refCode},referral_code.eq.${refCode}`)
      .single()

    if (!referrer || referrer.id === user.id) {
      return Response.json({ skipped: true })
    }

    // Don't double-register
    const { data: existing } = await db
      .from('referrals')
      .select('id')
      .eq('referred_id', user.id)
      .maybeSingle()

    if (existing) return Response.json({ skipped: true })

    // Create referral record
    await db.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: user.id,
      status: 'pending',
    })

    // Notify referrer
    await db.from('notifications').insert({
      user_id: referrer.id,
      type: 'referral',
      title: 'New referral!',
      body: 'Someone registered using your referral link.',
      link: '/dashboard',
    })

    return Response.json({ success: true })
  } catch (e) {
    console.error('[referrals/claim]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

// GET /api/referrals/claim — return stats for current user
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = admin as any

    const { data: refs } = await db
      .from('referrals')
      .select('id, status, created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false })

    return Response.json({
      total: refs?.length ?? 0,
      rewarded: refs?.filter((r: { status: string }) => r.status === 'rewarded').length ?? 0,
      pending: refs?.filter((r: { status: string }) => r.status === 'pending').length ?? 0,
    })
  } catch (e) {
    console.error('[referrals/stats]', e)
    return Response.json({ total: 0, rewarded: 0, pending: 0 })
  }
}
