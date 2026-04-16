import type { Metadata } from 'next'
import BlockBlast from './BlockBlast'

export const metadata: Metadata = {
  title: 'FreelanceHub Play — Block Blast',
  description: 'Take a break and play Block Blast. Compete on the global leaderboard with other freelancers.',
}

export default function PlayPage() {
  return <BlockBlast />
}
