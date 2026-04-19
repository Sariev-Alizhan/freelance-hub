// ActivityPub outbox — the user's public activity stream.
// GET /users/<username>/outbox         → OrderedCollection pointer (first page)
// GET /users/<username>/outbox?page=1  → OrderedCollectionPage (up to 20 posts)
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { INSTANCE_ORIGIN, actorUrl } from '@/lib/federation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

function apJson(body: unknown) {
  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/activity+json; charset=utf-8',
      'Cache-Control': 'public, max-age=30',
    },
  })
}

export async function GET(
  req: NextRequest,
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

  const actor   = actorUrl(profile.username)
  const outbox  = `${actor}/outbox`
  const pageArg = req.nextUrl.searchParams.get('page')

  const { count: total } = await db
    .from('feed_posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profile.id)
    .eq('origin_instance', 'freelance-hub.kz')

  // Summary view: tell the consumer total count + first-page pointer.
  if (!pageArg) {
    return apJson({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: outbox,
      type: 'OrderedCollection',
      totalItems: total ?? 0,
      first: `${outbox}?page=1`,
      last:  `${outbox}?page=${Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))}`,
    })
  }

  const page  = Math.max(1, parseInt(pageArg, 10) || 1)
  const from  = (page - 1) * PAGE_SIZE
  const to    = from + PAGE_SIZE - 1

  const { data: posts } = await db
    .from('feed_posts')
    .select('id, content, created_at')
    .eq('user_id', profile.id)
    .eq('origin_instance', 'freelance-hub.kz')
    .order('created_at', { ascending: false })
    .range(from, to)

  const items = (posts ?? []).map(p => {
    const noteId = `${INSTANCE_ORIGIN}/posts/${p.id}`
    return {
      id: `${noteId}#create`,
      type: 'Create',
      actor,
      published: p.created_at,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${actor}/followers`],
      object: {
        id: noteId,
        type: 'Note',
        attributedTo: actor,
        content: p.content,
        published: p.created_at,
        to: ['https://www.w3.org/ns/activitystreams#Public'],
        cc: [`${actor}/followers`],
      },
    }
  })

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / PAGE_SIZE))

  return apJson({
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: `${outbox}?page=${page}`,
    type: 'OrderedCollectionPage',
    partOf: outbox,
    orderedItems: items,
    ...(page < totalPages ? { next: `${outbox}?page=${page + 1}` } : {}),
    ...(page > 1          ? { prev: `${outbox}?page=${page - 1}` } : {}),
  })
}
