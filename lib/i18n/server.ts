import { cookies, headers } from 'next/headers'
import { T, type Lang } from '@/lib/context/LanguageContext'

function pickLang(cookieVal: string | undefined, acceptLang: string): Lang {
  if (cookieVal === 'ru' || cookieVal === 'kz' || cookieVal === 'en') return cookieVal
  const al = acceptLang.toLowerCase()
  if (al.startsWith('ru')) return 'ru'
  if (al.startsWith('kk') || al.startsWith('kz')) return 'kz'
  return 'en'
}

export async function getServerLang(): Promise<Lang> {
  const c = await cookies()
  const h = await headers()
  return pickLang(c.get('fh-lang')?.value, h.get('accept-language') ?? '')
}

export async function getServerT(): Promise<typeof T['en']> {
  const lang = await getServerLang()
  return T[lang]
}
