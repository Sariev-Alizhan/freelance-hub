import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import WarRoom from './WarRoom'

export const metadata = {
  title: 'War Room — FreelanceHub Command Center',
  robots: { index: false, follow: false },
}

export default async function WarRoomPage() {
  const user = await getSessionUser()
  // Auth gate: JWT claim or ADMIN_EMAIL fallback
  if (!isAdmin(user)) redirect('/auth/login')
  return <WarRoom />
}
