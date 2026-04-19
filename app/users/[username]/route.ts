// ActivityPub actor JSON.
// GET /users/<username> — returns AS2 Person when Accept: application/activity+json,
// otherwise redirects to the HTML profile at /u/<username>.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { INSTANCE_ORIGIN, actorUrl } from '@/lib/federation'
import { getOrCreateActorKey } from '@/lib/actor-keys'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function wantsActivityJson(accept: string | null): boolean {
  if (!accept) return false
  return accept.includes('application/activity+json')
      || accept.includes('application/ld+json')
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params

  if (!wantsActivityJson(req.headers.get('accept'))) {
    return NextResponse.redirect(`${INSTANCE_ORIGIN}/u/${username}`, 303)
  }

  const { data: profile } = await admin()
    .from('profiles')
    .select('id, username, full_name, bio, avatar_url, did')
    .eq('username', username)
    .maybeSingle<{
      id: string; username: string
      full_name: string | null; bio: string | null
      avatar_url: string | null; did: string | null
    }>()

  if (!profile) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { publicKeyPem } = await getOrCreateActorKey(profile.id)
  const actor = actorUrl(profile.username)

  const body = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1',
    ],
    id: actor,
    type: 'Person',
    preferredUsername: profile.username,
    name: profile.full_name ?? profile.username,
    summary: profile.bio ?? '',
    url: `${INSTANCE_ORIGIN}/u/${profile.username}`,
    inbox:     `${actor}/inbox`,
    outbox:    `${actor}/outbox`,
    followers: `${actor}/followers`,
    following: `${actor}/following`,
    ...(profile.avatar_url ? {
      icon: { type: 'Image', mediaType: 'image/jpeg', url: profile.avatar_url },
    } : {}),
    publicKey: {
      id:          `${actor}#main-key`,
      owner:       actor,
      publicKeyPem,
    },
    ...(profile.did ? { 'did:subject': profile.did } : {}),
    endpoints: { sharedInbox: `${INSTANCE_ORIGIN}/inbox` },
  }

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/activity+json; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  })
}
