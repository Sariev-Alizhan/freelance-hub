'use client'
import { motion } from 'framer-motion'
import { MessageSquare, Search, CreditCard, Star } from 'lucide-react'

const STEPS = [
  {
    icon: MessageSquare,
    color: '#5e6ad2',
    bg: 'rgba(94,106,210,0.08)',
    title: 'Опишите задачу',
    text: 'Расскажите AI-ассистенту что нужно сделать. Не надо сложных форм — просто напишите как другу.',
  },
  {
    icon: Search,
    color: '#7170ff',
    bg: 'rgba(113,112,255,0.08)',
    title: 'AI подберёт лучших',
    text: 'Наш алгоритм анализирует навыки, рейтинг и портфолио — и предлагает топ-3 специалиста.',
  },
  {
    icon: CreditCard,
    color: '#27a644',
    bg: 'rgba(39,166,68,0.08)',
    title: 'Прямая оплата',
    text: 'Заказчик и фрилансер договариваются напрямую — без посредников и скрытых комиссий.',
  },
  {
    icon: Star,
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.08)',
    title: 'Оставьте отзыв',
    text: 'Ваш отзыв помогает другим заказчикам и повышает рейтинг фрилансера в поиске.',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#08090a' }}>
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
              color: '#f7f8f8',
              lineHeight: 1.1,
              marginBottom: '12px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Как это работает
          </h2>
          <p style={{ fontSize: '15px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.6 }}>
            Четыре простых шага до готового проекта
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-9 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(to right, rgba(255,255,255,0.06), transparent)' }}
                  />
                )}
                <div
                  className="relative z-10 rounded-xl p-6 h-full flex flex-col"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div
                    className="h-11 w-11 rounded-lg flex items-center justify-center mb-5"
                    style={{ background: step.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: step.color }} />
                  </div>
                  <div
                    className="text-[11px] mb-2"
                    style={{ fontWeight: 590, color: step.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                  >
                    Шаг {i + 1}
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: 590, color: '#f7f8f8', marginBottom: '8px', letterSpacing: '-0.02em' }}>
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
