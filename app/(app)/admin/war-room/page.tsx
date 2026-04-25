import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import WarRoom from './WarRoom'

export const metadata = {
  title: 'FreelanceHub',
  robots: { index: false, follow: false },
}

export default async function WarRoomPage() {
  const user = await getSessionUser()
  if (!isAdmin(user)) notFound()
  return <WarRoom />
}
