import type { Metadata } from 'next'
import AboutContent from './AboutContent'

export const metadata: Metadata = {
  title: 'About Us — FreelanceHub',
  description:
    'FreelanceHub is a global freelance platform built to remove barriers: no commissions, no complex registrations, no regional restrictions. Built in Almaty, open to the world.',
}

export default function AboutPage() {
  return <AboutContent />
}
