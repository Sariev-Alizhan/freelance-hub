// Bump the view counter on a reel. Best-effort, accepts slight race.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { applyRateLimit, isValidUUID } from '@/lib/security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!isValidUUID(id)) return NextResponse.json({ error: 'Bad id' }, { status: 400 })

  // Cap views-per-IP-per-reel: one legit view per 5 minutes per IP.
  const rl = applyRateLimit(req, `reel-view:${id}`, { limit: 1, windowMs: 5 * 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: current } = await db
    .from('reels')
    .select('views')
    .eq('id', id)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const views = (current as { views: number | null }).views ?? 0
  await db.from('reels')
    .update({ views: views + 1 })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
