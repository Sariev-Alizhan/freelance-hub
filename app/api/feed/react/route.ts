import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/feed/react?item_ids=id1,id2,...
// Returns counts + current user's actions for requested item IDs
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  const ids = (req.nextUrl.searchParams.get('item_ids') ?? '').split(',').filter(Boolean)
  if (!ids.length) return NextResponse.json({})

  // Counts for all items
  const { data: counts } = await db
    .from('feed_reactions')
    .select('item_id, action')
    .in('item_id', ids)

  // Current user's reactions
  const { data: mine } = user
    ? await db.from('feed_reactions').select('item_id, action').eq('user_id', user.id).in('item_id', ids)
    : { data: [] }

  // Aggregate
  const result: Record<string, { likes: number; dislikes: number; saves: number; reposts: number; mine: string[] }> = {}
  for (const id of ids) {
    result[id] = { likes: 0, dislikes: 0, saves: 0, reposts: 0, mine: [] }
  }
  for (const row of counts ?? []) {
    const r = result[row.item_id]
    if (!r) continue
    if (row.action === 'like')    r.likes++
    if (row.action === 'dislike') r.dislikes++
    if (row.action === 'save')    r.saves++
    if (row.action === 'repost')  r.reposts++
  }
  for (const row of mine ?? []) {
    result[row.item_id]?.mine.push(row.action)
  }

  return NextResponse.json(result)
}

// POST /api/feed/react  body: { item_id, action }
// Toggles the reaction on/off
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let item_id: string, action: string
  try { ({ item_id, action } = await req.json()) } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  if (!item_id || !['like', 'dislike', 'save', 'repost'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Check existing
  const { data: existing } = await db
    .from('feed_reactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('item_id', item_id)
    .eq('action', action)
    .maybeSingle()

  if (existing) {
    // Toggle off
    await db.from('feed_reactions').delete().eq('id', existing.id)
    return NextResponse.json({ toggled: false })
  } else {
    // If toggling like→dislike or dislike→like, remove the opposite first
    if (action === 'like' || action === 'dislike') {
      const opposite = action === 'like' ? 'dislike' : 'like'
      await db.from('feed_reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', item_id)
        .eq('action', opposite)
    }
    await db.from('feed_reactions').insert({ user_id: user.id, item_id, action })
    return NextResponse.json({ toggled: true })
  }
}
