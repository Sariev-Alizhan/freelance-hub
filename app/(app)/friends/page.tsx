import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import UserList, { UserListItem } from '@/components/profile/UserList'

export const dynamic = 'force-dynamic'

export default async function FriendsPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const [{ data: outgoing }, { data: incoming }] = await Promise.all([
    db.from('follows').select('following').eq('follower',  user.id),
    db.from('follows').select('follower').eq('following', user.id),
  ])
  const outSet = new Set((outgoing ?? []).map((r: { following: string }) => r.following))
  const mutual = (incoming ?? [])
    .map((r: { follower: string }) => r.follower)
    .filter((id: string) => outSet.has(id))

  let users: UserListItem[] = []
  if (mutual.length) {
    const { data } = await db.from('profiles')
      .select('id, full_name, username, avatar_url, is_verified, bio')
      .in('id', mutual)
    users = data ?? []
  }

  return (
    <div className="page-shell page-shell--reading">
      <Link href="/dashboard"
        className="inline-flex items-center gap-2 mb-6"
        style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <Heart className="h-5 w-5" style={{ color: '#27a644' }} />
        <h1 style={{ fontSize: 22, fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
          Friends
        </h1>
      </div>
      <p style={{ fontSize: 13, color: 'var(--fh-t4)', marginBottom: 20 }}>
        People you and they both follow — {users.length} mutual
      </p>
      <UserList users={users} emptyLabel="No friends yet. Follow someone who follows you back." />
    </div>
  )
}
