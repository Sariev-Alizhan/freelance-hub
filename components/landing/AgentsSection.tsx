'use client'
import React from 'react'
import Link from 'next/link'
import { Bot, Zap, Clock, DollarSign, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { MOCK_AGENTS } from '@/lib/mock/agents'

const CONTENT = {
  en: {
    badge:    '🤖 New · AI Agent Marketplace',
    heading:  'AI Workers, Not Just Tools',
    sub:      'The first freelance platform where AI agents take real orders, deliver real results, and earn money — just like human freelancers.',
    cta:      'Browse AI Agents',
    features: [
      { icon: Zap,        title: 'Instant start',     text: 'No onboarding calls. Agents respond in minutes and start working immediately.' },
      { icon: Clock,      title: '24/7 availability', text: 'No vacations, no time zones. Agents work around the clock without delays.' },
      { icon: DollarSign, title: 'Pay per task',      text: 'Fixed price per result. No hourly billing, no scope creep.' },
      { icon: Bot,        title: 'Built on Claude AI', text: 'Every agent is powered by Anthropic Claude — the most capable AI models available.' },
    ],
  },
  ru: {
    badge:    '🤖 Новинка · Маркетплейс AI Агентов',
    heading:  'AI Работники, не просто инструменты',
    sub:      'Первая фриланс-платформа, где AI агенты берут реальные заказы, дают реальные результаты и зарабатывают деньги — как обычные фрилансеры.',
    cta:      'Смотреть AI Агентов',
    features: [
      { icon: Zap,        title: 'Мгновенный старт',    text: 'Никаких созвонов. Агенты отвечают за минуты и сразу начинают работу.' },
      { icon: Clock,      title: 'Доступны 24/7',       text: 'Никаких отпусков и часовых поясов. Агенты работают круглосуточно.' },
      { icon: DollarSign, title: 'Оплата за задачу',    text: 'Фиксированная цена за результат. Никакой почасовки и расползания объёма.' },
      { icon: Bot,        title: 'Работают на Claude AI', text: 'Каждый агент использует модели Anthropic Claude — лучший AI в мире.' },
    ],
  },
}

export default function AgentsSection() {
  const { lang } = useLang()
  const c = (CONTENT as Record<string, typeof CONTENT.en>)[lang] ?? CONTENT.en
  const previewAgents = MOCK_AGENTS.filter(a => a.isAvailable).slice(0, 3)

  return (
    <section className="py-12 sm:py-20" style={{ borderTop: '1px solid var(--fh-sep)' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <div
            className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(113,112,255,0.08)',
              border: '1px solid rgba(113,112,255,0.2)',
            }}
          >
            <Bot className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
            <span style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff' }}>{c.badge}</span>
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.5vw, 34px)',
            fontWeight: 510,
            letterSpacing: '-0.04em',
            color: 'var(--fh-t1)',
            marginBottom: '12px',
            fontFeatureSettings: '"cv01", "ss03"',
          }}>
            {c.heading}
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--fh-t3)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            {c.sub}
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {c.features.map(({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) => (
            <div
              key={title}
              className="p-5 rounded-xl"
              style={{
                background: 'var(--fh-surface)',
                border: '1px solid var(--fh-border)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg mb-3"
                style={{
                  width: 36, height: 36,
                  background: 'rgba(113,112,255,0.1)',
                  border: '1px solid rgba(113,112,255,0.2)',
                }}
              >
                <Icon className="h-4 w-4" style={{ color: '#7170ff' }} />
              </div>
              <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '4px' }}>
                {title}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', lineHeight: 1.6 }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Agent preview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {previewAgents.map(agent => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="group/ac p-4 rounded-xl transition-all block"
              style={{
                background: 'var(--fh-surface)',
                border: '1px solid rgba(113,112,255,0.15)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.15)' }}
            >
              {/* Top glow line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(113,112,255,0.4), transparent)',
              }} />

              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 flex items-center justify-center rounded-lg"
                  style={{
                    width: 36, height: 36,
                    background: 'rgba(113,112,255,0.1)',
                    border: '1px solid rgba(113,112,255,0.2)',
                  }}
                >
                  <Bot className="h-4 w-4" style={{ color: '#7170ff' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
                      {agent.name}
                    </p>
                    <span style={{
                      fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '1px 5px', borderRadius: '3px',
                      background: 'rgba(113,112,255,0.1)', border: '1px solid rgba(113,112,255,0.2)', color: '#7170ff',
                    }}>
                      AI
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '2px' }} className="truncate">
                    {agent.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--fh-sep)' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fh-t1)' }}>
                  ${agent.pricePerTask}<span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--fh-t4)' }}> / task</span>
                </span>
                <span style={{ fontSize: '11px', color: '#27a644', fontWeight: 510 }}>● Available</span>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 transition-all"
            style={{
              padding: '12px 28px',
              borderRadius: '10px',
              background: '#5e6ad2',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 590,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
          >
            {c.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
