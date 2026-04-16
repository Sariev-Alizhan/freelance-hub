import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/feed/posts?search=...&limit=40
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const search = req.nextUrl.searchParams.get('search') ?? ''
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '60'), 100)

  let q = db
    .from('feed_posts')
    .select('id, content, tags, created_at, user_id, profiles(full_name, avatar_url, username)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (search) {
    q = q.ilike('content', `%${search}%`)
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ posts: [] })
  return NextResponse.json({ posts: data ?? [] })
}

// POST /api/feed/posts  body: { content, tags? }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, tags } = await req.json() as { content: string; tags?: string[] }
  const trimmed = (content ?? '').trim()
  if (!trimmed || trimmed.length > 2000) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  const cleanTags = (tags ?? []).map((t: string) => t.replace(/[^a-zA-ZА-Яа-я0-9_]/g, '').slice(0, 30)).filter(Boolean).slice(0, 5)

  const { data, error } = await db
    .from('feed_posts')
    .insert({ user_id: user.id, content: trimmed, tags: cleanTags })
    .select('id, content, tags, created_at, user_id, profiles(full_name, avatar_url, username)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ post: data })
}

// DELETE /api/feed/posts?id=...
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.from('feed_posts').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
