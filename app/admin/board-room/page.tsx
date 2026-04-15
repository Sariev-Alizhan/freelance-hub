import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import BoardRoom from './BoardRoom'

async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const metadata = {
  title: 'Board Room — FreelanceHub Executive Meetings',
  robots: { index: false, follow: false },
}

export default async function BoardRoomPage() {
  const user = await getSessionUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || (adminEmail && user.email !== adminEmail)) redirect('/auth/login')
  return <BoardRoom />
}
