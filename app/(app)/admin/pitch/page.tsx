import { notFound } from 'next/navigation'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import PitchDeck from './PitchDeck'

export const metadata = {
  title: 'FreelanceHub',
  robots: { index: false, follow: false },
}

export default async function PitchPage() {
  const user = await getSessionUser()
  if (!isAdmin(user)) notFound()
  return <PitchDeck />
}
