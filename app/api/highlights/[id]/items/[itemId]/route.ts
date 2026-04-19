// Remove a single item from a highlight. Ownership via join on parent highlight.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id: highlightId, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Defense-in-depth: verify the highlight belongs to the user
  const { data: h } = await db
    .from('story_highlights')
    .select('id')
    .eq('id', highlightId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!h) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await db
    .from('story_highlight_items')
    .delete()
    .eq('id', itemId)
    .eq('highlight_id', highlightId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
