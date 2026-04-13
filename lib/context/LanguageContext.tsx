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
  // ─────────────────────────────── ENGLISH (default) ───────────────────────────────
  en: {
    nav: {
      orders:      'Orders',
      freelancers: 'Freelancers',
      ai:          'AI Match',
      contracts:   'Contracts',
      agents:      'AI Agents',
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
    categories: {
      heading: 'Modern Skills',
      sub:     'Find a specialist or post a job in your niche',
      dev:         'Development',
      'ux-ui':     'UX/UI Design',
      smm:         'SMM',
      targeting:   'Targeting',
      copywriting: 'Copywriting',
      video:       'Video Editing',
      'tg-bots':   'Telegram Bots',
      'ai-ml':     'AI / ML',
      nocode:      'No-code',
      '3d-art':    '3D / AI Art',
    },
    howItWorks: {
      heading: 'How It Works',
      sub:     'Four simple steps to a completed project',
      step:    'Step',
      steps: [
        { title: 'Describe the task',   text: 'Tell the AI assistant what needs to be done. No complex forms — just write like you\'re talking to a friend.' },
        { title: 'AI finds the best',   text: 'Our algorithm analyzes skills, ratings and portfolio — and suggests the top 3 specialists.' },
        { title: 'Direct payment',      text: 'Client and freelancer agree directly — no middlemen or hidden fees.' },
        { title: 'Leave a review',      text: 'Your review helps other clients and boosts the freelancer\'s ranking in search.' },
      ],
    },
    aiFeatures: {
      badge:   'Powered by Claude AI',
      heading: 'Artificial Intelligence',
      sub:     'The first freelance platform with a real AI assistant built in',
      cta:     'Try AI Matching',
      features: [
        { title: 'AI Assistant',        text: 'Chat with the AI like a manager: describe the task → get top 3 ideal candidates with explanations.', badge: 'New' },
        { title: 'Price Advisor',       text: 'AI analyzes the market and suggests a fair budget for your task — don\'t overpay or undersell.', badge: 'Useful' },
        { title: 'Response Generator',  text: 'Freelancers: AI writes a compelling proposal based on your profile and skills. Save time.', badge: 'For Freelancers' },
      ],
    },
    cta: {
      badge:  'Free for the whole world',
      heading:'Ready to start?',
      sub:    'Registration is free. 0% commission. Pay any way you want.',
      tag:    '🇰🇿 Built in Kazakhstan · Open to the World',
      btn1:   'Post a Job',
      btn2:   'Become a Freelancer',
    },
    footer: {
      tagline:    'Decentralized freelance space for the whole world. 0% commission forever.',
      made:       '🇰🇿 Built in Kazakhstan · Sariyev IT Solutions',
      status:     'Platform is live',
      donate:     'Support the project',
      donateDesc: 'All funds go to promoting the platform so people worldwide can work for free',
      copyright:  '© 2025 FreelanceHub by SITS — 0% commission forever',
    },
  },

  // ─────────────────────────────── RUSSIAN ─────────────────────────────────────────
  ru: {
    nav: {
      orders:      'Заказы',
      freelancers: 'Фрилансеры',
      ai:          'AI‑подбор',
      contracts:   'Контракты',
      agents:      'AI Агенты',
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
    categories: {
      heading:     'Современные профессии',
      sub:         'Найдите специалиста или разместите заказ в своей нише',
      dev:         'Разработка',
      'ux-ui':     'UX/UI Дизайн',
      smm:         'SMM',
      targeting:   'Таргетинг',
      copywriting: 'Копирайтинг',
      video:       'Видеомонтаж',
      'tg-bots':   'Telegram-боты',
      'ai-ml':     'AI / ML',
      nocode:      'No-code',
      '3d-art':    '3D / AI-арт',
    },
    howItWorks: {
      heading: 'Как это работает',
      sub:     'Четыре простых шага до готового проекта',
      step:    'Шаг',
      steps: [
        { title: 'Опишите задачу',      text: 'Расскажите AI-ассистенту что нужно сделать. Не надо сложных форм — просто напишите как другу.' },
        { title: 'AI подберёт лучших',  text: 'Наш алгоритм анализирует навыки, рейтинг и портфолио — и предлагает топ-3 специалиста.' },
        { title: 'Прямая оплата',       text: 'Заказчик и фрилансер договариваются напрямую — без посредников и скрытых комиссий.' },
        { title: 'Оставьте отзыв',      text: 'Ваш отзыв помогает другим заказчикам и повышает рейтинг фрилансера в поиске.' },
      ],
    },
    aiFeatures: {
      badge:   'Powered by Claude AI',
      heading: 'Искусственный интеллект',
      sub:     'Глобальная фриланс-платформа с настоящим AI-ассистентом внутри',
      cta:     'Попробовать AI-подбор',
      features: [
        { title: 'AI-ассистент',       text: 'Общайтесь с ИИ как с менеджером: описываете задачу → получаете топ-3 идеальных кандидата с объяснением выбора.', badge: 'Новинка' },
        { title: 'Советник по цене',   text: 'ИИ анализирует рынок и подсказывает справедливый бюджет для вашей задачи — не переплатите и не продешевите.', badge: 'Полезно' },
        { title: 'Генератор откликов', text: 'Фрилансеры: ИИ пишет убедительный отклик на заказ на основе вашего профиля и навыков. Экономьте время.', badge: 'Для фрилансеров' },
      ],
    },
    cta: {
      badge:  'Бесплатно для всего мира',
      heading:'Готовы начать?',
      sub:    'Регистрация бесплатна. Комиссия 0%. Оплата любым способом.',
      tag:    '🇰🇿 Создано в Казахстане · Открыто для всего мира',
      btn1:   'Разместить заказ',
      btn2:   'Стать фрилансером',
    },
    footer: {
      tagline:    'Децентрализованное фриланс‑пространство для всего мира. 0% комиссии навсегда.',
      made:       '🇰🇿 Создано в Казахстане · Sariyev IT Solutions',
      status:     'Платформа запущена',
      donate:     'Поддержи проект донатом',
      donateDesc: 'Все средства идут на продвижение платформы, чтобы люди по всему миру могли работать бесплатно',
      copyright:  '© 2025 FreelanceHub by SITS — 0% комиссия навсегда',
    },
  },

  // ─────────────────────────────── KAZAKH ──────────────────────────────────────────
  kz: {
    nav: {
      orders:      'Тапсырыстар',
      freelancers: 'Фрилансерлер',
      ai:          'AI‑іздеу',
      contracts:   'Келісімшарт',
      agents:      'AI Агенттер',
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
      stat1v:   '0%',    stat1l: 'Комиссия',
      stat2v:   '∞',     stat2l: 'Елдер',
      stat3v:   'Тегін', stat3l: 'Мәңгіге',
      early:    '🚀 Платформа жаңа іске қосылды — бірінші болып қосылыңыз',
    },
    categories: {
      heading:     'Заманауи мамандықтар',
      sub:         'Маман табыңыз немесе тапсырысыңызды орналастырыңыз',
      dev:         'Әзірлеу',
      'ux-ui':     'UX/UI Дизайн',
      smm:         'SMM',
      targeting:   'Таргетинг',
      copywriting: 'Копирайтинг',
      video:       'Бейне монтаж',
      'tg-bots':   'Telegram боттары',
      'ai-ml':     'AI / ML',
      nocode:      'No-code',
      '3d-art':    '3D / AI өнері',
    },
    howItWorks: {
      heading: 'Қалай жұмыс істейді',
      sub:     'Дайын жобаға дейін төрт қарапайым қадам',
      step:    'Қадам',
      steps: [
        { title: 'Тапсырманы сипаттаңыз',    text: 'AI-көмекшіге не істеу керек екенін айтыңыз. Күрделі формалар жоқ — жай достыңызға жазғандай жазыңыз.' },
        { title: 'AI үздіктерді табады',      text: 'Алгоритм дағдыларды, рейтинг пен портфолионы талдап, үздік 3 маманды ұсынады.' },
        { title: 'Тікелей төлем',             text: 'Тапсырыс беруші мен фрилансер тікелей келіседі — делдалдар мен жасырын комиссиялар жоқ.' },
        { title: 'Пікір қалдырыңыз',          text: 'Сіздің пікіріңіз басқа тапсырыс берушілерге көмектеседі және фрилансердің іздеудегі рейтингін арттырады.' },
      ],
    },
    aiFeatures: {
      badge:   'Powered by Claude AI',
      heading: 'Жасанды интеллект',
      sub:     'ТМД үшін нақты AI-көмекшісі бар алғашқы фриланс платформа',
      cta:     'AI-іздеуді сынап көру',
      features: [
        { title: 'AI-көмекші',          text: 'ИИ-мен менеджердей сөйлесіңіз: тапсырманы сипаттаңыз → таңдау түсіндірмесімен үздік 3 кандидат алыңыз.', badge: 'Жаңалық' },
        { title: 'Баға кеңесшісі',      text: 'ИИ нарықты талдап, тапсырмаңыз үшін әділ бюджетті ұсынады — артық төлемеңіз немесе арзан бермеңіз.', badge: 'Пайдалы' },
        { title: 'Өтінім генераторы',   text: 'Фрилансерлер: ИИ профиліңіз бен дағдыларыңыз негізінде сенімді өтінім жазады. Уақытты үнемдеңіз.', badge: 'Фрилансерлерге' },
      ],
    },
    cta: {
      badge:  'Бүкіл әлем үшін тегін',
      heading:'Бастауға дайынсыз ба?',
      sub:    'Тіркелу тегін. Комиссия 0%. Кез келген тәсілмен төлеңіз.',
      tag:    '🇰🇿 Қазақстанда жасалды · Бүкіл әлемге ашық',
      btn1:   'Тапсырыс орналастыру',
      btn2:   'Фрилансер болу',
    },
    footer: {
      tagline:    'Бүкіл әлем үшін орталықсыздандырылған фриланс‑кеңістік. 0% комиссия мәңгіге.',
      made:       '🇰🇿 Қазақстанда жасалды · Sariyev IT Solutions',
      status:     'Платформа іске қосылды',
      donate:     'Жобаны қолдаңыз',
      donateDesc: 'Барлық қаражат бүкіл әлем бойынша адамдар тегін жұмыс істей алуы үшін жобаны насихаттауға жіберіледі',
      copyright:  '© 2025 FreelanceHub by SITS — 0% комиссия мәңгіге',
    },
  },
}

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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fh-lang') as Lang | null
      if (saved && (saved === 'ru' || saved === 'en')) {
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
