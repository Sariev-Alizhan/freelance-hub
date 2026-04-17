import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import AIMeeting from './AIMeeting'

export const metadata = {
  title: 'AI Strategy Meeting — FreelanceHub Admin',
  robots: { index: false, follow: false },
}

export default async function AIMeetingPage() {
  const user = await getSessionUser()
  // Auth gate: JWT claim or ADMIN_EMAIL fallback
  if (!isAdmin(user)) redirect('/auth/login')
  return <AIMeeting />
}
