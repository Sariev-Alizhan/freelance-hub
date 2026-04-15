import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRateLimit, sanitize, sanitizeText, isValidUUID } from '@/lib/security'

// GET — list current user's work experience
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data } = await admin
    .from('work_experience')
    .select('*')
    .eq('user_id', user.id)
    .order('start_date', { ascending: false })

  return Response.json({ experience: data ?? [] })
}

// POST — add a work experience entry
export async function POST(req: Request) {
  const rl = applyRateLimit(req, 'profile:experience', { limit: 20, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const company     = sanitize(body?.company, 100)
  const position    = sanitize(body?.position, 100)
  const description = sanitizeText(body?.description, 1000)
  const start_date  = sanitize(body?.start_date, 20)
  const end_date    = body?.end_date ? sanitize(body.end_date, 20) : null
  const is_current  = !!body?.is_current
  const location    = sanitize(body?.location, 100)

  if (!company || !position || !start_date) {
    return Response.json({ error: 'company, position, start_date required' }, { status: 400 })
  }

  // Max 20 experience entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { count } = await admin
    .from('work_experience')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 20) {
    return Response.json({ error: 'Maximum 20 experience entries' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('work_experience')
    .insert({
      user_id: user.id, company, position,
      description: description || null,
      start_date,
      end_date: is_current ? null : (end_date || null),
      is_current,
      location: location || null,
    })
    .select()
    .single()

  if (error) {
    console.error('[experience POST]', error)
    return Response.json({ error: 'Failed to save' }, { status: 500 })
  }

  return Response.json({ ok: true, entry: data })
}

// DELETE — remove a work experience entry
export async function DELETE(req: Request) {
  const rl = applyRateLimit(req, 'profile:experience', { limit: 20, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!isValidUUID(id)) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  await admin.from('work_experience').delete().eq('id', id).eq('user_id', user.id)

  return Response.json({ ok: true })
}
