import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Resolver: `/profile` → current user's public profile at `/u/[username]`.
 *  Signed-out → login. No username yet → profile setup. */
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

  if (!data?.username) redirect('/profile/setup')
  redirect(`/u/${data.username}`)
}
