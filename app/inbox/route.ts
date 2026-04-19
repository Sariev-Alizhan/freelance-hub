// Shared inbox — ActivityPub optimization for broadcasts (to: Public).
// Remote servers can deliver one copy here instead of per-actor inbox.
// Phase 2: queue for later processing.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function POST(req: NextRequest) {
  let activity: Record<string, unknown>
  try {
    activity = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 })
  }

  const type   = typeof activity.type   === 'string' ? activity.type   : 'Unknown'
  const actor  = typeof activity.actor  === 'string' ? activity.actor  : ''
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
