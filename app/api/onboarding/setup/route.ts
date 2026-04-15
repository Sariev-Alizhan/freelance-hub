import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { role, fullName, location } = await req.json()
  if (!fullName || !['client', 'freelancer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const admin = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any

  // Update profile with name, location, and role
  const { error: profileErr } = await db
    .from('profiles')
    .upsert({
      id: user.id,
      full_name: fullName,
      location: location ?? null,
      role,
    })

  if (profileErr) {
    console.error('[onboarding/setup] profile error:', profileErr.message)
    return NextResponse.json({ error: profileErr.message }, { status: 500 })
  }

  // If freelancer — create a stub freelancer_profiles row so profile page works immediately
  if (role === 'freelancer') {
    await db
      .from('freelancer_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true })
  }

  return NextResponse.json({ ok: true })
}
