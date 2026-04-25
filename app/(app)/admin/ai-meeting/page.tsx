import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import AIMeeting from './AIMeeting'

export const metadata = {
  title: 'FreelanceHub',
  robots: { index: false, follow: false },
}

export default async function AIMeetingPage() {
  const user = await getSessionUser()
  if (!isAdmin(user)) notFound()
  return <AIMeeting />
}
