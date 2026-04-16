import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/stories/[id]/view — record a view (idempotent)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: true })

  // Insert view; ignore duplicate
  const { error: viewErr } = await db
    .from('story_views')
    .upsert({ story_id: id, viewer_id: user.id }, { onConflict: 'story_id,viewer_id', ignoreDuplicates: true })

  if (!viewErr) {
    const { data: story } = await db
      .from('stories')
      .select('views, user_id')
      .eq('id', id)
      .single() as { data: { views: number; user_id: string } | null }

    if (story && story.user_id !== user.id) {
      await db.from('stories').update({ views: (story.views ?? 0) + 1 }).eq('id', id)
    }
  }

  return NextResponse.json({ ok: true })
}
