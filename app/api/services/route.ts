// Services CRUD — list + create. Per-service edits live in [id]/route.ts.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_CATEGORIES = ['dev','ux-ui','smm','targeting','copywriting','video','tg-bots','ai-ml','nocode','3d-art']

interface TierInput {
  tier:          'basic' | 'standard' | 'premium'
  title:         string
  price:         number
  delivery_days: number
  revisions?:    number
  description?:  string
  features?:     string[]
}

interface ServiceInput {
  title:       string
  description: string
  category:    string
  cover_image?: string | null
  skills?:     string[]
  tiers:       TierInput[]
}

function validateTier(t: TierInput): string | null {
  if (!['basic','standard','premium'].includes(t.tier)) return 'bad tier'
  if (!t.title || t.title.length > 60) return 'tier title 1-60'
  if (!Number.isFinite(t.price) || t.price < 1 || t.price > 100_000_000) return 'tier price'
  if (!Number.isFinite(t.delivery_days) || t.delivery_days < 1 || t.delivery_days > 365) return 'delivery_days 1-365'
  if (t.revisions !== undefined && (!Number.isFinite(t.revisions) || t.revisions < -1)) return 'revisions'
  if (t.description && t.description.length > 500) return 'tier description too long'
  if (t.features && t.features.length > 10) return 'max 10 features'
  return null
}

// GET /api/services?freelancer_id=<uuid>
export async function GET(req: NextRequest) {
  const freelancerId = req.nextUrl.searchParams.get('freelancer_id')
  if (!freelancerId) return NextResponse.json({ error: 'freelancer_id required' }, { status: 400 })

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: services, error } = await db
    .from('services')
    .select(`
      id, title, description, category, cover_image, skills, is_active, purchases_count, created_at,
      tiers:service_tiers(id, tier, title, price, delivery_days, revisions, description, features)
    `)
    .eq('freelancer_id', freelancerId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ services: services ?? [] })
}

// POST /api/services — create service with 1-3 tiers atomically
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: ServiceInput
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.title || body.title.length < 10 || body.title.length > 200) {
    return NextResponse.json({ error: 'title 10-200 chars' }, { status: 400 })
  }
  if (!body.description || body.description.length < 40 || body.description.length > 5000) {
    return NextResponse.json({ error: 'description 40-5000 chars' }, { status: 400 })
  }
  if (!VALID_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }
  if (!Array.isArray(body.tiers) || body.tiers.length < 1 || body.tiers.length > 3) {
    return NextResponse.json({ error: '1-3 tiers required' }, { status: 400 })
  }
  for (const t of body.tiers) {
    const err = validateTier(t)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
  }
  // tiers must be unique
  const seen = new Set(body.tiers.map(t => t.tier))
  if (seen.size !== body.tiers.length) return NextResponse.json({ error: 'duplicate tier' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: svc, error: svcErr } = await db
    .from('services')
    .insert({
      freelancer_id: user.id,
      title:         body.title.trim(),
      description:   body.description.trim(),
      category:      body.category,
      cover_image:   body.cover_image ?? null,
      skills:        (body.skills ?? []).slice(0, 10),
    })
    .select('id')
    .single()

  if (svcErr) return NextResponse.json({ error: svcErr.message }, { status: 500 })

  const tierRows = body.tiers.map(t => ({
    service_id:    svc.id,
    tier:          t.tier,
    title:         t.title.trim(),
    price:         Math.round(t.price),
    delivery_days: Math.round(t.delivery_days),
    revisions:     Math.round(t.revisions ?? 1),
    description:   t.description?.trim() ?? null,
    features:      (t.features ?? []).filter(Boolean).slice(0, 10),
  }))

  const { error: tErr } = await db.from('service_tiers').insert(tierRows)
  if (tErr) {
    // clean up orphaned service
    await db.from('services').delete().eq('id', svc.id)
    return NextResponse.json({ error: tErr.message }, { status: 500 })
  }

  return NextResponse.json({ id: svc.id }, { status: 201 })
}
