'use client'
import Link from 'next/link'
import {
  Mail, AtSign, ArrowLeft, ExternalLink,
  Briefcase, Globe, Zap, MapPin, Code2,
  Sparkles, Shield, Heart, Copy, Check,
} from 'lucide-react'
import { useState } from 'react'

const STORY_POINTS = [
  {
    icon: MapPin,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    title: 'Живу в Казахстане',
    text: 'Я разработчик из Казахстана. Постоянно сталкивался с тем, что зарубежные платформы неудобны: непонятный интерфейс, сложные платежи, высокая комиссия и региональные ограничения.',
  },
  {
    icon: Zap,
    color: '#e5484d',
    bg: 'rgba(229,72,77,0.08)',
    title: 'Проблема, которую решаю',
    text: 'Устал платить 20% Upwork и разбираться в формах Fiverr. Решил: хочешь удобный инструмент — сделай сам. Без комиссий, без барьеров, без ограничений по стране.',
  },
  {
    icon: Sparkles,
    color: '#7170ff',
    bg: 'rgba(113,112,255,0.08)',
    title: 'Идея FreelanceHub',
    text: 'Децентрализованное пространство где специалисты общаются напрямую с заказчиками. Оплата — как угодно: Kaspi, Freedom, USDT, карта, наличные. Без посредников.',
  },
  {
    icon: Globe,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    title: 'Для всего мира',
    text: 'Сначала Казахстан, Россия, Украина. Затем — весь мир. Никаких региональных блокировок. Работай откуда угодно, с кем угодно. 0% комиссии навсегда.',
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
    icon: Briefcase,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    title: 'CEO & Co-Founder',
    org: 'SITS',
    desc: 'Sariyev IT Solutions — IT-компания из Казахстана. Разработка, автоматизация, AI.',
  },
  {
    icon: Globe,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    title: 'Co-Founder',
    org: 'Tengri Yurt',
    desc: 'Платформа, объединяющая культуру и бизнес Центральной Азии.',
  },
]

const TECH = ['Next.js 16', 'TypeScript', 'Supabase', 'PostgreSQL', 'Claude AI', 'Tailwind CSS', 'Framer Motion', 'Resend']

const CONTACTS = [
  { icon: Mail,         href: 'mailto:raimzhan1907@gmail.com',                                       display: 'raimzhan1907@gmail.com' },
  { icon: AtSign,       href: 'https://www.instagram.com/zhanmate_zhan/?hl=ru',                      display: '@zhanmate_zhan (личный)' },
  { icon: Briefcase,    href: 'https://www.instagram.com/sariyev.it.solutions/?hl=ru',               display: '@sariyev.it.solutions (SITS)' },
  { icon: ExternalLink, href: 'https://www.linkedin.com/in/alizhan-sariyev-5a3804278/',              display: 'LinkedIn' },
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

function CopyCard({ card }: { card: typeof DONATE_CARDS[0] }) {
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
        title="Скопировать номер"
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
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12" style={{ minHeight: 'calc(100vh - 52px)' }}>
      <Link
        href="/"
        className="inline-flex items-center gap-2 mb-10 transition-colors"
        style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400 }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> На главную
      </Link>

      {/* Hero card */}
      <div
        className="rounded-xl p-8 mb-4 relative overflow-hidden"
        style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
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
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 510, letterSpacing: '-0.04em', color: 'var(--fh-t1)', fontFeatureSettings: '"cv01", "ss03"' }}>
                Сариев Алижан Сабитулы
              </h1>
              <span
                className="inline-flex items-center gap-1 rounded-full"
                style={{ padding: '2px 10px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', fontSize: '11px', fontWeight: 590, color: '#fbbf24' }}
              >
                <MapPin className="h-3 w-3" /> Казахстан
              </span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--fh-t3)', fontWeight: 400, letterSpacing: '-0.01em', marginBottom: '4px' }}>
              Full-stack разработчик · Основатель FreelanceHub
            </p>
            <p style={{ fontSize: '13px', color: '#7170ff', fontWeight: 510, letterSpacing: '-0.01em', marginBottom: '12px' }}>
              CEO @ SITS — Sariyev IT Solutions
            </p>
            <div className="flex flex-wrap gap-2">
              {CONTACTS.map((c) => {
                const Icon = c.icon
                return (
                  <ExtLink key={c.href} href={c.href}>
                    <Icon className="h-3.5 w-3.5" />
                    {c.display}
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </ExtLink>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Story */}
      <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        История проекта
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
        {STORY_POINTS.map((s) => {
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

      {/* SITS company */}
      <div
        className="rounded-xl p-5 mb-4 flex items-start gap-4"
        style={{ background: 'rgba(113,112,255,0.04)', border: '1px solid rgba(113,112,255,0.15)' }}
      >
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(113,112,255,0.12)' }}
        >
          <Code2 className="h-5 w-5" style={{ color: '#7170ff' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 style={{ fontSize: '15px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
              SITS — Sariyev IT Solutions
            </h2>
            <a
              href="https://www.instagram.com/sariyev.it.solutions/?hl=ru"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#7170ff', fontWeight: 510 }}
            >
              @sariyev.it.solutions ↗
            </a>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6, fontWeight: 400 }}>
            IT-компания из Казахстана. Разработка веб-приложений, автоматизация бизнеса, AI-интеграции.
            FreelanceHub — наш флагманский продукт.
          </p>
        </div>
      </div>

      {/* Tech stack */}
      <div className="rounded-xl p-5 mb-4" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
        <p className="mb-3" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
      <p className="mb-4 px-1" style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Позиции
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
        {ROLES.map((r) => {
          const Icon = r.icon
          return (
            <div key={r.org} className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: r.bg }}>
                <Icon className="h-5 w-5" style={{ color: r.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--fh-t4)', fontWeight: 590, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>{r.title}</p>
                <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>{r.org}</p>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>{r.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Manifesto */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(94,106,210,0.04)', border: '1px solid rgba(94,106,210,0.15)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-4 w-4" style={{ color: '#7170ff' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>Манифест платформы</h2>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--fh-t3)', lineHeight: 1.75, fontWeight: 400, letterSpacing: '-0.01em' }}>
          FreelanceHub — децентрализованное пространство, где люди работают напрямую.{' '}
          <strong style={{ color: 'var(--fh-t2)', fontWeight: 590 }}>
            Оплата через чат: Kaspi, Freedom, USDT, Swift, наличные — как договоритесь
          </strong>.
          Никаких региональных блокировок, никаких посредников, никакой комиссии.
          Платформа создана разработчиком из Казахстана для всего мира.
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
            style={{ padding: '9px 20px', borderRadius: '6px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t2)', fontSize: '14px', fontWeight: 510 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>

      {/* Donate section */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-4 w-4" style={{ color: '#fbbf24' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
            Поддержи проект
          </h2>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65, fontWeight: 400, marginBottom: '16px' }}>
          Платформа бесплатная и такой останется. Если хочешь помочь — поддержи донатом.
          Все средства идут исключительно на продвижение проекта, чтобы больше людей по всему миру
          могли работать без комиссий.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DONATE_CARDS.map(card => (
            <CopyCard key={card.label} card={card} />
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginTop: '12px', fontWeight: 400 }}>
          Получатель: Сариев Алижан Сабитулы · SITS Sariyev IT Solutions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Комиссия',  value: '0%',     color: '#27a644' },
          { label: 'Страны',    value: 'Весь мир',color: '#7170ff' },
          { label: 'AI‑модель', value: 'Claude',  color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}>
            <div style={{ fontSize: '18px', fontWeight: 590, color: s.color, marginBottom: '4px', letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
