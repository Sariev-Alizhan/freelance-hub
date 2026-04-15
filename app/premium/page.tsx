import type { Metadata } from 'next'
import PremiumClient from './PremiumClient'

export const metadata: Metadata = {
  title: 'Premium — FreelanceHub',
  description: 'Upgrade to Premium and get unlimited proposals, top search placement, priority support, and more.',
  alternates: { canonical: '/premium' },
}

export default function PremiumPage() {
  return <PremiumClient />
}
