import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Legacy public-profile route — fully replaced by `/u/[username]`.
 *  Resolves the profile username from the user id and redirects. */
export default async function LegacyFreelancerProfilePage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data } = await db
    .from('profiles')
    .select('username')
    .eq('id', id)
    .maybeSingle()

  if (!data?.username) notFound()

  redirect(`/u/${data.username}`)
}
