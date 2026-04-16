import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// GET /api/friends?user_id=xxx  — friendship status between current user & target
// GET /api/friends              — accepted friends list (with profiles)
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ status: 'none', friends: [] })

  const targetId = req.nextUrl.searchParams.get('user_id')

  if (targetId) {
    const { data } = await db
      .from('friendships')
      .select('id, requester, addressee, status')
      .or(`and(requester.eq.${user.id},addressee.eq.${targetId}),and(requester.eq.${targetId},addressee.eq.${user.id})`)
      .maybeSingle()

    if (!data) return NextResponse.json({ status: 'none' })
    return NextResponse.json({
      id:     data.id,
      status: data.status,
      isMine: data.requester === user.id,
    })
  }

  // Accepted friends: get rows, then profiles in one batch
  const { data: rows } = await db
    .from('friendships')
    .select('id, requester, addressee')
    .or(`requester.eq.${user.id},addressee.eq.${user.id}`)
    .eq('status', 'accepted')

  const friendIds = (rows ?? []).map((r: { requester: string; addressee: string }) =>
    r.requester === user.id ? r.addressee : r.requester
  )

  if (!friendIds.length) return NextResponse.json({ friends: [] })

  const { data: profiles } = await db
    .from('profiles')
    .select('id, full_name, username, avatar_url, is_verified')
    .in('id', friendIds)

  return NextResponse.json({ friends: profiles ?? [] })
}

// POST /api/friends  body: { addressee }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { addressee } = await req.json() as { addressee: string }
  if (!addressee || addressee === user.id) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }

  const { data, error } = await db
    .from('friendships')
    .insert({ requester: user.id, addressee })
    .select('id, status')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, status: data.status })
}

// PATCH /api/friends  body: { id, status: 'accepted' | 'declined' }
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, status } = await req.json() as { id: string; status: string }
  if (!id || !['accepted', 'declined'].includes(status)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }

  await db.from('friendships').update({ status }).eq('id', id)
    .or(`requester.eq.${user.id},addressee.eq.${user.id}`)
  return NextResponse.json({ ok: true })
}

// DELETE /api/friends?user_id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const targetUserId = req.nextUrl.searchParams.get('user_id')
  if (!targetUserId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  await db.from('friendships').delete()
    .or(`and(requester.eq.${user.id},addressee.eq.${targetUserId}),and(requester.eq.${targetUserId},addressee.eq.${user.id})`)

  return NextResponse.json({ ok: true })
}
