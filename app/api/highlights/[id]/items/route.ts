// Add items to a highlight by snapshotting one or more of the owner's stories.
// Body: { story_ids: string[] }
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: highlightId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { story_ids?: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const ids = Array.isArray(body.story_ids) ? body.story_ids.slice(0, 50) : []
  if (ids.length === 0) return NextResponse.json({ error: 'story_ids required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Verify ownership of the highlight
  const { data: h } = await db
    .from('story_highlights')
    .select('id')
    .eq('id', highlightId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!h) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get current max position
  const { data: existing } = await db
    .from('story_highlight_items')
    .select('position')
    .eq('highlight_id', highlightId)
    .order('position', { ascending: false })
    .limit(1)
  const basePos = (existing?.[0]?.position ?? -1) + 1

  const { data: stories } = await db
    .from('stories')
    .select('id, type, content, bg_color, media_url')
    .in('id', ids)
    .eq('user_id', user.id)

  interface StoryRow { id: string; type: string; content: string | null; bg_color: string | null; media_url: string | null }
  const order = new Map(ids.map((id, i) => [id, i]))
  const rows = (stories ?? [])
    .sort((a: StoryRow, b: StoryRow) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map((s: StoryRow, i: number) => ({
      highlight_id: highlightId,
      type:         s.type,
      content:      s.content,
      bg_color:     s.bg_color,
      media_url:    s.media_url,
      position:     basePos + i,
    }))

  if (rows.length === 0) return NextResponse.json({ error: 'No valid stories' }, { status: 400 })

  const { error } = await db.from('story_highlight_items').insert(rows)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ added: rows.length }, { status: 201 })
}
