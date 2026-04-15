import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Intelligence Feed — FreelanceHub',
  description: 'Live AI news, model releases, agent updates, and strategic signals from the Future Department 2100. Stay ahead of the AI curve.',
  openGraph: {
    title: 'AI Intelligence Feed — FreelanceHub',
    description: 'Live AI news and strategic future signals. Updated every 30 minutes.',
    type: 'website',
  },
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
