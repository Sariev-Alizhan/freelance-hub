// ActivityPub followers collection.
// Returns a summary OrderedCollection with just the total count — remote
// instances use this to render follower counts, individual entries aren't
// required and we don't expose local user identities through this endpoint.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { actorUrl } from '@/lib/federation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const db = admin()

  const { data: profile } = await db
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle<{ id: string; username: string }>()

  if (!profile) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const { count: local } = await db
    .from('follows')
    .select('follower', { count: 'exact', head: true })
    .eq('following', profile.id)

  const { count: remote } = await db
    .from('federated_followers')
    .select('remote_actor', { count: 'exact', head: true })
    .eq('local_user_id', profile.id)
    .eq('accepted', true)

  return new NextResponse(
    JSON.stringify({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${actorUrl(profile.username)}/followers`,
      type: 'OrderedCollection',
      totalItems: (local ?? 0) + (remote ?? 0),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/activity+json; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
      },
    },
  )
}
