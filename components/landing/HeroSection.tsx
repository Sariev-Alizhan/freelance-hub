'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, MapPin } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

export default function HeroSection() {
  const { t } = useLang()
  const h = t.hero

  const STATS = [
    { value: h.stat1v, label: h.stat1l },
    { value: h.stat2v, label: h.stat2l },
    { value: h.stat3v, label: h.stat3l },
  ]

  return (
    <section
      className="relative overflow-hidden bg-grid"
      style={{ backgroundColor: 'var(--fh-canvas)', paddingTop: 'clamp(48px,8vw,80px)', paddingBottom: 'clamp(56px,10vw,100px)' }}
    >
      {/* Glow blobs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-200px', left: '25%',
          width: 'clamp(280px,80vw,700px)', height: 'clamp(280px,80vw,700px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(94,106,210,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-100px', right: '20%',
          width: 'clamp(180px,60vw,500px)', height: 'clamp(180px,60vw,500px)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">

        {/* Kazakhstan badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full mb-3"
          style={{
            border: '1px solid rgba(251,191,36,0.3)',
            background: 'rgba(251,191,36,0.07)',
            padding: '5px 14px',
          }}
        >
          <MapPin className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: '13px', fontWeight: 510, color: '#fbbf24', letterSpacing: '-0.01em' }}>
            {h.badge1}
          </span>
        </motion.div>

        {/* Global badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="inline-flex items-center gap-2 rounded-full mb-10 ml-2"
          style={{
            border: '1px solid rgba(94,106,210,0.25)',
            background: 'rgba(94,106,210,0.08)',
            padding: '5px 14px',
          }}
        >
          <Globe className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
          <span style={{ fontSize: '13px', fontWeight: 510, color: '#7170ff', letterSpacing: '-0.01em' }}>
            {h.badge2}
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 510,
            lineHeight: 1.03,
            letterSpacing: '-1.4px',
            color: 'var(--fh-t1)',
            fontFeatureSettings: '"cv01", "ss03"',
            marginBottom: '24px',
          }}
        >
          {h.h1a}<br />
          <span className="gradient-text">{h.h1b}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          style={{
            fontSize: '17px',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'var(--fh-t3)',
            maxWidth: '540px',
            margin: '0 auto 12px',
            letterSpacing: '-0.01em',
          }}
        >
          {h.sub}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: 'var(--fh-t4)',
            maxWidth: '480px',
            margin: '0 auto 40px',
            letterSpacing: '-0.01em',
          }}
        >
          {h.geo}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/auth/register"
            className="flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
            style={{
              padding: '11px 24px',
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
            {h.cta1}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
            style={{
              padding: '11px 24px',
              borderRadius: '6px',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border)',
              color: 'var(--fh-t2)',
              fontSize: '15px',
              fontWeight: 510,
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-3)'; e.currentTarget.style.color = 'var(--fh-t1)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)'; e.currentTarget.style.color = 'var(--fh-t2)' }}
          >
            {h.cta2}
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-sm mx-auto mt-12 sm:mt-16"
          style={{ borderTop: '1px solid var(--fh-sep)', paddingTop: '32px' }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="gradient-text"
                style={{ fontSize: '20px', fontWeight: 590, letterSpacing: '-0.5px' }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 510, color: 'var(--fh-t4)', marginTop: '4px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
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
              color: 'var(--fh-t4)',
              border: '1px solid var(--fh-border)',
              borderRadius: '9999px',
              padding: '5px 14px',
              letterSpacing: '-0.01em',
            }}
          >
            {h.early}
          </span>
        </motion.div>
      </div>
    </section>
  )
}
