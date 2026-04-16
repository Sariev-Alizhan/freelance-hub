import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
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
  // Auth gate: JWT claim or ADMIN_EMAIL fallback
  if (!isAdmin(user)) redirect('/auth/login')
  return <BoardRoom />
}
