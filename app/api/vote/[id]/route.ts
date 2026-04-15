import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRateLimit, isValidUUID } from '@/lib/security'

// POST /api/vote/[id] — toggle vote on a feature request
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = applyRateLimit(req, 'vote:toggle', { limit: 20, windowMs: 60_000 })
    if (rl) return rl

    const { id } = await params
    if (!isValidUUID(id)) return Response.json({ error: 'Invalid ID' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any

    // Check if already voted
    const { data: existing } = await admin
      .from('feature_votes')
      .select('id')
      .eq('user_id', user.id)
      .eq('request_id', id)
      .maybeSingle()

    if (existing) {
      // Unvote
      await admin.from('feature_votes').delete().eq('id', existing.id)
      return Response.json({ voted: false })
    } else {
      // Vote
      await admin.from('feature_votes').insert({ user_id: user.id, request_id: id })
      return Response.json({ voted: true })
    }
  } catch (e) {
    console.error('[vote toggle]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
