// ActivityPub per-user inbox.
// Phase 3: verify HTTP Signatures, handle Follow / Undo Follow synchronously,
// queue anything else for later processing.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { verifyHttpSignature } from '@/lib/http-signatures'
import { fetchRemoteActor, fetchPublicKeyPem, sendAccept } from '@/lib/federation-delivery'

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
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

  const db = admin()
  const { data: profile } = await db
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle<{ id: string; username: string }>()
  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const type  = typeof activity.type  === 'string' ? activity.type  : 'Unknown'
  const actor = typeof activity.actor === 'string' ? activity.actor : verify.actorUrl ?? ''

  // Follow — record + Accept.
  if (type === 'Follow') {
    const remoteActor = await fetchRemoteActor(actor)
    if (!remoteActor?.inbox) {
      return NextResponse.json({ error: 'cannot resolve actor' }, { status: 400 })
    }

    await db.from('federated_followers').upsert({
      local_user_id: profile.id,
      remote_actor:  actor,
      remote_inbox:  remoteActor.endpoints?.sharedInbox || remoteActor.inbox,
      accepted:      true,
    })

    // Fire-and-forget; client expects quick 202.
    sendAccept({
      localUserId:   profile.id,
      localUsername: profile.username,
      follow:        activity,
      toInboxUrl:    remoteActor.inbox,
    }).catch(() => { /* logged as failed delivery — Phase 3.1 retries */ })

    return new NextResponse(null, { status: 202 })
  }

  // Undo Follow — remove from federated_followers.
  if (type === 'Undo') {
    const inner = activity.object as Record<string, unknown> | undefined
    if (inner && inner.type === 'Follow') {
      await db.from('federated_followers').delete().match({
        local_user_id: profile.id,
        remote_actor:  actor,
      })
      return new NextResponse(null, { status: 202 })
    }
  }

  // Queue unknown activities — Like, Announce, Note reply handled in 3.1.
  await db.from('federation_activities').insert({
    direction:     'inbox',
    activity_type: type,
    actor_url:     actor,
    object_url:    typeof activity.object === 'string' ? activity.object : null,
    raw:           activity,
    processed:     false,
  })

  return new NextResponse(null, { status: 202 })
}
