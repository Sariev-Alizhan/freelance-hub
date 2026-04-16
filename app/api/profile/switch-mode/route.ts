import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// POST /api/profile/switch-mode  { mode: 'client' | 'freelancer' }
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { mode } = await req.json()
  if (!['client', 'freelancer'].includes(mode)) {
    return Response.json({ error: 'Invalid mode' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('profiles')
    .update({ dual_role: true, active_mode: mode })
    .eq('id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const res = NextResponse.json({ success: true, mode })
  // Persist mode in a short-lived cookie (1 day) for server components
  res.cookies.set('fh-mode', mode, {
    maxAge: 86400,
    path: '/',
    sameSite: 'lax',
    httpOnly: false,  // readable by client JS for instant UI update
  })
  return res
}
