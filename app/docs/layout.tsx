import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation — FreelanceHub',
  description: 'Complete guide to FreelanceHub: how to find freelancers, post orders, use AI tools, set up payments, and everything in between.',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
