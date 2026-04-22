'use client'
import Link from 'next/link'
import {
  Mail, AtSign, ArrowLeft, ExternalLink,
  Zap, MapPin, Globe, Shield,
  Sparkles, Heart, Copy, Check, Code2,
} from 'lucide-react'
import { useState } from 'react'
import { useLang as useLanguage } from '@/lib/context/LanguageContext'

const CONTENT = {
  en: {
    back: 'Back to home',
    sectionStory: 'Our story',
    sectionStack: 'Tech stack',
    sectionValues: 'Our values',
    sectionSupport: 'Support the project',

    heroTitle: 'About FreelanceHub',
    heroSub: 'A global platform for modern professionals. Built from scratch, without commissions, without barriers.',
    heroBadge: 'Almaty, Kazakhstan · Open to the World',

    story: [
      {
        icon: MapPin,
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.08)',
        title: 'Where it started',
        text: 'FreelanceHub was born in Almaty, Kazakhstan. We know firsthand how hard it is to break into freelancing — especially from a region where global platforms feel like they were built for someone else.',
      },
      {
        icon: Zap,
        color: '#e5484d',
        bg: 'rgba(229,72,77,0.08)',
        title: 'The problem',
        text: 'Most freelance platforms meant mandatory subscriptions, 20% commissions, complicated registration, and regional payment walls. Local platforms focused on home services — cleaning, repairs — not modern digital professions.',
      },
      {
        icon: Sparkles,
        color: '#27a644',
        bg: 'rgba(39,166,68,0.08)',
        title: 'The idea',
        text: 'We built the platform we always wanted: clients and specialists connect directly, agree on payment in any way that works — Kaspi, USDT, bank transfer, cash. No middlemen taking a cut.',
      },
      {
        icon: Globe,
        color: '#27a644',
        bg: 'rgba(39,166,68,0.08)',
        title: 'Built for the world',
        text: 'We started locally, but the idea is universal. No regional blocks. Work from anywhere, with anyone. Developers, designers, marketers, analysts — every modern profession is welcome. 0% commission, forever.',
      },
    ],

    values: {
      text: 'FreelanceHub is a direct-connection space — clients and freelancers agree on everything themselves. Payment happens any way you like: Kaspi, Freedom, USDT, wire transfer, cash. No commissions. No platform lock-in. No regional restrictions.',
      strong: 'Pay however works for you — we stay out of the way.',
    },

    manifesto: 'We believe skilled people everywhere deserve equal access to fair work. No matter where you are, what currency you use, or what bank you have — if you have a skill and a client needs it, you should be able to work together.',

    ctaOrders: 'Find orders',
    ctaRegister: 'Create account',

    donate: 'The platform is free and will stay that way. If you want to help — support us with a donation. All funds go toward growing the community so more professionals worldwide can work without fees.',
    donateRecipient: 'Recipient: FreelanceHub · SITS Sariyev IT Solutions',

    stats: [
      { label: 'Commission', value: '0%', color: '#27a644' },
      { label: 'Countries',  value: 'Global', color: '#27a644' },
      { label: 'AI model',   value: 'Claude', color: '#fbbf24' },
    ],

    contacts: 'Contact',
    copyTitle: 'Copy number',
    rolesTitle: 'Built by',
    roles: [
      { title: 'Founder & Full-Stack Developer', org: 'FreelanceHub', desc: 'Built every line from scratch: Next.js 16, Supabase, Claude AI integrations, PWA, real-time messaging. Solo.' },
      { title: 'CEO & Co-Founder', org: 'SITS', desc: 'Sariyev IT Solutions — Almaty-based IT company. Development, automation, AI, Telegram bots, web platforms.' },
      { title: 'Co-Founder', org: 'Tengri Yurt', desc: 'Platform connecting Central Asian culture and business. tengri-yurt.kz' },
    ],

    founderTitle: 'About the Founder',
    founderName: 'Alizhan Sariyev',
    founderBio: 'Developer, entrepreneur, and AI enthusiast from Almaty, Kazakhstan. Building tools that give everyone equal access to digital opportunity — regardless of geography, language, or currency.',
    founderTimeline: [
      { year: '2026', label: 'FreelanceHub', desc: 'Launched a global decentralized freelance platform built entirely solo. 0% commission, AI-powered, designed for the world.' },
      { year: '2025', label: 'GrandGames', desc: 'Deputy Director at GrandGames (Almaty). Game development and company growth strategy.' },
      { year: '2024', label: 'RedPadGames — Dustland', desc: 'Frontend Game Developer at RedPadGames (Almaty). Built gameplay UI for Dustland using Unreal Engine 5.' },
      { year: '2023', label: 'SITS & AI Journey', desc: 'Founded Sariyev IT Solutions. Began deep dive into AI: Claude, GPT, prompt engineering, Telegram bots, automation.' },
    ],
    founderSkills: ['Next.js', 'TypeScript', 'React', 'Supabase', 'Claude AI', 'Python', 'Telegram Bots', 'C++', 'Unreal Engine 5', 'PostgreSQL'],
    founderLangs: ['Kazakh', 'Russian', 'English', 'Turkish', 'Korean (learning)', 'AI / Prompting'],
    founderEdu: 'Kazakh-Turkish High School · Issyk, Kazakhstan',
    founderProjects: [
      { name: 'FreelanceHub', url: 'https://www.freelance-hub.kz', desc: 'Global freelance platform' },
      { name: 'Tengri Yurt', url: 'https://tengri-yurt.kz', desc: 'Central Asian culture & business hub' },
      { name: 'SITS', url: 'https://www.instagram.com/sariyev.it.solutions/', desc: 'IT company portfolio' },
      { name: 'Telegram Bot', url: 'https://t.me/FreelanceHubKZBot', desc: 'FreelanceHub notifications bot' },
    ],
  },

  ru: {
    back: 'На главную',
    sectionStory: 'История проекта',
    sectionStack: 'Технологии',
    sectionValues: 'Ценности',
    sectionSupport: 'Поддержи проект',

    heroTitle: 'О нас',
    heroSub: 'Глобальная платформа для современных специалистов. Без комиссий, без барьеров, без лишних ограничений.',
    heroBadge: 'Алматы, Казахстан · Открыты для всего мира',

    story: [
      {
        icon: MapPin,
        color: '#fbbf24',
        bg: 'rgba(251,191,36,0.08)',
        title: 'Откуда всё началось',
        text: 'FreelanceHub родился в Алматы, Казахстан. Мы на своём опыте знаем, как сложно войти в мир фриланса — особенно оттуда, где зарубежные платформы созданы будто не для тебя.',
      },
      {
        icon: Zap,
        color: '#e5484d',
        bg: 'rgba(229,72,77,0.08)',
        title: 'Проблема',
        text: 'Большинство фриланс-платформ требуют обязательных подписок, берут 20% комиссии, имеют запутанную регистрацию и региональные ограничения по оплате. Местные платформы ориентированы на бытовые услуги — уборку, ремонт — но не на современные цифровые профессии.',
      },
      {
        icon: Sparkles,
        color: '#27a644',
        bg: 'rgba(39,166,68,0.08)',
        title: 'Идея',
        text: 'Мы построили платформу, которую всегда хотели видеть сами: клиенты и специалисты общаются напрямую и договариваются об оплате любым удобным способом — Kaspi, USDT, банковский перевод, наличные. Без посредников.',
      },
      {
        icon: Globe,
        color: '#27a644',
        bg: 'rgba(39,166,68,0.08)',
        title: 'Для всего мира',
        text: 'Мы начали локально, но идея универсальная. Никаких региональных блокировок. Работай откуда угодно, с кем угодно. Разработчики, дизайнеры, маркетологи, аналитики — любая современная профессия здесь. 0% комиссии навсегда.',
      },
    ],

    values: {
      text: 'FreelanceHub — это пространство прямого взаимодействия. Клиенты и фрилансеры обо всём договариваются сами. Оплата — как удобно: Kaspi, Freedom, USDT, банковский перевод, наличные. Без комиссий. Без посредников. Без региональных ограничений.',
      strong: 'Платите как вам удобно — мы не вмешиваемся.',
    },

    manifesto: 'Мы верим, что квалифицированные люди по всему миру заслуживают равного доступа к достойной работе. Независимо от того, где ты находишься, какую валюту используешь и какой у тебя банк — если у тебя есть навык, а клиенту он нужен, вы должны иметь возможность работать вместе.',

    ctaOrders: 'Найти заказ',
    ctaRegister: 'Зарегистрироваться',

    donate: 'Платформа бесплатная и такой останется. Если хочешь помочь — поддержи донатом. Все средства идут на развитие сообщества, чтобы всё больше специалистов по всему миру могли работать без комиссий.',
    donateRecipient: 'Получатель: FreelanceHub · SITS Sariyev IT Solutions',

    stats: [
      { label: 'Комиссия', value: '0%',         color: '#27a644' },
      { label: 'Страны',   value: 'Весь мир',    color: '#27a644' },
      { label: 'AI-модель', value: 'Claude',     color: '#fbbf24' },
    ],

    contacts: 'Контакты',
    copyTitle: 'Скопировать номер',
    rolesTitle: 'Кто создаёт',
    roles: [
      { title: 'Founder & Full-Stack Developer', org: 'FreelanceHub', desc: 'Написал каждую строку с нуля: Next.js 16, Supabase, Claude AI, PWA, чат в реальном времени. В одиночку.' },
      { title: 'CEO & Co-Founder', org: 'SITS', desc: 'Sariyev IT Solutions — IT-компания из Алматы. Разработка, автоматизация, AI, Telegram-боты, веб-платформы.' },
      { title: 'Co-Founder', org: 'Tengri Yurt', desc: 'Платформа для культуры и бизнеса Центральной Азии. tengri-yurt.kz' },
    ],

    founderTitle: 'Об основателе',
    founderName: 'Алижан Сариев',
    founderBio: 'Разработчик, предприниматель и AI-энтузиаст из Алматы, Казахстан. Создаёт инструменты, дающие каждому равный доступ к цифровым возможностям — вне зависимости от географии, языка или валюты.',
    founderTimeline: [
      { year: '2026', label: 'FreelanceHub', desc: 'Запустил глобальную децентрализованную фриланс-платформу полностью самостоятельно. 0% комиссии, AI-функции, рассчитана на весь мир.' },
      { year: '2025', label: 'GrandGames', desc: 'Заместитель директора в GrandGames (Алматы). Разработка игр и стратегия развития компании.' },
      { year: '2024', label: 'RedPadGames — Dustland', desc: 'Frontend Game Developer в RedPadGames (Алматы). Разработка игрового UI для Dustland на Unreal Engine 5.' },
      { year: '2023', label: 'SITS & путь в AI', desc: 'Основал Sariyev IT Solutions. Начал глубокое погружение в AI: Claude, GPT, промпт-инжиниринг, Telegram-боты, автоматизация.' },
    ],
    founderSkills: ['Next.js', 'TypeScript', 'React', 'Supabase', 'Claude AI', 'Python', 'Telegram Боты', 'C++', 'Unreal Engine 5', 'PostgreSQL'],
    founderLangs: ['Казахский', 'Русский', 'Английский', 'Турецкий', 'Корейский (изучаю)', 'AI / Промптинг'],
    founderEdu: 'Казахско-Турецкий лицей-Интернат · г. Иссык, Казахстан',
    founderProjects: [
      { name: 'FreelanceHub', url: 'https://www.freelance-hub.kz', desc: 'Глобальная фриланс-платформа' },
      { name: 'Tengri Yurt', url: 'https://tengri-yurt.kz', desc: 'Культура и бизнес Центральной Азии' },
      { name: 'SITS', url: 'https://www.instagram.com/sariyev.it.solutions/', desc: 'IT-компания' },
      { name: 'Telegram Bot', url: 'https://t.me/FreelanceHubKZBot', desc: 'Бот уведомлений FreelanceHub' },
    ],
  },
}

const TECH = ['Next.js 16', 'TypeScript', 'Supabase', 'PostgreSQL', 'Claude AI', 'Tailwind CSS', 'Framer Motion', 'Resend']

const CONTACTS = [
  { icon: Mail,         href: 'mailto:raimzhan1907@gmail.com',                               display: 'raimzhan1907@gmail.com' },
  { icon: AtSign,       href: 'https://www.instagram.com/zhanmate_zhan/?hl=ru',              display: '@zhanmate_zhan' },
  { icon: AtSign,       href: 'https://www.instagram.com/sariyev.it.solutions/?hl=ru',       display: '@sariyev.it.solutions' },
  { icon: ExternalLink, href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/',     display: 'LinkedIn' },
]

const DONATE_CARDS = [
  {
    label: 'Kaspi',
    number: '4400 4303 1167 6685',
    raw: '4400430311676685',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.07)',
    border: 'rgba(251,191,36,0.2)',
  },
  {
    label: 'Freedom Bank',
    number: '4002 8900 3407 5055',
    raw: '4002890034075055',
    color: '#27a644',
    bg: 'rgba(39,166,68,0.06)',
    border: 'rgba(39,166,68,0.18)',
  },
]

const ROLE_ICONS = [Code2, Globe, MapPin]
const ROLE_COLORS = [
  { color: '#27a644', bg: 'rgba(39,166,68,0.08)' },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  { color: '#27a644', bg: 'rgba(39,166,68,0.08)' },
]

function CopyCard({ card, copyTitle }: { card: typeof DONATE_CARDS[0]; copyTitle: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(card.raw).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div
      className="flex items-center justify-between rounded-none p-4"
      style={{ background: card.bg, border: `1px solid ${card.border}` }}
    >
      <div>
        <p style={{ fontSize: '11px', fontWeight: 590, color: card.color, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {card.label}
        </p>
        <p style={{ fontSize: '15px', fontWeight: 590, color: card.color, letterSpacing: '0.08em', fontFamily: 'monospace' }}>
          {card.number}
        </p>
      </div>
      <button
        onClick={copy}
        className="flex items-center justify-center h-8 w-8 rounded-lg transition-all"
        style={{ background: `${card.color}20`, color: card.color }}
        title={copyTitle}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  )
}

function ExtLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 transition-all"
      style={{
        padding: '6px 12px',
        borderRadius: '6px',
        background: 'var(--fh-surface)',
        border: '1px solid var(--fh-border-2)',
        fontSize: '12px',
        color: 'var(--fh-t3)',
        fontWeight: 400,
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)'; e.currentTarget.style.background = 'var(--fh-surface-3)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t3)'; e.currentTarget.style.background = 'var(--fh-surface)' }}
    >
      {children}
    </a>
  )
}

export default function AboutContent() {
  const { lang } = useLanguage()
  const c = lang === 'ru' ? CONTENT.ru : CONTENT.en

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12" style={{ minHeight: 'calc(100vh - 52px)' }}>
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-10 transition-colors"
        style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400 }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {c.back}
      </Link>

      {/* Editorial hero */}
      <div
        className="rounded-none p-8 mb-6 relative overflow-hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--fh-border)' }}
      >
        <div
          aria-hidden
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(39,166,68,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="relative">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--fh-t3)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 24, height: 2, borderRadius: 2,
                background: '#27a644',
                boxShadow: '0 0 12px rgba(39,166,68,0.55)',
              }}
            />
            <MapPin className="h-3 w-3" />
            <span>{c.heroBadge}</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(30px, 5vw, 48px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: 'var(--fh-t1)',
              margin: 0,
              lineHeight: 1.0,
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            {c.heroTitle.split(' ').slice(0, -1).join(' ')}{' '}
            <span
              style={{
                fontFamily: 'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.01em',
              }}
            >
              {c.heroTitle.split(' ').slice(-1)[0]}
            </span>
          </h1>
          <p
            style={{
              marginTop: 12,
              marginBottom: 0,
              fontSize: 15,
              color: 'var(--fh-t3)',
              lineHeight: 1.7,
              fontWeight: 400,
              maxWidth: 560,
            }}
          >
            {c.heroSub}
          </p>
        </div>
      </div>

      {/* Story */}
      <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {c.sectionStory}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {c.story.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.title} className="rounded-none p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center mb-4" style={{ background: s.bg }}>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65, fontWeight: 400, letterSpacing: '-0.01em' }}>{s.text}</p>
            </div>
          )
        })}
      </div>

      {/* Values / Manifesto */}
      <div className="rounded-none p-6 mb-6" style={{ background: 'rgba(39,166,68,0.04)', border: '1px solid rgba(39,166,68,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4" style={{ color: '#27a644' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>{c.sectionValues}</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--fh-t3)', lineHeight: 1.75, fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '12px' }}>
          {c.values.text}{' '}
          <strong style={{ color: 'var(--fh-t2)', fontWeight: 590 }}>{c.values.strong}</strong>
        </p>
        <p style={{ fontSize: '13px', color: 'var(--fh-t4)', lineHeight: 1.7, fontStyle: 'italic' }}>
          {c.manifesto}
        </p>
        <div className="mt-5 flex gap-2.5 flex-wrap">
          <Link
            href="/orders"
            className="transition-all"
            style={{ padding: '9px 20px', borderRadius: '6px', background: '#27a644', color: '#ffffff', fontSize: '14px', fontWeight: 510 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1f8a37' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#27a644' }}
          >
            {c.ctaOrders}
          </Link>
          <Link
            href="/auth/register"
            className="transition-all"
            style={{ padding: '9px 20px', borderRadius: '6px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t2)', fontSize: '14px', fontWeight: 510 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
          >
            {c.ctaRegister}
          </Link>
        </div>
      </div>

      {/* Built by */}
      <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {c.rolesTitle}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        {c.roles.map((r, i) => {
          const Icon = ROLE_ICONS[i]
          const { color, bg } = ROLE_COLORS[i]
          return (
            <div key={r.org} className="rounded-none p-5 flex flex-col gap-3" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{r.title}</p>
                <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>{r.org}</p>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6, fontWeight: 400 }}>{r.desc}</p>
            </div>
          )
        })}
      </div>

      {/* ── Founder Section ───────────────────────────────────────────── */}
      <div className="rounded-none p-6 mb-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}>
        <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {c.founderTitle}
        </p>

        {/* Founder header */}
        <div className="flex items-start gap-4 mb-5">
          <div style={{
            width: 60, height: 60, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(39,166,68,0.2), rgba(39,166,68,0.15))',
            border: '2px solid rgba(39,166,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#27a644', letterSpacing: '-0.03em' }}>AS</span>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--fh-t1)', marginBottom: 4 }}>{c.founderName}</h3>
            <p style={{ fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.6 }}>{c.founderBio}</p>
            <p style={{ fontSize: 11, color: 'var(--fh-t4)', marginTop: 4 }}>{c.founderEdu}</p>
          </div>
        </div>

        {/* Career timeline */}
        <div className="mb-5" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {c.founderTimeline.map(t => (
            <div key={t.year} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ minWidth: 36, paddingTop: 2 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#27a644', letterSpacing: '-0.01em' }}>{t.year}</div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--fh-t1)', marginBottom: 2 }}>{t.label}</p>
                <p style={{ fontSize: 12, color: 'var(--fh-t4)', lineHeight: 1.5 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Languages */}
        <div className="mb-4">
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            {lang === 'ru' ? 'Языки' : 'Languages'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.founderLangs.map(l => (
              <span key={l} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.18)', fontSize: 12, fontWeight: 600, color: '#27a644' }}>
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            {lang === 'ru' ? 'Технологии' : 'Tech Stack'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {c.founderSkills.map(s => (
              <span key={s} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.18)', fontSize: 12, fontWeight: 600, color: '#27a644' }}>
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>
            {lang === 'ru' ? 'Проекты' : 'Projects'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {c.founderProjects.map(p => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', padding: '8px 12px', borderRadius: 10,
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                  textDecoration: 'none', minWidth: 100,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--fh-t1)' }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--fh-t4)', marginTop: 1 }}>{p.desc}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div className="rounded-none p-5 mb-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
        <p className="mb-3" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {c.sectionStack}
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map(t => (
            <span key={t} style={{ padding: '4px 10px', borderRadius: '5px', background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.18)', fontSize: '12px', fontWeight: 510, color: '#27a644' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="rounded-none p-5 mb-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
        <p className="mb-3" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {c.contacts}
        </p>
        <div className="flex flex-wrap gap-2">
          {CONTACTS.map((contact) => {
            const Icon = contact.icon
            return (
              <ExtLink key={contact.href} href={contact.href}>
                <Icon className="h-3.5 w-3.5" />
                {contact.display}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </ExtLink>
            )
          })}
        </div>
      </div>

      {/* Donate */}
      <div
        className="rounded-none p-6 mb-6"
        style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4" style={{ color: '#fbbf24' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
            {c.sectionSupport}
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65, fontWeight: 400, marginBottom: '16px' }}>
          {c.donate}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DONATE_CARDS.map(card => (
            <CopyCard key={card.label} card={card} copyTitle={c.copyTitle} />
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginTop: '12px', fontWeight: 400 }}>
          {c.donateRecipient}
        </p>
      </div>

      {/* Specimen-label strip — editorial metadata line */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          paddingTop: 20,
          borderTop: '1px solid var(--fh-border)',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--fh-t3)',
        }}
      >
        {c.stats.map((s, i) => (
          <span key={s.label} style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
            {i > 0 && <span style={{ color: 'var(--fh-t4)' }}>—</span>}
            <span>{s.label}</span>
            <span style={{ color: 'var(--fh-t1)' }}>{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
