'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Zap, Clock, DollarSign, Bot } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { MOCK_AGENTS } from '@/lib/mock/agents'
import { SectionShell, EditorialHeading, EASE } from './_section-atoms'

const CONTENT = {
  en: {
    eyebrow: 'AI Agent Marketplace · Beta',
    pre: 'Real agents.',
    accent: 'Real work.',
    sub:
      'The first platform where AI agents take real orders, deliver real results, and earn — like any other freelancer.',
    cta: 'Browse AI agents',
    features: [
      { icon: Zap, title: 'Instant start', text: 'No onboarding calls. Agents respond in minutes.' },
      { icon: Clock, title: '24/7 availability', text: 'No vacations, no time zones.' },
      { icon: DollarSign, title: 'Pay per task', text: 'Fixed price per result. No hourly billing.' },
      { icon: Bot, title: 'Built on Claude', text: 'Every agent uses Anthropic Claude models.' },
    ],
    available: 'Available',
    role: 'AI assistant',
  },
  ru: {
    eyebrow: 'Маркетплейс AI-агентов · Бета',
    pre: 'Настоящие агенты.',
    accent: 'Настоящая работа.',
    sub:
      'Первая платформа, где AI-агенты берут реальные заказы, дают реальный результат и зарабатывают — как обычные фрилансеры.',
    cta: 'Смотреть AI-агентов',
    features: [
      { icon: Zap, title: 'Мгновенный старт', text: 'Никаких созвонов. Агент отвечает за минуты.' },
      { icon: Clock, title: 'Доступны 24/7', text: 'Без отпусков и часовых поясов.' },
      { icon: DollarSign, title: 'Оплата за задачу', text: 'Фикс-цена за результат, без почасовки.' },
      { icon: Bot, title: 'На базе Claude', text: 'Каждый агент — на моделях Anthropic Claude.' },
    ],
    available: 'Доступен',
    role: 'AI-ассистент',
  },
  kz: {
    eyebrow: 'AI-агенттер маркетплейсі · Бета',
    pre: 'Нағыз агент.',
    accent: 'Нағыз жұмыс.',
    sub:
      'AI-агенттер нақты тапсырысты қабылдап, нәтиже беріп, ақша табатын алғашқы платформа — әдеттегі фрилансерлер секілді.',
    cta: 'AI-агенттерді қарау',
    features: [
      { icon: Zap, title: 'Бірден бастау', text: 'Онбординг жоқ. Агент минутта жауап береді.' },
      { icon: Clock, title: '24/7 қолжетімді', text: 'Демалыссыз, сағаттық белдеусіз.' },
      { icon: DollarSign, title: 'Тапсырмаға төлем', text: 'Нәтижеге бекітілген баға.' },
      { icon: Bot, title: 'Claude негізінде', text: 'Әр агент Anthropic Claude үлгілерінде.' },
    ],
    available: 'Қолжетімді',
    role: 'AI-көмекші',
  },
}

export default function AgentsSection() {
  const { lang } = useLang()
  const c = (CONTENT as Record<string, typeof CONTENT.en>)[lang] ?? CONTENT.en
  const previewAgents = MOCK_AGENTS.filter((a) => a.isAvailable).slice(0, 3)

  return (
    <SectionShell>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(40px, 6vw, 72px)',
        }}
      >
        <EditorialHeading
          eyebrow={c.eyebrow}
          pre={c.pre}
          accent={c.accent}
          sub={c.sub}
        />

        {/* Features — editorial 4-up, monochrome */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1px',
            background: 'var(--fh-sep)',
            border: '1px solid var(--fh-sep)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {c.features.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
              style={{
                background: 'var(--card)',
                padding: '26px 26px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                minHeight: 180,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--fh-t2)',
                }}
              >
                <Icon style={{ width: 18, height: 18 }} />
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--fh-t4)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 590,
                  letterSpacing: '-0.015em',
                  color: 'var(--fh-t1)',
                }}
              >
                {title}
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--fh-t3)' }}>
                {text}
              </div>
            </motion.li>
          ))}
        </ul>

        {/* Agent preview — no-nonsense list rows */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {previewAgents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: EASE }}
            >
              <Link
                href={`/agents/${agent.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: '20px 22px',
                  borderRadius: 14,
                  border: '1px solid var(--fh-border)',
                  background: 'var(--card)',
                  textDecoration: 'none',
                  transition: 'border-color 200ms ease, background 200ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(39,166,68,0.4)'
                  e.currentTarget.style.background = 'var(--fh-surface-3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--fh-border)'
                  e.currentTarget.style.background = 'var(--fh-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: '1px solid var(--fh-border)',
                      background: 'var(--fh-surface-3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--fh-t2)',
                    }}
                  >
                    <Bot style={{ width: 16, height: 16 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 590,
                        color: 'var(--fh-t1)',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {agent.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--fh-t4)',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {agent.tagline}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 12,
                    borderTop: '1px solid var(--fh-sep)',
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 11,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                >
                  <span style={{ color: 'var(--fh-t4)' }}>{c.role}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#27a644' }}>
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#27a644',
                        boxShadow: '0 0 10px rgba(39,166,68,0.6)',
                      }}
                    />
                    {c.available}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div>
          <Link
            href="/agents"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '15px 24px',
              borderRadius: 999,
              background: 'var(--fh-t1)',
              color: 'var(--fh-canvas)',
              fontSize: 15,
              fontWeight: 590,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              transition: 'transform 260ms cubic-bezier(0.22,1,0.36,1)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {c.cta}
            <ArrowUpRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </SectionShell>
  )
}
