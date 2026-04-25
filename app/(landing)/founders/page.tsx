import type { Metadata } from 'next'
import { getServerT, getServerLang } from '@/lib/i18n/server'
import FoundersClient from './FoundersClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang()
  const t = await getServerT()
  const localeMap: Record<string, string> = { ru: 'ru_RU', kz: 'kk_KZ', en: 'en_US' }
  const f = t.foundersPage
  return {
    title: `${f.metaTitle} — FreelanceHub`,
    description: f.metaDesc,
    openGraph: {
      title: `${f.metaTitle} — FreelanceHub`,
      description: f.metaDesc,
      type: 'website',
      locale: localeMap[lang] ?? 'ru_RU',
      siteName: 'FreelanceHub',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${f.metaTitle} — FreelanceHub`,
      description: f.metaDesc,
    },
    alternates: { canonical: '/founders' },
  }
}

export default function FoundersPage() {
  return <FoundersClient />
}
