import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'

// GET — generate TOTP secret + QR code for authenticated user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const secret    = generateSecret()
  const label     = user.email ?? user.id
  const otpauth   = generateURI({ issuer: 'FreelanceHub', label, secret })
  const qrDataUrl = await QRCode.toDataURL(otpauth)

  return Response.json({ secret, qrDataUrl, otpauth })
}

// POST — verify the first token and persist the secret
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { secret, token } = await req.json()
  if (!secret || !token) return Response.json({ error: 'Missing secret or token' }, { status: 400 })

  const result = verifySync({ token, secret })
  if (!result.valid) return Response.json({ error: 'Invalid token' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('profiles').update({ totp_secret: secret }).eq('id', user.id)

  return Response.json({ success: true })
}

// DELETE — disable 2FA (remove stored secret)
export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('profiles').update({ totp_secret: null }).eq('id', user.id)

  return Response.json({ success: true })
}
