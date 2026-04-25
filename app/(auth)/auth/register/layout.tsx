import type { Metadata } from 'next'
import { getServerT } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT()
  return {
    title: `${t.registerPage.title} — FreelanceHub`,
    alternates: { canonical: '/auth/register' },
    robots: { index: false, follow: false },
  }
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
