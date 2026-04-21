'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function CTASection() {
  const { t } = useLang()
  const ct = t.cta

  return (
    <section
      style={{
        position: 'relative',
        padding: 'clamp(64px, 10vw, 128px) clamp(20px, 4vw, 48px)',
        background: 'var(--fh-canvas)',
        overflow: 'hidden',
      }}
    >
      {/* Single accent radial — no purple orb soup */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'radial-gradient(ellipse at 50% 120%, rgba(39,166,68,0.10) 0%, transparent 55%)',
          pointerEvents: 'none',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75, ease: EASE }}
        style={{
          position: 'relative',
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(28px, 4vw, 48px)',
          padding: 'clamp(36px, 6vw, 72px) clamp(24px, 5vw, 64px)',
          borderRadius: 'clamp(18px, 2.2vw, 28px)',
          background: 'var(--card)',
          border: '1px solid var(--fh-border)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      >
        {/* Hairline accent bar */}
        <span
          aria-hidden
          style={{
            width: 40, height: 2,
            background: '#27a644',
            boxShadow: '0 0 18px rgba(39,166,68,0.55)',
            borderRadius: 2,
          }}
        />

        {/* Heading — Inter heavy + Instrument Serif italic tail */}
        <h2
          style={{
            fontSize: 'clamp(32px, 5.5vw, 64px)',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            fontWeight: 700,
            color: 'var(--fh-t1)',
            margin: 0,
            fontFeatureSettings: '"cv01", "ss03"',
            maxWidth: 820,
          }}
        >
          {ct.heading}{' '}
          <span
            style={{
              fontFamily:
                'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: '#27a644',
            }}
          >
            {ct.badge}
          </span>
        </h2>

        <p
          style={{
            fontSize: 'clamp(15px, 1.5vw, 18px)',
            lineHeight: 1.55,
            color: 'var(--fh-t3)',
            maxWidth: 620,
            margin: 0,
          }}
        >
          {ct.sub}
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <Link
            href="/orders/new"
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
            {ct.btn1}
            <ArrowUpRight style={{ width: 16, height: 16 }} />
          </Link>

          <Link
            href="/auth/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '15px 22px',
              borderRadius: 999,
              border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t2)',
              fontSize: 15,
              fontWeight: 510,
              letterSpacing: '-0.01em',
              textDecoration: 'none',
              background: 'transparent',
              transition: 'color 180ms ease, border-color 180ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--fh-t3)'
              e.currentTarget.style.color = 'var(--fh-t1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--fh-border-2)'
              e.currentTarget.style.color = 'var(--fh-t2)'
            }}
          >
            {ct.btn2}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>

        <p
          style={{
            margin: 0,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            fontSize: 11,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--fh-t4)',
          }}
        >
          Built in Kazakhstan · Open to the world
        </p>
      </motion.div>
    </section>
  )
}
