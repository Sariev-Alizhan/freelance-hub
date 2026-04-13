'use client'
import { motion } from 'framer-motion'
import { MessageSquare, Search, CreditCard, Star } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

const ICONS = [MessageSquare, Search, CreditCard, Star]
const COLORS = [
  { color: '#5e6ad2', bg: 'rgba(94,106,210,0.08)'  },
  { color: '#7170ff', bg: 'rgba(113,112,255,0.08)' },
  { color: '#27a644', bg: 'rgba(39,166,68,0.08)'   },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)'  },
]

export default function HowItWorks() {
  const { t } = useLang()
  const hw = t.howItWorks

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--fh-canvas)' }}>
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
            {hw.heading}
          </h2>
          <p style={{ fontSize: '15px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.6 }}>
            {hw.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {hw.steps.map((step: { title: string; text: string }, i: number) => {
            const Icon = ICONS[i]
            const { color, bg } = COLORS[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                {i < hw.steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-9 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(to right, var(--fh-border), transparent)' }}
                  />
                )}
                <div
                  className="relative z-10 rounded-xl p-6 h-full flex flex-col"
                  style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
                >
                  <div
                    className="h-11 w-11 rounded-lg flex items-center justify-center mb-5"
                    style={{ background: bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div
                    className="text-[11px] mb-2"
                    style={{ fontWeight: 590, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                  >
                    {hw.step} {i + 1}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#8a8f98', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
                    {step.text}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
