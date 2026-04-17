import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import UserList, { UserListItem } from '@/components/profile/UserList'

export const dynamic = 'force-dynamic'

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: profile } = await db.from('profiles')
    .select('id, full_name, username').eq('username', username).single()
  if (!profile) notFound()

  const { data: rows } = await db.from('follows')
    .select('follower').eq('following', profile.id)
  const ids = (rows ?? []).map((r: { follower: string }) => r.follower)
  let users: UserListItem[] = []
  if (ids.length) {
    const { data } = await db.from('profiles')
      .select('id, full_name, username, avatar_url, is_verified, bio')
      .in('id', ids)
    users = data ?? []
  }

  return (
    <div className="page-shell page-shell--reading">
      <Link href={`/u/${username}`}
        className="inline-flex items-center gap-2 mb-6"
        style={{ fontSize: 13, color: 'var(--fh-t4)' }}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to profile
      </Link>
      <h1 style={{ fontSize: 22, fontWeight: 590, color: 'var(--fh-t1)', marginBottom: 4, letterSpacing: '-0.02em' }}>
        Followers
      </h1>
      <p style={{ fontSize: 13, color: 'var(--fh-t4)', marginBottom: 20 }}>
        {users.length} following @{profile.username}
      </p>
      <UserList users={users} emptyLabel="No followers yet." />
    </div>
  )
}
