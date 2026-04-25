import type { Metadata } from 'next'
import { getServerT } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT()
  return {
    title: `${t.loginPage.title} — FreelanceHub`,
    alternates: { canonical: '/auth/login' },
    robots: { index: false, follow: false },
  }
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
