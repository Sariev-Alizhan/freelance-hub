import { createClient } from '@/lib/supabase/server'

// GET — check whether the current user has 2FA enabled
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data } = await db
    .from('profiles')
    .select('totp_secret')
    .eq('id', user.id)
    .single()

  return Response.json({ enabled: !!data?.totp_secret })
}
