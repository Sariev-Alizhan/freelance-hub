import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/feed/comments?item_id=...
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const item_id = req.nextUrl.searchParams.get('item_id')
  if (!item_id) return NextResponse.json({ comments: [] })

  const { data } = await db
    .from('feed_comments')
    .select('id, content, created_at, user_id, profiles(full_name, avatar_url, username)')
    .eq('item_id', item_id)
    .order('created_at', { ascending: true })
    .limit(50)

  return NextResponse.json({ comments: data ?? [] })
}

// POST /api/feed/comments  body: { item_id, content }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { item_id, content } = await req.json() as { item_id: string; content: string }
  const trimmed = (content ?? '').trim()
  if (!item_id || !trimmed || trimmed.length > 1000) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data, error } = await db
    .from('feed_comments')
    .insert({ user_id: user.id, item_id, content: trimmed })
    .select('id, content, created_at, user_id, profiles(full_name, avatar_url, username)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}

// DELETE /api/feed/comments?id=...
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await db.from('feed_comments').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
