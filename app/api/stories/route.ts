import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyRateLimit } from '@/lib/security'

type StoryRow = {
  id: string
  user_id: string
  type: 'text' | 'image'
  content: string | null
  bg_color: string | null
  media_url: string | null
  views: number
  created_at: string
  expires_at: string
  profiles: { full_name: string; avatar_url: string | null; username: string | null; is_verified: boolean } | null
}

// GET /api/stories — active stories grouped by user (last 24 h)
export async function GET() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all active stories with author profile
  const { data: stories, error } = await db
    .from('stories')
    .select(`
      id, user_id, type, content, bg_color, media_url, views, created_at, expires_at,
      profiles:user_id (full_name, avatar_url, username, is_verified)
    `)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true }) as { data: StoryRow[] | null; error: unknown }

  // Table may not exist yet (migration pending) — return empty gracefully
  if (error) return NextResponse.json({ groups: [], viewedIds: [] })

  // Fetch viewer's seen story IDs
  let viewedIds: string[] = []
  if (user) {
    const { data: views } = await db
      .from('story_views')
      .select('story_id')
      .eq('viewer_id', user.id) as { data: { story_id: string }[] | null }
    viewedIds = (views ?? []).map(v => v.story_id)
  }

  // Group by user_id
  const usersMap = new Map<string, {
    user_id: string
    full_name: string
    avatar_url: string | null
    username: string | null
    is_verified: boolean
    stories: StoryRow[]
    has_unseen: boolean
    is_own: boolean
  }>()

  for (const story of stories ?? []) {
    const p = story.profiles
    if (!p) continue

    if (!usersMap.has(story.user_id)) {
      usersMap.set(story.user_id, {
        user_id: story.user_id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        username: p.username,
        is_verified: p.is_verified ?? false,
        stories: [],
        has_unseen: false,
        is_own: story.user_id === user?.id,
      })
    }
    const entry = usersMap.get(story.user_id)!
    entry.stories.push(story)
    if (!viewedIds.includes(story.id)) entry.has_unseen = true
  }

  // Sort: own first, then unseen first
  const groups = Array.from(usersMap.values()).sort((a, b) => {
    if (a.is_own !== b.is_own) return a.is_own ? -1 : 1
    if (a.has_unseen !== b.has_unseen) return a.has_unseen ? -1 : 1
    return 0
  })

  return NextResponse.json({ groups, viewedIds })
}

// POST /api/stories — create a new story
export async function POST(req: NextRequest) {
  const rl = applyRateLimit(req, 'stories:create', { limit: 10, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { type?: string; content?: string; bg_color?: string; media_url?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { type, content, bg_color, media_url } = body

  if (type !== 'text' && type !== 'image') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
  if (type === 'text' && !content) {
    return NextResponse.json({ error: 'content required for text stories' }, { status: 400 })
  }
  // media_url must be https URL if provided (prevents javascript:, data: schemes).
  if (media_url !== undefined && media_url !== null) {
    if (typeof media_url !== 'string' || !/^https:\/\//i.test(media_url) || media_url.length > 2048) {
      return NextResponse.json({ error: 'Invalid media_url' }, { status: 400 })
    }
  }
  if (type === 'image' && !media_url) {
    return NextResponse.json({ error: 'media_url required for image stories' }, { status: 400 })
  }

  const { data, error } = await db.from('stories').insert({
    user_id: user.id,
    type,
    content: content ?? null,
    bg_color: bg_color ?? '#27a644',
    media_url: media_url ?? null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: error.code === '42P01' ? 503 : 500 })
  return NextResponse.json({ story: data })
}
