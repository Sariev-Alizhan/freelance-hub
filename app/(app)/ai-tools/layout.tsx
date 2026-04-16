import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tools Marketplace',
  description: 'Curated directory of the best AI tools for freelancers — writing, coding, design, video, audio, and more.',
}

export default function AIToolsLayout({ children }: { children: React.ReactNode }) {
  return children
}
