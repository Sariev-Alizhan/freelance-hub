import type { Metadata } from 'next'
import AboutContent from './AboutContent'
import { getServerT } from '@/lib/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT()
  return {
    title:       t.pages.about.title,
    description: t.pages.about.metaDesc,
    alternates:  { canonical: '/about' },
  }
}

export default function AboutPage() {
  return <AboutContent />
}
