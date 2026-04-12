'use client'
import Link from 'next/link'
import {
  Mail, AtSign, ArrowLeft, ExternalLink,
  Briefcase, Globe, Zap, MapPin, Code2,
  Sparkles, Shield,
} from 'lucide-react'

const STORY_POINTS = [
  {
    icon: MapPin,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    title: 'Живу в Казахстане',
    text: 'Работаю как разработчик из Казахстана и постоянно сталкивался с тем, что зарубежные фриланс-платформы неудобны: непонятный интерфейс, сложные платежи и везде — высокая комиссия.',
  },
  {
    icon: Zap,
    color: '#e5484d',
    bg: 'rgba(229,72,77,0.08)',
    title: 'Проблема, которую решаю',
    text: 'Я устал платить 20% комиссии Upwork и разбираться в сложных формах Fiverr. Решил: если хочешь удобный инструмент — сделай сам.',
  },
  {
    icon: Sparkles,
    color: '#7170ff',
    bg: 'rgba(113,112,255,0.08)',
    title: 'Идея FreelanceHub',
    text: 'Платформа, где специалисты СНГ общаются напрямую с заказчиками. Без посредников, без скрытых платежей. С встроенным AI-ассистентом для умного подбора.',
  },
  {
    icon: Globe,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    title: 'Планы на будущее',
    text: 'Сначала — Казахстан, Россия, Украина. Затем — международная версия для всего мира. Всегда 0% комиссии.',
  },
]

const ROLES = [
  {
    icon: Code2,
    color: '#7170ff',
    bg: 'rgba(113,112,255,0.08)',
    title: 'Founder & Developer',
    org: 'FreelanceHub',
    desc: 'Полный стек: Next.js, Supabase, AI-интеграции. Написал платформу с нуля.',
  },
  {
    icon: Globe,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    title: 'Co-Founder',
    org: 'Tengri Yurt',
    desc: 'Соосновал платформу, объединяющую культуру и бизнес Центральной Азии.',
  },
  {
    icon: Briefcase,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    title: 'Deputy of CEO',
    org: 'Grand Games',
    desc: 'Заместитель генерального директора в игровой компании Grand Games.',
  },
]

const TECH = ['Next.js 16', 'TypeScript', 'Supabase', 'PostgreSQL', 'Claude AI', 'Tailwind CSS', 'Framer Motion', 'Resend']

const CONTACTS = [
  { icon: Mail,         href: 'mailto:raimzhan1907@gmail.com',                                      display: 'raimzhan1907@gmail.com' },
  { icon: AtSign,       href: 'https://www.instagram.com/zhanmate_zhan/?hl=ru',                     display: '@zhanmate_zhan' },
  { icon: ExternalLink, href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/',             display: 'LinkedIn' },
]

function Hover({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 transition-all"
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '12px',
        color: '#8a8f98',
        fontWeight: 400,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = '#d0d6e0'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#8a8f98';  e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
    >
      {children}
    </a>
  )
}

export default function AboutContent() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12" style={{ minHeight: 'calc(100vh - 52px)' }}>
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-10 transition-colors"
        style={{ fontSize: '13px', color: '#62666d', fontWeight: 400 }}
        onMouseEnter={e => { e.currentTarget.style.color = '#d0d6e0' }}
        onMouseLeave={e => { e.currentTarget.style.color = '#62666d' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> На главную
      </Link>

      {/* Hero card */}
      <div
        className="rounded-xl p-8 mb-4 relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(113,112,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div
            className="h-20 w-20 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #5e6ad2 0%, #7170ff 100%)', boxShadow: '0 4px 24px rgba(94,106,210,0.3)' }}
          >
            <span style={{ fontSize: '24px', fontWeight: 590, color: '#ffffff', letterSpacing: '-0.02em' }}>АС</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 510, letterSpacing: '-0.04em', color: '#f7f8f8', fontFeatureSettings: '"cv01", "ss03"' }}>
                Сариев Алижан Сабитулы
              </h1>
              <span
                className="inline-flex items-center gap-1 rounded-full"
                style={{ padding: '2px 10px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '11px', fontWeight: 590, color: '#fbbf24' }}
              >
                <MapPin className="h-3 w-3" /> Казахстан
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '12px' }}>
              Full-stack разработчик · Основатель FreelanceHub
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTACTS.map((c) => {
                const Icon = c.icon
                return (
                  <Hover key={c.href} href={c.href}>
                    <Icon className="h-3.5 w-3.5" />
                    {c.display}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Hover>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Story */}
      <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: '#62666d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        История проекта
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {STORY_POINTS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.title} className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-4" style={{ background: s.bg }}>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 590, color: '#f7f8f8', marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: '#8a8f98', lineHeight: 1.65, fontWeight: 400, letterSpacing: '-0.01em' }}>{s.text}</p>
            </div>
          )
        })}
      </div>

      {/* Tech stack */}
      <div className="rounded-xl p-5 mb-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="mb-3" style={{ fontSize: '11px', fontWeight: 590, color: '#62666d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Технологический стек
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map(t => (
            <span key={t} style={{ padding: '4px 10px', borderRadius: '5px', background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.18)', fontSize: '12px', fontWeight: 510, color: '#7170ff' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Roles */}
      <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: '#62666d', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Позиции
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        {ROLES.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.org} className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: r.bg }}>
                <Icon className="h-5 w-5" style={{ color: r.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#62666d', fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{r.title}</p>
                <p style={{ fontSize: '14px', fontWeight: 590, color: '#f7f8f8', letterSpacing: '-0.02em' }}>{r.org}</p>
              </div>
              <p style={{ fontSize: '13px', color: '#8a8f98', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>{r.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Manifesto */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(94,106,210,0.04)', border: '1px solid rgba(94,106,210,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4" style={{ color: '#7170ff' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 590, color: '#f7f8f8', letterSpacing: '-0.02em' }}>Манифест платформы</h2>
        </div>
        <p style={{ fontSize: '14px', color: '#8a8f98', lineHeight: 1.75, fontWeight: 400, letterSpacing: '-0.01em' }}>
          FreelanceHub создан разработчиком для разработчиков и специалистов. Я сам столкнулся с тем, насколько неудобны зарубежные платформы — непрозрачные комиссии, сложная регистрация, платёжные барьеры для СНГ. FreelanceHub — это ответ:{' '}
          <strong style={{ color: '#d0d6e0', fontWeight: 590 }}>простой интерфейс, прямые сделки, 0% комиссии и AI-ассистент</strong>, который подбирает специалистов умнее любого фильтра.
        </p>
        <div className="mt-5 flex gap-2.5 flex-wrap">
          <Link
            href="/orders"
            className="transition-all"
            style={{ padding: '9px 20px', borderRadius: '6px', background: '#5e6ad2', color: '#ffffff', fontSize: '14px', fontWeight: 510 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
          >
            Найти заказ
          </Link>
          <Link
            href="/auth/register"
            className="transition-all"
            style={{ padding: '9px 20px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d0d6e0', fontSize: '14px', fontWeight: 510 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Комиссия', value: '0%', color: '#27a644' },
          { label: 'Страны СНГ', value: '5+', color: '#7170ff' },
          { label: 'AI-модель', value: 'Claude', color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '20px', fontWeight: 590, color: s.color, marginBottom: '4px', letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: '#62666d', fontWeight: 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
