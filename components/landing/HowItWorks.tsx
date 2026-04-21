'use client'
import { motion } from 'framer-motion'
import { useLang } from '@/lib/context/LanguageContext'
import { SectionShell, EditorialHeading, EASE } from './_section-atoms'

const ACCENT_BY_LANG: Record<string, { pre: string; accent: string }> = {
  en: { pre: 'How it', accent: 'works.' },
  ru: { pre: 'Как это', accent: 'работает.' },
  kz: { pre: 'Қалай', accent: 'жұмыс істейді.' },
}

export default function HowItWorks() {
  const { t, lang } = useLang()
  const hw = t.howItWorks
  const head = ACCENT_BY_LANG[lang] ?? ACCENT_BY_LANG.en

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
          eyebrow={hw.step}
          pre={head.pre}
          accent={head.accent}
          sub={hw.sub}
        />

        <ol
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1px',
            background: 'var(--fh-sep)',
            border: '1px solid var(--fh-sep)',
            borderRadius: 16,
            overflow: 'hidden',
            counterReset: 'fh-step',
          }}
        >
          {hw.steps.map((step: { title: string; text: string }, i: number) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.55, ease: EASE }}
              style={{
                background: 'var(--fh-canvas)',
                padding: 'clamp(26px, 2.5vw, 40px)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                minHeight: 220,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                <span
                  style={{
                    fontSize: 'clamp(40px, 4.5vw, 56px)',
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                    fontWeight: 700,
                    color: 'var(--fh-t1)',
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                    fontSize: 11,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--fh-t4)',
                  }}
                >
                  / {String(hw.steps.length).padStart(2, '0')}
                </span>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 590,
                  letterSpacing: '-0.015em',
                  color: 'var(--fh-t1)',
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: 'var(--fh-t3)',
                }}
              >
                {step.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>
    </SectionShell>
  )
}
