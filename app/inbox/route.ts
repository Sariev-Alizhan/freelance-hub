// Shared inbox — receives broadcasts (Announce, public Notes, etc.).
// Verifies signature then queues. Per-user addressed activities should still
// go to /users/<u>/inbox; this is for `to: Public` + `cc` deliveries where
// the server is the target, not an individual account.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifyHttpSignature } from '@/lib/http-signatures'
import { fetchPublicKeyPem } from '@/lib/federation-delivery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function lowerHeaders(req: NextRequest): Record<string, string> {
  const out: Record<string, string> = {}
  req.headers.forEach((value, key) => { out[key.toLowerCase()] = value })
  return out
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const headers = lowerHeaders(req)

  const verify = await verifyHttpSignature({
    method:  'POST',
    url:     new URL(req.url),
    headers,
    body:    rawBody,
    fetchPublicKeyPem,
  })

  if (!verify.ok) {
    return NextResponse.json({ error: verify.reason }, { status: 401 })
  }

  let activity: Record<string, unknown>
  try {
    activity = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const type   = typeof activity.type  === 'string' ? activity.type  : 'Unknown'
  const actor  = typeof activity.actor === 'string' ? activity.actor : verify.actorUrl ?? ''
  const object = typeof activity.object === 'string' ? activity.object : null

  await admin().from('federation_activities').insert({
    direction:     'inbox',
    activity_type: type,
    actor_url:     actor,
    object_url:    object,
    raw:           activity,
    processed:     false,
  })

  return new NextResponse(null, { status: 202 })
}
