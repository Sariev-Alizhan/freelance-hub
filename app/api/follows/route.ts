import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/follows?user_id=xxx
//   → { iFollow, followsMe, friends, followersCount, followingCount }
// GET /api/follows?user_id=xxx&list=followers → { users: Profile[] }
// GET /api/follows?user_id=xxx&list=following → { users: Profile[] }
// GET /api/follows?list=friends                → my mutual follows
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()

  const sp       = req.nextUrl.searchParams
  const targetId = sp.get('user_id')
  const list     = sp.get('list')

  // Followers of X
  if (targetId && list === 'followers') {
    const { data: rows } = await db.from('follows').select('follower').eq('following', targetId)
    const ids = (rows ?? []).map((r: { follower: string }) => r.follower)
    if (!ids.length) return NextResponse.json({ users: [] })
    const { data: profiles } = await db.from('profiles')
      .select('id, full_name, username, avatar_url, is_verified, bio')
      .in('id', ids)
    return NextResponse.json({ users: profiles ?? [] })
  }

  // Following of X
  if (targetId && list === 'following') {
    const { data: rows } = await db.from('follows').select('following').eq('follower', targetId)
    const ids = (rows ?? []).map((r: { following: string }) => r.following)
    if (!ids.length) return NextResponse.json({ users: [] })
    const { data: profiles } = await db.from('profiles')
      .select('id, full_name, username, avatar_url, is_verified, bio')
      .in('id', ids)
    return NextResponse.json({ users: profiles ?? [] })
  }

  // My friends (mutual follows). Requires auth.
  if (list === 'friends') {
    if (!user) return NextResponse.json({ users: [] })
    const { data: outgoing } = await db.from('follows').select('following').eq('follower', user.id)
    const { data: incoming } = await db.from('follows').select('follower').eq('following', user.id)
    const outSet = new Set((outgoing ?? []).map((r: { following: string }) => r.following))
    const mutual = (incoming ?? [])
      .map((r: { follower: string }) => r.follower)
      .filter((id: string) => outSet.has(id))
    if (!mutual.length) return NextResponse.json({ users: [] })
    const { data: profiles } = await db.from('profiles')
      .select('id, full_name, username, avatar_url, is_verified, bio')
      .in('id', mutual)
    return NextResponse.json({ users: profiles ?? [] })
  }

  // Status between current user & target + counts
  if (targetId) {
    const [followersRes, followingRes, iFollowRes, followsMeRes] = await Promise.all([
      db.from('follows').select('follower', { count: 'exact', head: true }).eq('following', targetId),
      db.from('follows').select('following', { count: 'exact', head: true }).eq('follower', targetId),
      user
        ? db.from('follows').select('follower').eq('follower', user.id).eq('following', targetId).maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? db.from('follows').select('follower').eq('follower', targetId).eq('following', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    const iFollow   = !!iFollowRes.data
    const followsMe = !!followsMeRes.data
    return NextResponse.json({
      iFollow,
      followsMe,
      friends: iFollow && followsMe,
      followersCount: followersRes.count ?? 0,
      followingCount: followingRes.count ?? 0,
    })
  }

  return NextResponse.json({ error: 'Missing params' }, { status: 400 })
}

// POST /api/follows  body: { user_id }
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { user_id } = await req.json() as { user_id: string }
  if (!user_id || user_id === user.id) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  }

  const { error } = await db
    .from('follows')
    .insert({ follower: user.id, following: user_id })
  if (error && !error.message.includes('duplicate')) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fire-and-forget notification via service role (bypasses RLS).
  try {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adb = admin as any
    const { data: me } = await adb.from('profiles')
      .select('full_name, username').eq('id', user.id).maybeSingle()
    const name = me?.full_name || me?.username || 'Someone'
    const uname = me?.username ? `/u/${me.username}` : '/freelancers'
    await adb.from('notifications').insert({
      user_id,
      type:  'new_follower',
      title: `${name} started following you`,
      body:  null,
      link:  uname,
    })
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true })
}

// DELETE /api/follows?user_id=xxx
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const targetId = req.nextUrl.searchParams.get('user_id')
  if (!targetId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  await db.from('follows').delete()
    .eq('follower', user.id).eq('following', targetId)

  return NextResponse.json({ ok: true })
}
