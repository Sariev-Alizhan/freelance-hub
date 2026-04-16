'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, TrendingUp, FileText, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

const ICONS = [MessageSquare, TrendingUp, FileText]
const STYLES = [
  { iconColor: '#27a644', iconBg: 'rgba(39,166,68,0.08)',    badgeColor: '#27a644', badgeBg: 'rgba(39,166,68,0.08)',    badgeBorder: 'rgba(39,166,68,0.2)'    },
  { iconColor: '#5e6ad2', iconBg: 'rgba(94,106,210,0.08)',   badgeColor: '#7170ff', badgeBg: 'rgba(113,112,255,0.08)', badgeBorder: 'rgba(113,112,255,0.2)'  },
  { iconColor: '#a855f7', iconBg: 'rgba(168,85,247,0.08)',   badgeColor: '#a855f7', badgeBg: 'rgba(168,85,247,0.08)',  badgeBorder: 'rgba(168,85,247,0.2)'   },
]

export default function AIFeaturesSection() {
  const { t } = useLang()
  const ai = t.aiFeatures

  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--fh-canvas)' }}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full mb-5"
            style={{ padding: '4px 14px', background: 'rgba(113,112,255,0.06)', border: '1px solid rgba(113,112,255,0.18)' }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
            <span style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff', letterSpacing: '-0.005em' }}>
              {ai.badge}
            </span>
          </div>
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
            {ai.heading}
          </h2>
          <p style={{ fontSize: '15px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            {ai.sub}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {ai.features.map((f: { title: string; text: string; badge: string }, i: number) => {
            const Icon = ICONS[i]
            const s = STYLES[i]
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl p-6"
                style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: s.iconBg }}>
                    <Icon className="h-5 w-5" style={{ color: s.iconColor }} />
                  </div>
                  <span
                    className="text-[11px] rounded-full"
                    style={{ padding: '3px 10px', fontWeight: 590, background: s.badgeBg, border: `1px solid ${s.badgeBorder}`, color: s.badgeColor, letterSpacing: '0.01em' }}
                  >
                    {f.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#8a8f98', lineHeight: 1.6, fontWeight: 400, letterSpacing: '-0.01em' }}>
                  {f.text}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center">
          <Link
            href="/ai-assistant"
            className="inline-flex items-center gap-2 transition-all"
            style={{ padding: '11px 26px', borderRadius: '6px', background: '#5e6ad2', color: '#ffffff', fontSize: '15px', fontWeight: 510, letterSpacing: '-0.01em', boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 2px 12px rgba(94,106,210,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
          >
            <Sparkles className="h-4 w-4" />
            {ai.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
