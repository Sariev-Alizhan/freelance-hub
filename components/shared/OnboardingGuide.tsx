'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, ArrowRight, ArrowLeft, Sparkles, Search, Bot, MessageCircle, CreditCard } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { useUser } from '@/lib/hooks/useUser'

const STORAGE_KEY = 'fh_tour_v2'

interface Step {
  icon: React.ReactNode
  color: string
  titleRu: string
  titleEn: string
  titleKz: string
  descRu: string
  descEn: string
  descKz: string
  link?: string
  linkLabelRu?: string
  linkLabelEn?: string
  linkLabelKz?: string
}

const STEPS: Step[] = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    color: 'var(--fh-primary)',
    titleRu: 'Добро пожаловать в FreelanceHub!',
    titleEn: 'Welcome to FreelanceHub!',
    titleKz: 'FreelanceHub-қа қош келдіңіз!',
    descRu: 'Фриланс-платформа, которой ты владеешь. 0% комиссии навсегда. Работай напрямую, плати как удобно — Kaspi, USDT, перевод.',
    descEn: 'A freelance platform you can own. 0% commission forever. Work directly, pay any way you want — Kaspi, USDT, bank transfer.',
    descKz: 'Өзіңізге тиесілі фриланс-платформа. 0% комиссия мәңгілік. Тікелей жұмыс жасаңыз, қалағаныңызша төлеңіз — Kaspi, USDT, аударым.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    color: '#27a644',
    titleRu: 'Найди заказ или фрилансера',
    titleEn: 'Find orders or freelancers',
    titleKz: 'Тапсырыс немесе фрилансер табыңыз',
    descRu: 'В разделе «Заказы» ищи проекты по категориям. В разделе «Фрилансеры» — лучших специалистов с рейтингом, отзывами и портфолио.',
    descEn: 'Browse "Orders" to find projects by category. Explore "Freelancers" to discover top-rated specialists with reviews and portfolios.',
    descKz: '«Тапсырыстар» бөлімінен санаттар бойынша жобалар табыңыз. «Фрилансерлер» бөлімінен рейтинглі мамандарды тауып алыңыз.',
    link: '/orders',
    linkLabelRu: 'Смотреть заказы →',
    linkLabelEn: 'Browse orders →',
    linkLabelKz: 'Тапсырыстарды көру →',
  },
  {
    icon: <Bot className="h-6 w-6" />,
    color: '#f59e0b',
    titleRu: 'AI-инструменты внутри',
    titleEn: 'Built-in AI tools',
    titleKz: 'Ішкі AI-құралдар',
    descRu: 'AI-подбор исполнителя, генератор контрактов, AI-ассистент, агенты для автоматизации задач — всё бесплатно для зарегистрированных пользователей.',
    descEn: 'AI freelancer matching, contract generator, AI assistant, automation agents — all free for registered users.',
    descKz: 'AI-іздеу, шарт генераторы, AI-көмекші, автоматтандыру агенттері — тіркелген пайдаланушылар үшін тегін.',
    link: '/agents',
    linkLabelRu: 'AI Агенты →',
    linkLabelEn: 'AI Agents →',
    linkLabelKz: 'AI Агенттер →',
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    color: '#29b6f6',
    titleRu: 'Общайся напрямую',
    titleEn: 'Chat directly',
    titleKz: 'Тікелей сөйлесіңіз',
    descRu: 'Встроенный мессенджер без посредников. Обсуждай условия, отправляй файлы, договаривайся о деталях — всё в одном месте.',
    descEn: 'Built-in messenger with no middlemen. Discuss terms, send files, and agree on details — all in one place.',
    descKz: 'Делдалсыз ішкі мессенджер. Шарттарды талқылаңыз, файлдар жіберіңіз, мәліметтерді келісіңіз — бәрі бір жерде.',
    link: '/messages',
    linkLabelRu: 'Открыть чат →',
    linkLabelEn: 'Open chat →',
    linkLabelKz: 'Чатты ашу →',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    color: '#ec4899',
    titleRu: 'Заполни профиль — начни зарабатывать',
    titleEn: 'Complete your profile — start earning',
    titleKz: 'Профильді толтырыңыз — табыс табыңыз',
    descRu: 'Заполни профиль фрилансера, добавь портфолио и навыки. Активируй Premium для попадания в топ поиска. Первый заказ ближе, чем думаешь.',
    descEn: 'Fill out your freelancer profile, add portfolio items and skills. Activate Premium to rank higher in search. Your first order is closer than you think.',
    descKz: 'Фрилансер профиліңізді толтырыңыз, портфолио мен дағдыларыңызды қосыңыз. Іздеуде жоғары шығу үшін Premium қосыңыз.',
    link: '/dashboard',
    linkLabelRu: 'Настроить профиль →',
    linkLabelEn: 'Set up profile →',
    linkLabelKz: 'Профильді баптау →',
  },
]

// Tour content targets logged-in users (links to /dashboard, /messages, /agents).
// Only show on landing-style surfaces where users are browsing. On focused work
// pages (order detail, chat thread, profile view, reel player) a modal-over-content
// is obtrusive and blocks the action the user came for.
const TOUR_ALLOWED_PATHS = ['/feed', '/explore', '/dashboard', '/orders', '/freelancers']

function shouldSkipTour(pathname: string | null): boolean {
  if (!pathname) return true
  return !TOUR_ALLOWED_PATHS.includes(pathname)
}

export default function OnboardingGuide() {
  const { lang } = useLang()
  const { user, loading } = useUser()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  // Tour is for authenticated users only — anonymous visitors landing on /orders
  // or /freelancers came to browse, not to sit through 5 onboarding steps.
  const allowed = !!user && !loading && !shouldSkipTour(pathname)

  useEffect(() => {
    if (!allowed) return
    try {
      if (localStorage.getItem(STORAGE_KEY)) return
    } catch { return }
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [allowed])

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else dismiss()
  }

  function prev() {
    if (step > 0) setStep(s => s - 1)
  }

  if (!allowed || !visible) return null

  const s = STEPS[step]
  const title = lang === 'ru' ? s.titleRu : lang === 'kz' ? s.titleKz : s.titleEn
  const desc  = lang === 'ru' ? s.descRu  : lang === 'kz' ? s.descKz  : s.descEn
  const linkLabel = lang === 'ru' ? s.linkLabelRu : lang === 'kz' ? s.linkLabelKz : s.linkLabelEn

  const nextLabel = step < STEPS.length - 1
    ? (lang === 'ru' ? 'Далее' : lang === 'kz' ? 'Келесі' : 'Next')
    : (lang === 'ru' ? 'Начать!' : lang === 'kz' ? 'Бастау!' : 'Let\'s go!')
  const skipLabel = lang === 'ru' ? 'Пропустить' : lang === 'kz' ? 'Өткізіп жіберу' : 'Skip tour'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 998,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.25s ease',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
          width: 'min(420px, calc(100vw - 32px))',
          background: 'var(--card)',
          border: '1px solid var(--fh-border-2)',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'var(--fh-surface-2)', border: 'none',
            borderRadius: '8px', padding: '5px', cursor: 'pointer',
            color: 'var(--fh-t4)',
          }}
        >
          <X size={14} />
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '5px', marginBottom: '18px' }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                height: '3px',
                borderRadius: '2px',
                cursor: 'pointer',
                flex: i === step ? 2 : 1,
                background: i === step ? s.color : 'var(--fh-border-2)',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: '14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${s.color}18`,
          color: s.color,
          marginBottom: '14px',
          border: `1px solid ${s.color}30`,
        }}>
          {s.icon}
        </div>

        {/* Content */}
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
          {title}
        </h3>
        <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--fh-t3)', marginBottom: '18px' }}>
          {desc}
        </p>

        {/* Quick link */}
        {s.link && linkLabel && (
          <a
            href={s.link}
            style={{
              display: 'inline-block', fontSize: '12px', fontWeight: 600,
              color: s.color, marginBottom: '16px', textDecoration: 'none',
            }}
          >
            {linkLabel}
          </a>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={prev}
            disabled={step === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '13px', fontWeight: 600,
              color: step === 0 ? 'var(--fh-t4)' : 'var(--fh-t2)',
              background: 'none', border: 'none', cursor: step === 0 ? 'default' : 'pointer',
              opacity: step === 0 ? 0.3 : 1,
            }}
          >
            <ArrowLeft size={14} />
            {lang === 'ru' ? 'Назад' : lang === 'kz' ? 'Артқа' : 'Back'}
          </button>

          <button
            onClick={dismiss}
            style={{
              fontSize: '12px', color: 'var(--fh-t4)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            {skipLabel}
          </button>

          <button
            onClick={next}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '8px 16px', borderRadius: '10px',
              background: s.color, color: '#fff',
              fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}
          >
            {nextLabel} <ArrowRight size={14} />
          </button>
        </div>

        {/* Step counter */}
        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--fh-t4)' }}>
          {step + 1} / {STEPS.length}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  )
}
