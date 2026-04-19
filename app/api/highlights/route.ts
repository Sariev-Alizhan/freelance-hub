// Story Highlights — list (public) + create (auth'd).
// Each highlight is a snapshot of pinned stories; source stories may expire.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/highlights?user_id=<uuid>
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('story_highlights')
    .select(`
      id, title, cover_url, position, created_at,
      items:story_highlight_items(id, type, content, bg_color, media_url, position)
    `)
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // Sort items by position client-side since nested order isn't guaranteed in PostgREST
  type Item = { position: number }
  type Highlight = { items: Item[] }
  const highlights = (data ?? []).map((h: Highlight) => ({
    ...h,
    items: [...(h.items ?? [])].sort((a: Item, b: Item) => a.position - b.position),
  }))
  return NextResponse.json({ highlights })
}

// POST /api/highlights — create highlight, optionally seeding from stories.
// Body: { title: string, cover_url?: string, story_ids?: string[] }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { title?: string; cover_url?: string | null; story_ids?: string[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const title = (body.title ?? '').trim()
  if (!title || title.length > 30) {
    return NextResponse.json({ error: 'title 1-30 chars' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: h, error: hErr } = await db
    .from('story_highlights')
    .insert({
      user_id:   user.id,
      title,
      cover_url: body.cover_url ?? null,
    })
    .select('id')
    .single()

  if (hErr || !h) return NextResponse.json({ error: hErr?.message ?? 'Create failed' }, { status: 500 })

  // Seed from selected stories (owner's own stories only)
  if (Array.isArray(body.story_ids) && body.story_ids.length > 0) {
    const ids = body.story_ids.slice(0, 50)
    const { data: stories } = await db
      .from('stories')
      .select('id, type, content, bg_color, media_url, created_at')
      .in('id', ids)
      .eq('user_id', user.id)

    interface StoryRow {
      id:        string
      type:      string
      content:   string | null
      bg_color:  string | null
      media_url: string | null
      created_at: string
    }
    // Preserve selection order
    const order = new Map(ids.map((id, i) => [id, i]))
    const rows = (stories ?? [])
      .sort((a: StoryRow, b: StoryRow) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      .map((s: StoryRow, i: number) => ({
        highlight_id: h.id,
        type:         s.type,
        content:      s.content,
        bg_color:     s.bg_color,
        media_url:    s.media_url,
        position:     i,
      }))

    if (rows.length > 0) {
      await db.from('story_highlight_items').insert(rows)
      // Default cover = first item's media (if image)
      if (!body.cover_url) {
        const firstImage = rows.find((r: { type: string; media_url: string | null }) => r.type === 'image' && r.media_url)
        if (firstImage) {
          await db.from('story_highlights').update({ cover_url: firstImage.media_url }).eq('id', h.id)
        }
      }
    }
  }

  return NextResponse.json({ id: h.id }, { status: 201 })
}
