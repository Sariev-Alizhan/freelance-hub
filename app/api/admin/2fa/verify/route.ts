import { verifySync } from 'otplib'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/isAdmin'

// POST /api/admin/2fa/verify — verify a TOTP token against the stored secret
// Used on each admin login to confirm identity
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { token } = await req.json()
  if (!token) return Response.json({ error: 'Missing token' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: profile, error } = await db
    .from('profiles')
    .select('totp_secret')
    .eq('id', user!.id)
    .single()

  if (error || !profile) return Response.json({ error: 'Profile not found' }, { status: 404 })

  // If no secret is stored, 2FA is not configured — allow through
  if (!profile.totp_secret) {
    return Response.json({ valid: true, configured: false })
  }

  const result = verifySync({ token, secret: profile.totp_secret })
  if (!result.valid) return Response.json({ error: 'Invalid token' }, { status: 400 })

  return Response.json({ valid: true, configured: true })
}

// DELETE /api/admin/2fa/verify — remove TOTP secret (disable 2FA)
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('profiles').update({ totp_secret: null }).eq('id', user!.id)

  return Response.json({ success: true })
}
