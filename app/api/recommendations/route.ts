// LinkedIn-style recommendations — list (public: approved only; owner: all) + create.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID_RELATIONSHIPS = ['client','colleague','manager','report','other']

// GET /api/recommendations?recipient_id=<uuid>&status=approved|pending|all
export async function GET(req: NextRequest) {
  const recipientId = req.nextUrl.searchParams.get('recipient_id')
  const statusParam = req.nextUrl.searchParams.get('status') ?? 'approved'
  if (!recipientId) return NextResponse.json({ error: 'recipient_id required' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === recipientId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  let q = db
    .from('recommendations')
    .select(`
      id, author_id, author_title, relationship, body, status, created_at, updated_at,
      author:author_id ( full_name, username, avatar_url, is_verified )
    `)
    .eq('recipient_id', recipientId)
    .order('created_at', { ascending: false })

  if (statusParam === 'all') {
    if (!isOwner) q = q.eq('status', 'approved')
  } else {
    // Only the owner can see pending/hidden; everyone else clamped to approved.
    const effective = isOwner ? statusParam : 'approved'
    q = q.eq('status', effective)
  }

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ recommendations: data ?? [] })
}

// POST /api/recommendations — author writes a recommendation for recipient.
// Body: { recipient_id, relationship, body, author_title? }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { recipient_id?: string; relationship?: string; body?: string; author_title?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const recipientId = body.recipient_id
  if (!recipientId) return NextResponse.json({ error: 'recipient_id required' }, { status: 400 })
  if (recipientId === user.id) return NextResponse.json({ error: "Can't recommend yourself" }, { status: 400 })
  if (!body.relationship || !VALID_RELATIONSHIPS.includes(body.relationship)) {
    return NextResponse.json({ error: 'invalid relationship' }, { status: 400 })
  }
  const text = (body.body ?? '').trim()
  if (text.length < 50 || text.length > 2000) {
    return NextResponse.json({ error: 'body 50-2000 chars' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Derive author_title snapshot from freelancer_profiles.headline if caller didn't send one.
  let authorTitle = body.author_title?.trim() || null
  if (!authorTitle) {
    const { data: fp } = await db
      .from('freelancer_profiles')
      .select('headline, title')
      .eq('user_id', user.id)
      .maybeSingle()
    authorTitle = fp?.headline || fp?.title || null
  }

  // Upsert on (recipient_id, author_id). Re-writes reset status back to pending.
  const { data, error } = await db
    .from('recommendations')
    .upsert({
      recipient_id: recipientId,
      author_id:    user.id,
      author_title: authorTitle,
      relationship: body.relationship,
      body:         text,
      status:       'pending',
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'recipient_id,author_id' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // In-app notification for the recipient.
  try {
    await db.from('notifications').insert({
      user_id: recipientId,
      type:    'recommendation',
      title:   'New recommendation to review',
      body:    text.slice(0, 120),
      link:    '/dashboard/recommendations',
    })
  } catch { /* table may not exist in all envs; best-effort */ }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
