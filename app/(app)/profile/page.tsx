import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Resolver: `/profile` → current user's public profile at `/u/[username]`.
 *  If the user has no username yet (legacy accounts), auto-generate one
 *  from their id and persist it, so they land on their profile — which
 *  renders a "Complete profile" CTA when fields are missing. */
export default async function MyProfileRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/profile')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data } = await db
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  let username = data?.username
  if (!username) {
    username = `user_${user.id.replace(/-/g, '').slice(0, 10)}`
    await db.from('profiles').upsert({ id: user.id, username }, { onConflict: 'id' })
  }

  redirect(`/u/${username}`)
}
