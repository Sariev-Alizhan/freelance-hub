// GET / PATCH / DELETE for a single service.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data, error } = await db
    .from('services')
    .select(`
      id, freelancer_id, title, description, category, cover_image, skills,
      is_active, purchases_count, created_at,
      tiers:service_tiers(id, tier, title, price, delivery_days, revisions, description, features)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data)  return NextResponse.json({ error: 'Not found' },   { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (typeof body.title       === 'string') patch.title       = body.title.trim()
  if (typeof body.description === 'string') patch.description = body.description.trim()
  if (typeof body.category    === 'string') patch.category    = body.category
  if (typeof body.cover_image === 'string' || body.cover_image === null) patch.cover_image = body.cover_image
  if (Array.isArray(body.skills)) patch.skills = (body.skills as unknown[]).slice(0,10).map(String)
  if (typeof body.is_active   === 'boolean') patch.is_active  = body.is_active

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('services')
    .update(patch)
    .eq('id', id)
    .eq('freelancer_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('services')
    .delete()
    .eq('id', id)
    .eq('freelancer_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
