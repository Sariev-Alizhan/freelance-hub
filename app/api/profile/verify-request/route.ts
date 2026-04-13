import { createClient } from '@/lib/supabase/server'

// POST /api/profile/verify-request
// Freelancer submits a verification request.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('freelancer_profiles')
    .update({
      verification_requested: true,
      verification_requested_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json({ ok: true })
}
