import { createClient } from '@/lib/supabase/server'

// GET /api/endorsements?user_id=...  → counts per skill + which the current viewer endorsed
// POST /api/endorsements { user_id, skill }   → +1 (idempotent — PK constraint)
// DELETE /api/endorsements { user_id, skill } → remove my endorsement

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('user_id')
  if (!userId) return Response.json({ ok: false, error: 'user_id required' }, { status: 400 })

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  // All endorsements for this user
  const { data: rows, error } = await db
    .from('skill_endorsements')
    .select('skill, endorser_id')
    .eq('user_id', userId)

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  const counts: Record<string, number> = {}
  const mine: Record<string, boolean> = {}
  for (const r of rows ?? []) {
    counts[r.skill] = (counts[r.skill] ?? 0) + 1
    if (user && r.endorser_id === user.id) mine[r.skill] = true
  }

  return Response.json({ ok: true, counts, mine })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const userId = typeof body?.user_id === 'string' ? body.user_id : null
  const skill  = typeof body?.skill   === 'string' ? body.skill.trim() : null
  if (!userId || !skill)   return Response.json({ ok: false, error: 'user_id+skill required' }, { status: 400 })
  if (userId === user.id)  return Response.json({ ok: false, error: 'cannot endorse yourself' }, { status: 400 })
  if (skill.length > 64)   return Response.json({ ok: false, error: 'skill too long' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('skill_endorsements')
    .upsert({ endorser_id: user.id, user_id: userId, skill }, { onConflict: 'endorser_id,user_id,skill' })
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const userId = typeof body?.user_id === 'string' ? body.user_id : null
  const skill  = typeof body?.skill   === 'string' ? body.skill.trim() : null
  if (!userId || !skill) return Response.json({ ok: false, error: 'user_id+skill required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('skill_endorsements')
    .delete()
    .eq('endorser_id', user.id)
    .eq('user_id', userId)
    .eq('skill', skill)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
