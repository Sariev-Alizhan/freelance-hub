import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/auth/isAdmin'

// GET /api/admin/2fa/setup — generate a TOTP secret + QR code for the admin
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const secret   = generateSecret()
  const label    = user!.email ?? 'admin'
  const otpauth  = generateURI({ issuer: 'FreelanceHub', label, secret })
  const qrDataUrl = await QRCode.toDataURL(otpauth)

  // Return secret + QR — the client saves the secret after verifying the first token
  return Response.json({ secret, qrDataUrl, otpauth })
}

// POST /api/admin/2fa/setup — verify token and persist secret
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { secret, token } = await req.json()
  if (!secret || !token) return Response.json({ error: 'Missing secret or token' }, { status: 400 })

  const result = verifySync({ token, secret })
  if (!result.valid) return Response.json({ error: 'Invalid token' }, { status: 400 })

  // Store the secret in the profiles table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  await db.from('profiles').update({ totp_secret: secret }).eq('id', user!.id)

  return Response.json({ success: true })
}
