import type { Metadata } from 'next'
import VoteClient from './VoteClient'

export const metadata: Metadata = {
  title: 'Vote — FreelanceHub',
  description: 'You decide what we build next. Vote on features, submit ideas, shape the platform.',
  openGraph: {
    title: 'Vote on what we build next — FreelanceHub',
    description: 'Democratic feature voting. The most-voted ideas get built first.',
    type: 'website',
  },
  alternates: { canonical: '/vote' },
}

export default function VotePage() {
  return <VoteClient />
}
