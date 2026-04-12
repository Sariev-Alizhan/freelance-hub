'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, TrendingUp, FileText, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: MessageSquare,
    iconColor: '#27a644',
    iconBg: 'rgba(39,166,68,0.08)',
    title: 'AI-ассистент',
    text: 'Общайтесь с ИИ как с менеджером: описываете задачу → получаете топ-3 идеальных кандидата с объяснением выбора.',
    badge: 'Новинка',
    badgeColor: '#27a644',
    badgeBg: 'rgba(39,166,68,0.08)',
    badgeBorder: 'rgba(39,166,68,0.2)',
  },
  {
    icon: TrendingUp,
    iconColor: '#5e6ad2',
    iconBg: 'rgba(94,106,210,0.08)',
    title: 'Советник по цене',
    text: 'ИИ анализирует рынок СНГ и подсказывает справедливый бюджет для вашей задачи — не переплатите и не продешевите.',
    badge: 'Полезно',
    badgeColor: '#7170ff',
    badgeBg: 'rgba(113,112,255,0.08)',
    badgeBorder: 'rgba(113,112,255,0.2)',
  },
  {
    icon: FileText,
    iconColor: '#a855f7',
    iconBg: 'rgba(168,85,247,0.08)',
    title: 'Генератор откликов',
    text: 'Фрилансеры: ИИ пишет убедительный отклик на заказ на основе вашего профиля и навыков. Экономьте время.',
    badge: 'Для фрилансеров',
    badgeColor: '#a855f7',
    badgeBg: 'rgba(168,85,247,0.08)',
    badgeBorder: 'rgba(168,85,247,0.2)',
  },
]

export default function AIFeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#08090a' }}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full mb-5"
            style={{
              padding: '4px 14px',
              background: 'rgba(113,112,255,0.06)',
              border: '1px solid rgba(113,112,255,0.18)',
            }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
            <span style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff', letterSpacing: '-0.005em' }}>
              Powered by Claude AI
            </span>
          </div>
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
            Искусственный интеллект
          </h2>
          <p style={{ fontSize: '15px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Первая фриланс-платформа для СНГ с настоящим AI-ассистентом внутри
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ background: f.iconBg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: f.iconColor }} />
                  </div>
                  <span
                    className="text-[11px] rounded-full"
                    style={{
                      padding: '3px 10px',
                      fontWeight: 590,
                      background: f.badgeBg,
                      border: `1px solid ${f.badgeBorder}`,
                      color: f.badgeColor,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {f.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 590, color: '#f7f8f8', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#8a8f98', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
                  {f.text}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2 transition-all"
            style={{
              padding: '11px 26px',
              borderRadius: '6px',
              background: '#5e6ad2',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 510,
              letterSpacing: '-0.01em',
              boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 2px 12px rgba(94,106,210,0.25)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
          >
            <Sparkles className="h-4 w-4" />
            Попробовать AI-подбор
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
