'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Globe } from 'lucide-react'

const STATS = [
  { label: 'Комиссия', value: '0%' },
  { label: 'Регион', value: 'СНГ' },
  { label: 'Будущее', value: 'Весь мир' },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-grid" style={{ backgroundColor: '#08090a', paddingTop: '80px', paddingBottom: '100px' }}>
      {/* Glow blobs — Linear style */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-200px', left: '25%',
          width: '700px', height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,106,210,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-100px', right: '20%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(113,112,255,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full mb-10"
          style={{
            border: '1px solid rgba(94,106,210,0.25)',
            background: 'rgba(94,106,210,0.08)',
            padding: '5px 14px',
          }}
        >
          <Globe className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
          <span style={{ fontSize: '13px', fontWeight: 510, color: '#7170ff', letterSpacing: '-0.01em' }}>
            Бесплатная фриланс-платформа для СНГ
          </span>
        </motion.div>

        {/* Headline — Linear display size: 48px, weight 510, tracking -1.056px */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 510,
            lineHeight: 1.03,
            letterSpacing: '-1.4px',
            color: '#f7f8f8',
            fontFeatureSettings: '"cv01", "ss03"',
            marginBottom: '24px',
          }}
        >
          Фриланс без комиссий<br />
          <span className="gradient-text">для всего СНГ</span>
        </motion.h1>

        {/* Subtitle — Linear body large: 18px, weight 400, color #8a8f98 */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          style={{
            fontSize: '17px',
            fontWeight: 400,
            lineHeight: 1.6,
            color: '#8a8f98',
            maxWidth: '520px',
            margin: '0 auto 40px',
            letterSpacing: '-0.01em',
          }}
        >
          FreelanceHub — бесплатная платформа для специалистов из Казахстана,
          России, Украины. 0% комиссии. AI-подбор. Реальные заказы.
        </motion.p>

        {/* CTA — Linear button style */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/auth/register"
            className="flex items-center gap-2 transition-all"
            style={{
              padding: '10px 24px',
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
            Зарегистрироваться — бесплатно
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-2 transition-all"
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#d0d6e0',
              fontSize: '15px',
              fontWeight: 510,
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#f7f8f8' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#d0d6e0' }}
          >
            Смотреть заказы
          </Link>
        </motion.div>

        {/* Stats — Linear style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="grid grid-cols-3 gap-8 max-w-xs mx-auto mt-16"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '32px' }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="gradient-text"
                style={{ fontSize: '22px', fontWeight: 590, letterSpacing: '-0.5px' }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 510, color: '#62666d', marginTop: '4px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Early badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <span
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 510,
              color: '#62666d',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '9999px',
              padding: '5px 14px',
              letterSpacing: '-0.01em',
            }}
          >
            🚀 Платформа только запустилась — присоединяйся первым
          </span>
        </motion.div>
      </div>
    </section>
  )
}
