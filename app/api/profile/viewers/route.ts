// Recent viewers of the authenticated user's profile.
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface ViewRow { viewer_id: string | null; created_at: string }
interface ProfileRow {
  id: string; username: string | null; full_name: string | null
  avatar_url: string | null
}
interface FpRow { user_id: string; title: string | null }

// GET /api/profile/viewers?days=30&limit=10
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const days = Math.min(parseInt(url.searchParams.get('days') ?? '30'), 90)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '10'), 25)
  const since = new Date(Date.now() - days * 86400_000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = serviceClient() as any

  // Pull rows within window, ordered newest first, then dedupe by viewer_id
  const { data: rows } = await db
    .from('profile_views')
    .select('viewer_id, created_at')
    .eq('freelancer_id', user.id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(500)

  const views = (rows ?? []) as ViewRow[]

  const seen = new Set<string>()
  const unique: { viewer_id: string; last_viewed_at: string }[] = []
  let anonCount = 0
  for (const v of views) {
    if (!v.viewer_id) { anonCount += 1; continue }
    if (seen.has(v.viewer_id)) continue
    seen.add(v.viewer_id)
    unique.push({ viewer_id: v.viewer_id, last_viewed_at: v.created_at })
    if (unique.length >= limit) break
  }

  let viewers: Array<{
    user_id: string
    username: string | null
    full_name: string | null
    avatar_url: string | null
    title: string | null
    last_viewed_at: string
  }> = []

  if (unique.length) {
    const ids = unique.map(u => u.viewer_id)
    const [profRes, fpRes] = await Promise.all([
      db.from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', ids),
      db.from('freelancer_profiles')
        .select('user_id, title')
        .in('user_id', ids),
    ])

    const pMap = Object.fromEntries(
      ((profRes.data ?? []) as ProfileRow[]).map(p => [p.id, p])
    )
    const fpMap = Object.fromEntries(
      ((fpRes.data ?? []) as FpRow[]).map(f => [f.user_id, f])
    )

    viewers = unique.map(u => ({
      user_id: u.viewer_id,
      username: pMap[u.viewer_id]?.username ?? null,
      full_name: pMap[u.viewer_id]?.full_name ?? null,
      avatar_url: pMap[u.viewer_id]?.avatar_url ?? null,
      title: fpMap[u.viewer_id]?.title ?? null,
      last_viewed_at: u.last_viewed_at,
    }))
  }

  return Response.json({
    viewers,
    total: views.length,
    anonymous: anonCount,
    days,
  })
}
