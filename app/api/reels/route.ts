// Reels — list (global or by user) + create.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/reels?user_id=<uuid>&limit=20&before=<iso>
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id')
  const before = req.nextUrl.searchParams.get('before')
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '20'), 50)

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let q = db
    .from('reels')
    .select('id, user_id, video_url, thumbnail_url, caption, duration_seconds, aspect_ratio, views, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (userId) q = q.eq('user_id', userId)
  if (before) q = q.lt('created_at', before)

  const { data: reels, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!reels?.length) return NextResponse.json({ reels: [] })

  // Batch-fetch author profiles
  const ids = [...new Set((reels as { user_id: string }[]).map(r => r.user_id))]
  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name, username, avatar_url, is_verified')
    .in('id', ids)

  interface Profile { id: string; full_name: string | null; username: string | null; avatar_url: string | null; is_verified: boolean }
  const pMap = Object.fromEntries((profiles ?? []).map((p: Profile) => [p.id, p]))

  const result = (reels as { user_id: string }[]).map(r => ({
    ...r,
    author: pMap[r.user_id] ?? null,
  }))

  return NextResponse.json({ reels: result })
}

// POST /api/reels
// Body: { video_url, thumbnail_url?, caption?, duration_seconds?, aspect_ratio? }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    video_url?: string
    thumbnail_url?: string
    caption?: string
    duration_seconds?: number
    aspect_ratio?: number
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const videoUrl = (body.video_url ?? '').trim()
  if (!videoUrl || !videoUrl.startsWith('http')) {
    return NextResponse.json({ error: 'video_url required' }, { status: 400 })
  }
  const caption = (body.caption ?? '').trim()
  if (caption.length > 500) return NextResponse.json({ error: 'caption too long' }, { status: 400 })

  const dur = Number(body.duration_seconds)
  if (body.duration_seconds !== undefined && (!Number.isFinite(dur) || dur <= 0 || dur > 300)) {
    return NextResponse.json({ error: 'duration_seconds must be 1-300' }, { status: 400 })
  }

  const ar = Number(body.aspect_ratio)
  if (body.aspect_ratio !== undefined && (!Number.isFinite(ar) || ar <= 0 || ar > 5)) {
    return NextResponse.json({ error: 'invalid aspect_ratio' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('reels')
    .insert({
      user_id:          user.id,
      video_url:        videoUrl,
      thumbnail_url:    body.thumbnail_url ?? null,
      caption:          caption || null,
      duration_seconds: Number.isFinite(dur) ? Math.round(dur) : null,
      aspect_ratio:     Number.isFinite(ar)  ? ar               : null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}
