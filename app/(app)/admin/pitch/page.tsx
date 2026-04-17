import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import PitchDeck from './PitchDeck'

export const metadata = {
  title: 'Investor Pitch — FreelanceHub',
  robots: { index: false, follow: false },
}

export default async function PitchPage() {
  const user = await getSessionUser()
  // Auth gate: JWT claim or ADMIN_EMAIL fallback
  if (!isAdmin(user)) redirect('/auth/login')
  return <PitchDeck />
}
