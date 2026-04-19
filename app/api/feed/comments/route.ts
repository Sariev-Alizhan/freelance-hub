import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyRateLimit, isValidUUID } from '@/lib/security'

export const dynamic = 'force-dynamic'

// GET /api/feed/comments?item_id=...
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const item_id = req.nextUrl.searchParams.get('item_id')
  if (!isValidUUID(item_id)) return NextResponse.json({ comments: [] })

  // Step 1: fetch comments without profile join
  const { data: comments, error } = await db
    .from('feed_comments')
    .select('id, content, created_at, user_id')
    .eq('item_id', item_id)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error || !comments?.length) return NextResponse.json({ comments: [] })

  // Step 2: batch-fetch profiles
  const userIds = [...new Set((comments as { user_id: string }[]).map((c: { user_id: string }) => c.user_id))]
  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name, avatar_url, username')
    .in('id', userIds)

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p: { id: string; full_name: string | null; avatar_url: string | null; username: string | null }) => [p.id, p])
  )

  const result = (comments as { user_id: string }[]).map(c => ({
    ...c,
    profiles: profileMap[c.user_id] ?? null,
  }))

  return NextResponse.json({ comments: result })
}

// POST /api/feed/comments  body: { item_id, content }
export async function POST(req: NextRequest) {
  const rl = applyRateLimit(req, 'feed:comments:create', { limit: 20, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let item_id: string, content: string
  try { ({ item_id, content } = await req.json()) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const trimmed = (content ?? '').trim()
  if (!isValidUUID(item_id) || !trimmed || trimmed.length > 1000) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: comment, error } = await db
    .from('feed_comments')
    .insert({ user_id: user.id, item_id, content: trimmed })
    .select('id, content, created_at, user_id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch author profile
  const { data: profile } = await db
    .from('profiles')
    .select('id, full_name, avatar_url, username')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ comment: { ...comment, profiles: profile ?? null } })
}

// DELETE /api/feed/comments?id=...
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await db.from('feed_comments').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
