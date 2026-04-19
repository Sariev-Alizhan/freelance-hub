// ActivityPub Note resolver.
// When the actor JSON or outbox references https://host/posts/<id>, remote
// instances fetch that URL to get the Note object. Redirects to HTML for
// human visitors.
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { INSTANCE_ORIGIN, actorUrl } from '@/lib/federation'

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
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!wantsActivityJson(req.headers.get('accept'))) {
    return NextResponse.redirect(`${INSTANCE_ORIGIN}/feed`, 303)
  }

  const { data: post } = await admin()
    .from('feed_posts')
    .select('id, content, created_at, user_id, origin_instance')
    .eq('id', id)
    .maybeSingle<{
      id: string; content: string; created_at: string
      user_id: string; origin_instance: string
    }>()

  if (!post || post.origin_instance !== 'freelance-hub.kz') {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { data: author } = await admin()
    .from('profiles')
    .select('username')
    .eq('id', post.user_id)
    .maybeSingle<{ username: string }>()

  if (!author) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const actor  = actorUrl(author.username)
  const noteId = `${INSTANCE_ORIGIN}/posts/${post.id}`

  return new NextResponse(
    JSON.stringify({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: noteId,
      type: 'Note',
      attributedTo: actor,
      content: post.content,
      published: post.created_at,
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${actor}/followers`],
      url: `${INSTANCE_ORIGIN}/feed`,
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
