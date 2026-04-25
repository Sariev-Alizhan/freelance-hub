import type { Metadata } from 'next'
import { getServerT } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT()
  return {
    title: t.pages.agents.title,
    description: t.pages.agents.metaDesc,
    alternates: { canonical: '/agents' },
  }
}

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children
}
