// WebFinger — ActivityPub discovery entry point.
// GET /.well-known/webfinger?resource=acct:alice@freelance-hub.kz
// Returns a JRD pointing to the actor URL.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { INSTANCE_HOST, actorUrl } from '@/lib/federation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get('resource')
  if (!resource) {
    return NextResponse.json({ error: 'missing resource' }, { status: 400 })
  }

  // Expected: acct:username@host
  const match = /^acct:([^@]+)@(.+)$/.exec(resource)
  if (!match) {
    return NextResponse.json({ error: 'unsupported resource' }, { status: 400 })
  }

  const [, username, host] = match
  if (host !== INSTANCE_HOST) {
    return NextResponse.json({ error: 'wrong host' }, { status: 404 })
  }

  const { data: profile } = await admin()
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .maybeSingle<{ id: string; username: string }>()

  if (!profile) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const actor = actorUrl(profile.username)

  return new NextResponse(
    JSON.stringify({
      subject: `acct:${profile.username}@${INSTANCE_HOST}`,
      aliases: [actor],
      links: [
        { rel: 'self', type: 'application/activity+json', href: actor },
        { rel: 'http://webfinger.net/rel/profile-page', type: 'text/html',
          href: `https://${INSTANCE_HOST}/u/${profile.username}` },
      ],
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/jrd+json',
        'Cache-Control': 'public, max-age=300',
      },
    },
  )
}
