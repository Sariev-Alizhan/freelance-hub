// PATCH a portfolio item — owner-only.
// Supports editing title/description/project_url/category and toggling featured.
// Featured cap: 4 per freelancer. Position = 0..3, auto-assigned on pin.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'

const MAX_FEATURED = 4

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    title?:             string
    description?:       string | null
    project_url?:       string | null
    category?:          string | null
    is_featured?:       boolean
    featured_position?: number | null
  }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Ensure ownership
  const { data: existing } = await db
    .from('portfolio_items')
    .select('id, freelancer_id, is_featured, featured_position')
    .eq('id', id)
    .maybeSingle()
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.freelancer_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {}

  if (typeof body.title === 'string') {
    const t = body.title.trim()
    if (!t) return NextResponse.json({ error: 'title required' }, { status: 400 })
    updates.title = t
  }
  if (body.description !== undefined) {
    const d = (body.description ?? '').toString().trim()
    if (d.length > 400) return NextResponse.json({ error: 'description too long' }, { status: 400 })
    updates.description = d || null
  }
  if (body.project_url !== undefined) {
    updates.project_url = body.project_url || null
  }
  if (body.category !== undefined) {
    updates.category = body.category || null
  }

  // Featured toggle — enforce cap + auto-position
  if (body.is_featured !== undefined) {
    if (body.is_featured && !existing.is_featured) {
      const { count } = await db
        .from('portfolio_items')
        .select('id', { count: 'exact', head: true })
        .eq('freelancer_id', user.id)
        .eq('is_featured', true)
      if ((count ?? 0) >= MAX_FEATURED) {
        return NextResponse.json(
          { error: `You can feature at most ${MAX_FEATURED} items. Unfeature one first.` },
          { status: 400 },
        )
      }
      updates.is_featured = true
      updates.featured_position = count ?? 0
    } else if (!body.is_featured && existing.is_featured) {
      updates.is_featured = false
      updates.featured_position = null
    }
  }

  if (typeof body.featured_position === 'number' && existing.is_featured) {
    const pos = Math.max(0, Math.min(MAX_FEATURED - 1, Math.round(body.featured_position)))
    updates.featured_position = pos
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, noop: true })
  }

  const { error } = await db
    .from('portfolio_items')
    .update(updates)
    .eq('id', id)
    .eq('freelancer_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
