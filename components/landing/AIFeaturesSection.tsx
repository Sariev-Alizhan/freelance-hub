'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { SectionShell, EditorialHeading, EASE } from './_section-atoms'

const ACCENT_BY_LANG: Record<string, string> = {
  en: 'built in.',
  ru: 'внутри.',
  kz: 'ішіндегі.',
}

const PRE_BY_LANG: Record<string, string> = {
  en: 'A real AI assistant',
  ru: 'Настоящий AI-ассистент',
  kz: 'Нағыз AI-көмекші',
}

export default function AIFeaturesSection() {
  const { t, lang } = useLang()
  const ai = t.aiFeatures

  return (
    <SectionShell>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(40px, 6vw, 72px)',
        }}
      >
        <EditorialHeading
          eyebrow={ai.badge}
          pre={PRE_BY_LANG[lang] ?? PRE_BY_LANG.en}
          accent={ACCENT_BY_LANG[lang] ?? ACCENT_BY_LANG.en}
          sub={ai.sub}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1px',
            background: 'var(--fh-sep)',
            border: '1px solid var(--fh-sep)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {ai.features.map((f: { title: string; text: string; badge: string }, i: number) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: EASE }}
              style={{
                background: 'var(--fh-canvas)',
                padding: 'clamp(26px, 2.5vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                minHeight: 220,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    color: 'var(--fh-t4)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')} / {String(ai.features.length).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(39,166,68,0.35)',
                    color: '#27a644',
                  }}
                >
                  {f.badge}
                </span>
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: 'clamp(22px, 2vw, 28px)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.025em',
                  fontWeight: 590,
                  color: 'var(--fh-t1)',
                }}
              >
                {f.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--fh-t3)',
                }}
              >
                {f.text}
              </p>
            </motion.article>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Link
            href="/ai-assistant"
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
            {ai.cta}
            <ArrowUpRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    </SectionShell>
  )
}
