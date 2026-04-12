'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'ru' | 'kz' | 'en'

export const LANG_LABELS: Record<Lang, string> = {
  ru: 'RU',
  kz: 'KZ',
  en: 'EN',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const T: Record<Lang, any> = {
  ru: {
    nav: {
      orders:      'Заказы',
      freelancers: 'Фрилансеры',
      ai:          'AI‑подбор',
      contracts:   'Контракты',
    },
    auth: {
      login:    'Войти',
      register: 'Начать',
      logout:   'Выйти',
      dashboard:'Личный кабинет',
      messages: 'Сообщения',
    },
    hero: {
      badge1:   '🇰🇿 Создано в Казахстане · Открыто для всего мира',
      badge2:   'Без ограничений по региону',
      h1a:      'Децентрализованное',
      h1b:      'фриланс‑пространство',
      sub:      'Работайте напрямую. Без комиссий, без посредников. Оплачивайте как угодно — через Kaspi, USDT, банк или наличные.',
      geo:      'Казахстан · Россия · Украина · Беларусь · Грузия · и весь мир',
      cta1:     'Зарегистрироваться — бесплатно',
      cta2:     'Смотреть заказы',
      stat1v:   '0%',   stat1l: 'Комиссия',
      stat2v:   '∞',    stat2l: 'Страны',
      stat3v:   'Free', stat3l: 'Навсегда',
      early:    '🚀 Платформа только запустилась — присоединяйся первым',
    },
    footer: {
      tagline: 'Децентрализованное фриланс‑пространство для всего мира. 0% комиссии навсегда.',
      made:    '🇰🇿 Создано в Казахстане · Sariyev IT Solutions',
      status:  'Платформа запущена',
      donate:  'Поддержи проект донатом',
      donateDesc: 'Все средства идут на продвижение платформы, чтобы люди по всему миру могли работать бесплатно',
      copyright: '© 2025 FreelanceHub by SITS — 0% комиссия навсегда',
    },
  },

  kz: {
    nav: {
      orders:      'Тапсырыстар',
      freelancers: 'Фрилансерлер',
      ai:          'AI‑іздеу',
      contracts:   'Келісімшарт',
    },
    auth: {
      login:    'Кіру',
      register: 'Бастау',
      logout:   'Шығу',
      dashboard:'Жеке кабинет',
      messages: 'Хабарлар',
    },
    hero: {
      badge1:   '🇰🇿 Қазақстанда жасалды · Бүкіл әлемге ашық',
      badge2:   'Аймақтық шектеусіз',
      h1a:      'Орталықсыздандырылған',
      h1b:      'фриланс‑кеңістік',
      sub:      'Тікелей жұмыс істеңіз. Комиссиясыз, делдалсыз. Kaspi, USDT, банк немесе қолма‑қол — қалаған тәсілмен төлеңіз.',
      geo:      'Қазақстан · Ресей · Украина · Беларусь · Грузия · және бүкіл әлем',
      cta1:     'Тіркелу — тегін',
      cta2:     'Тапсырыстарды қарау',
      stat1v:   '0%',   stat1l: 'Комиссия',
      stat2v:   '∞',    stat2l: 'Елдер',
      stat3v:   'Тегін', stat3l: 'Мәңгіге',
      early:    '🚀 Платформа жаңа іске қосылды — бірінші болып қосылыңыз',
    },
    footer: {
      tagline: 'Бүкіл әлем үшін орталықсыздандырылған фриланс‑кеңістік. 0% комиссия мәңгіге.',
      made:    '🇰🇿 Қазақстанда жасалды · Sariyev IT Solutions',
      status:  'Платформа іске қосылды',
      donate:  'Жобаны қолдаңыз',
      donateDesc: 'Барлық қаражат бүкіл әлем бойынша адамдар тегін жұмыс істей алуы үшін жобаны насихаттауға жіберіледі',
      copyright: '© 2025 FreelanceHub by SITS — 0% комиссия мәңгіге',
    },
  },

  en: {
    nav: {
      orders:      'Orders',
      freelancers: 'Freelancers',
      ai:          'AI Match',
      contracts:   'Contracts',
    },
    auth: {
      login:    'Sign In',
      register: 'Get Started',
      logout:   'Sign Out',
      dashboard:'Dashboard',
      messages: 'Messages',
    },
    hero: {
      badge1:   '🇰🇿 Built in Kazakhstan · Open to the World',
      badge2:   'No Regional Restrictions',
      h1a:      'Decentralized',
      h1b:      'Freelance Space',
      sub:      'Work directly. No fees, no middlemen. Pay however you want — Kaspi, USDT, bank transfer, or cash.',
      geo:      'Kazakhstan · Russia · Ukraine · Belarus · Georgia · and the whole world',
      cta1:     'Register — it\'s free',
      cta2:     'Browse Orders',
      stat1v:   '0%',    stat1l: 'Commission',
      stat2v:   '∞',     stat2l: 'Countries',
      stat3v:   'Free',  stat3l: 'Forever',
      early:    '🚀 Platform just launched — be among the first',
    },
    footer: {
      tagline: 'Decentralized freelance space for the whole world. 0% commission forever.',
      made:    '🇰🇿 Built in Kazakhstan · Sariyev IT Solutions',
      status:  'Platform is live',
      donate:  'Support the project',
      donateDesc: 'All funds go to promoting the platform so people worldwide can work for free',
      copyright: '© 2025 FreelanceHub by SITS — 0% commission forever',
    },
  },
}

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: typeof T['ru']
}

const LangContext = createContext<LangContextValue>({
  lang: 'ru',
  setLang: () => {},
  t: T['ru'],
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ru')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-lang') as Lang | null
      if (saved && (saved === 'ru' || saved === 'kz' || saved === 'en')) {
        setLangState(saved)
      }
    } catch {}
  }, [])

  const setLang = (l: Lang) => {
    try { localStorage.setItem('fh-lang', l) } catch {}
    setLangState(l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
