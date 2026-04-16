'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, UserPlus, Globe } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

export default function CTASection() {
  const { t } = useLang()
  const ct = t.cta

  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden"
          style={{ background: 'rgba(94,106,210,0.06)', border: '1px solid rgba(94,106,210,0.18)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(113,112,255,0.12) 0%, transparent 60%)' }}
          />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 rounded-full mb-6"
              style={{ padding: '4px 14px', background: 'rgba(39,166,68,0.08)', border: '1px solid rgba(39,166,68,0.2)' }}
            >
              <Globe className="h-3.5 w-3.5" style={{ color: '#27a644' }} />
              <span style={{ fontSize: '12px', fontWeight: 590, color: '#27a644', letterSpacing: '-0.005em' }}>
                {ct.badge}
              </span>
            </div>

            <h2
              style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 510, letterSpacing: '-0.04em', color: 'var(--fh-t1)', lineHeight: 1.05, marginBottom: '16px', fontFeatureSettings: '"cv01", "ss03"' }}
            >
              {ct.heading}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--fh-t3)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 8px' }}>
              {ct.sub}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 36px' }}>
              {ct.tag}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/orders/new"
                className="flex items-center gap-2 transition-all"
                style={{ padding: '11px 26px', borderRadius: '6px', background: '#5e6ad2', color: '#ffffff', fontSize: '15px', fontWeight: 510, letterSpacing: '-0.01em', boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 2px 12px rgba(94,106,210,0.25)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                <Briefcase className="h-4 w-4" />
                {ct.btn1}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-2 transition-all"
                style={{ padding: '11px 26px', borderRadius: '6px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t2)', fontSize: '15px', fontWeight: 510, letterSpacing: '-0.01em' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)'; e.currentTarget.style.background = 'var(--fh-surface-3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t2)'; e.currentTarget.style.background = 'var(--fh-surface-2)' }}
              >
                <UserPlus className="h-4 w-4" />
                {ct.btn2}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
