import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// GET /api/profile/analytics
// Returns profile view stats + response count for the authenticated freelancer.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const db = serviceClient() as any

  const now = new Date()
  const day7  = new Date(now.getTime() - 7  * 86400_000).toISOString()
  const day30 = new Date(now.getTime() - 30 * 86400_000).toISOString()

  const [views7, views30, viewsByDay, responsesMonth, fpRow] = await Promise.all([
    // Views last 7 days
    db.from('profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id)
      .gte('created_at', day7),

    // Views last 30 days
    db.from('profile_views')
      .select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id)
      .gte('created_at', day30),

    // Views per day (last 14 days) via RPC
    db.rpc('views_per_day', { fid: user.id, days_back: 14 }),

    // Responses this month
    db.rpc('responses_this_month', { uid: user.id }),

    // is_premium + premium_until
    db.from('freelancer_profiles')
      .select('is_premium,premium_until,is_verified,verification_requested')
      .eq('user_id', user.id)
      .single(),
  ])

  const isPremium = fpRow.data?.is_premium ?? false
  const premiumUntil: string | null = fpRow.data?.premium_until ?? null
  // Auto-expire: treat as not premium if past due
  const activePremium = isPremium && (premiumUntil === null || new Date(premiumUntil) > now)

  return Response.json({
    views7:  views7.count  ?? 0,
    views30: views30.count ?? 0,
    viewsByDay: viewsByDay.data ?? [],
    responsesThisMonth: responsesMonth.data ?? 0,
    responseLimit: activePremium ? null : 5,   // null = unlimited
    isPremium: activePremium,
    premiumUntil,
    isVerified: fpRow.data?.is_verified ?? false,
    verificationRequested: fpRow.data?.verification_requested ?? false,
  })
}
