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

export function LanguageProvider({ children, initialLang = 'ru' }: { children: React.ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-lang') as Lang | null
      if (saved && (saved === 'ru' || saved === 'en' || saved === 'kz')) {
        if (saved !== initialLang) setLangState(saved)
        writeLangCookie(saved)
      } else {
        // First-time visitor without a localStorage pick — persist the server's
        // detection so subsequent navigations skip detection and SSR is stable.
        writeLangCookie(initialLang)
      }
    } catch {}
  }, [initialLang])

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
