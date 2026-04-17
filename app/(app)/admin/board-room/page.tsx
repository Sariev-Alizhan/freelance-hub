import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import BoardRoom from './BoardRoom'

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
