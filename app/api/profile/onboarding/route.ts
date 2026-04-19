import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// GET /api/profile/onboarding
// Returns 5-step completion status for the authenticated user.
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = serviceClient() as any

  const [profRow, expCount, featuredCount, servicesCount, reelsCount] = await Promise.all([
    db.from('profiles').select('avatar_url,bio').eq('id', user.id).single(),
    db.from('work_experience').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    db.from('portfolio_items').select('id', { count: 'exact', head: true })
      .eq('freelancer_id', user.id).eq('is_featured', true),
    db.from('services').select('id', { count: 'exact', head: true }).eq('freelancer_id', user.id),
    db.from('reels').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const hasAvatar = !!profRow.data?.avatar_url
  const hasBio = !!(profRow.data?.bio && String(profRow.data.bio).trim().length >= 20)

  const steps = {
    profile: hasAvatar && hasBio,
    experience: (expCount.count ?? 0) > 0,
    featured: (featuredCount.count ?? 0) > 0,
    service: (servicesCount.count ?? 0) > 0,
    reel: (reelsCount.count ?? 0) > 0,
  }

  const done = Object.values(steps).filter(Boolean).length
  const total = Object.keys(steps).length
  const percent = Math.round((done / total) * 100)

  return Response.json({ steps, done, total, percent })
}
