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
        color: '#7170ff',
        bg: 'rgba(113,112,255,0.08)',
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
      { label: 'Countries',  value: 'Global', color: '#7170ff' },
      { label: 'AI model',   value: 'Claude', color: '#fbbf24' },
    ],

    contacts: 'Contact',
    copyTitle: 'Copy number',
    rolesTitle: 'Built by',
    roles: [
      { title: 'Founder & Developer', org: 'FreelanceHub', desc: 'Full-stack: Next.js, Supabase, AI integrations. Built from the ground up.' },
      { title: 'CEO & Co-Founder',    org: 'SITS',          desc: 'Sariyev IT Solutions — IT company from Kazakhstan. Development, automation, AI.' },
      { title: 'Co-Founder',          org: 'Tengri Yurt',   desc: 'A platform connecting culture and business across Central Asia.' },
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
        color: '#7170ff',
        bg: 'rgba(113,112,255,0.08)',
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
      { label: 'Страны',   value: 'Весь мир',    color: '#7170ff' },
      { label: 'AI-модель', value: 'Claude',     color: '#fbbf24' },
    ],

    contacts: 'Контакты',
    copyTitle: 'Скопировать номер',
    rolesTitle: 'Кто создаёт',
    roles: [
      { title: 'Founder & Developer', org: 'FreelanceHub', desc: 'Полный стек: Next.js, Supabase, AI-интеграции. Написал платформу с нуля.' },
      { title: 'CEO & Co-Founder',    org: 'SITS',          desc: 'Sariyev IT Solutions — IT-компания из Казахстана. Разработка, автоматизация, AI.' },
      { title: 'Co-Founder',          org: 'Tengri Yurt',   desc: 'Платформа, объединяющая культуру и бизнес Центральной Азии.' },
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
  { color: '#7170ff', bg: 'rgba(113,112,255,0.08)' },
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
      className="flex items-center justify-between rounded-xl p-4"
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

      {/* Hero */}
      <div
        className="rounded-xl p-8 mb-6 relative overflow-hidden"
        style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
      >
        <div
          className="absolute -top-24 -right-24 h-64 w-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(113,112,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span
              className="inline-flex items-center gap-1 rounded-full"
              style={{ padding: '3px 10px', background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)', fontSize: '11px', fontWeight: 590, color: '#7170ff' }}
            >
              <MapPin className="h-3 w-3" /> {c.heroBadge}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 590, letterSpacing: '-0.04em', color: 'var(--fh-t1)', marginBottom: '10px', fontFeatureSettings: '"cv01", "ss03"' }}>
            {c.heroTitle}
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--fh-t3)', lineHeight: 1.7, fontWeight: 400, maxWidth: '540px' }}>
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
            <div key={s.title} className="rounded-xl p-5" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
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
      <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(94,106,210,0.04)', border: '1px solid rgba(94,106,210,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4" style={{ color: '#7170ff' }} />
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
            style={{ padding: '9px 20px', borderRadius: '6px', background: '#5e6ad2', color: '#ffffff', fontSize: '14px', fontWeight: 510 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
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
            <div key={r.org} className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
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

      {/* Tech stack */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
        <p className="mb-3" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {c.sectionStack}
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH.map(t => (
            <span key={t} style={{ padding: '4px 10px', borderRadius: '5px', background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.18)', fontSize: '12px', fontWeight: 510, color: '#7170ff' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Contacts */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
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
        className="rounded-xl p-6 mb-6"
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {c.stats.map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
            <div style={{ fontSize: '18px', fontWeight: 590, color: s.color, marginBottom: '4px', letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
