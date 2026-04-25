import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import BoardRoom from './BoardRoom'

export const metadata = {
  title: 'FreelanceHub',
  robots: { index: false, follow: false },
}

export default async function BoardRoomPage() {
  const user = await getSessionUser()
  if (!isAdmin(user)) notFound()
  return <BoardRoom />
}
