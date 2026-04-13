'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Globe, Briefcase } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

const CONTENT = {
  en: {
    heading: 'Why FreelanceHub?',
    sub:     'A fair platform with no middlemen and no hidden fees',
    perks: [
      {
        title: '0% commission',
        text:  'Keep 100% of payment from the client. No commission now or in the future.',
      },
      {
        title: 'Global platform',
        text:  'Work from anywhere, with anyone. No regional restrictions, no currency limits.',
      },
      {
        title: 'Direct deals',
        text:  'Client and freelancer work directly — no middlemen, no hidden fees.',
      },
    ],
    ctaBadge:  'Just launched',
    ctaTitle:  'Be among the first',
    ctaSub:    'Early members get priority in search and the "Pioneer" badge.',
    ctaBtn1:   'Join now',
    ctaBtn2:   'Freelancers',
  },
  ru: {
    heading: 'Почему FreelanceHub?',
    sub:     'Честная платформа без посредников и скрытых комиссий',
    perks: [
      {
        title: '0% комиссии',
        text:  'Получайте 100% оплаты от клиента. Никакой комиссии — сейчас и в будущем.',
      },
      {
        title: 'Глобальная платформа',
        text:  'Работайте откуда угодно, с кем угодно. Без региональных ограничений и валютных барьеров.',
      },
      {
        title: 'Прямые сделки',
        text:  'Клиент и фрилансер работают напрямую — без посредников и скрытых платежей.',
      },
    ],
    ctaBadge:  'Только запустились',
    ctaTitle:  'Будь среди первых',
    ctaSub:    'Ранние участники получают приоритет в поиске и значок «Первопроходец».',
    ctaBtn1:   'Присоединиться',
    ctaBtn2:   'Фрилансеры',
  },
}

const PERK_ICONS = [Zap, Globe, Briefcase]
const PERK_COLORS = [
  { color: '#7170ff', bg: 'rgba(113,112,255,0.08)' },
  { color: '#27a644', bg: 'rgba(39,166,68,0.08)'   },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
]

export default function TopFreelancers() {
  const { lang } = useLang()
  const c = (CONTENT as Record<string, typeof CONTENT.en>)[lang] ?? CONTENT.en

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--fh-canvas)' }}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 510,
              letterSpacing: '-0.04em',
              color: 'var(--fh-t1)',
              lineHeight: 1.1,
              marginBottom: '12px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            {c.heading}
          </h2>
          <p style={{ fontSize: '15px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', maxWidth: '400px', margin: '0 auto', lineHeight: 1.6 }}>
            {c.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {c.perks.map((perk, i) => {
            const Icon = PERK_ICONS[i]
            const { color, bg } = PERK_COLORS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-6"
                style={{
                  background: 'var(--fh-surface)',
                  border: '1px solid var(--fh-border)',
                }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center mb-5"
                  style={{ background: bg }}
                >
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {perk.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#8a8f98', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
                  {perk.text}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Join CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: 'rgba(94,106,210,0.06)',
            border: '1px solid rgba(94,106,210,0.2)',
          }}
        >
          <div>
            <p style={{ fontSize: '11px', fontWeight: 590, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              {c.ctaBadge}
            </p>
            <h3 style={{ fontSize: '18px', fontWeight: 510, color: 'var(--fh-t1)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
              {c.ctaTitle}
            </h3>
            <p style={{ fontSize: '13px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.6 }}>
              {c.ctaSub}
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 transition-all whitespace-nowrap"
              style={{
                padding: '9px 20px',
                borderRadius: '6px',
                background: '#5e6ad2',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 510,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
            >
              {c.ctaBtn1}
            </Link>
            <Link
              href="/freelancers"
              className="hidden sm:flex items-center gap-1.5 transition-all whitespace-nowrap"
              style={{
                padding: '9px 16px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--fh-border-2)',
                color: 'var(--fh-t3)',
                fontSize: '13px',
                fontWeight: 510,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)'; e.currentTarget.style.background = 'var(--fh-surface-3)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t3)'; e.currentTarget.style.background = 'var(--fh-surface-2)' }}
            >
              {c.ctaBtn2} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
