'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { T, LANG_LABELS, type Lang } from '@/lib/i18n/dict'

export { T, LANG_LABELS }
export type { Lang }

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof T['en']
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: T['en'],
})

function writeLangCookie(l: Lang) {
  try {
    document.cookie = `fh-lang=${l}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`
  } catch {}
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-lang') as Lang | null
      if (saved && (saved === 'ru' || saved === 'en' || saved === 'kz')) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(saved)
        writeLangCookie(saved)
        return
      }
      const nav = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : ''
      if (nav.startsWith('ru'))                              { setLangState('ru'); writeLangCookie('ru') }
      else if (nav.startsWith('kk') || nav.startsWith('kz')) { setLangState('kz'); writeLangCookie('kz') }
      else                                                   { writeLangCookie('en') }
    } catch {}
  }, [])

  const setLang = (l: Lang) => {
    try { localStorage.setItem('fh-lang', l) } catch {}
    writeLangCookie(l)
    setLangState(l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
