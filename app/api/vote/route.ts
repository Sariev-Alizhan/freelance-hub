import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRateLimit, sanitize } from '@/lib/security'

// GET /api/vote — list all feature requests with user's vote state
export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any

    const { data: requests } = await admin
      .from('feature_requests')
      .select('id, title, description, category, votes_count, status, admin_note, created_at')
      .order('votes_count', { ascending: false })

    // Check if user is logged in — get their votes
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let userVotes: string[] = []
    if (user) {
      const { data: votes } = await admin
        .from('feature_votes')
        .select('request_id')
        .eq('user_id', user.id)
      userVotes = (votes ?? []).map((v: { request_id: string }) => v.request_id)
    }

    return Response.json({
      requests: (requests ?? []).map((r: any) => ({
        ...r,
        hasVoted: userVotes.includes(r.id),
      })),
      isLoggedIn: !!user,
    })
  } catch (e) {
    console.error('[vote GET]', e)
    return Response.json({ requests: [], isLoggedIn: false })
  }
}

// POST /api/vote — submit a new feature request
export async function POST(req: Request) {
  try {
    const rl = applyRateLimit(req, 'vote:post', { limit: 5, windowMs: 60_000 })
    if (rl) return rl

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const title       = sanitize(body?.title, 200)
    const description = sanitize(body?.description, 1000)
    const category    = sanitize(body?.category, 50)
    if (!title) return Response.json({ error: 'Title required' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data, error } = await admin
      .from('feature_requests')
      .insert({ user_id: user.id, title, description: description || null, category: category || 'general' })
      .select('id')
      .single()

    if (error) throw error
    return Response.json({ success: true, id: data.id })
  } catch (e) {
    console.error('[vote POST]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
