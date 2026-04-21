'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Code2,
  PenSquare,
  BarChart2,
  Target,
  PenLine,
  Video,
  Bot,
  Brain,
  Blocks,
  Sparkles,
} from 'lucide-react'
import { CATEGORIES } from '@/lib/mock/categories'
import { useLang } from '@/lib/context/LanguageContext'
import { SectionShell, EditorialHeading, EASE } from './_section-atoms'

const ICONS: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Code2,
  Figma: PenSquare,
  BarChart2,
  Target,
  PenLine,
  Video,
  Bot,
  Brain,
  Blocks,
  Sparkles,
}

const ACCENT_BY_LANG: Record<string, { pre: string; accent: string; eyebrow: string }> = {
  en: { pre: 'Modern', accent: 'skills.', eyebrow: 'Categories' },
  ru: { pre: 'Современные', accent: 'профессии.', eyebrow: 'Категории' },
  kz: { pre: 'Заманауи', accent: 'мамандықтар.', eyebrow: 'Санаттар' },
}

export default function CategoriesSection() {
  const { t, lang } = useLang()
  const ct = t.categories
  const head = ACCENT_BY_LANG[lang] ?? ACCENT_BY_LANG.en

  return (
    <SectionShell>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'clamp(40px, 6vw, 64px)',
        }}
      >
        <EditorialHeading
          eyebrow={head.eyebrow}
          pre={head.pre}
          accent={head.accent}
          sub={ct.sub}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1px',
            background: 'var(--fh-sep)',
            border: '1px solid var(--fh-sep)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.icon] || Sparkles
            const label = ct[cat.slug] ?? cat.label
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.03, duration: 0.4, ease: EASE }}
              >
                <Link
                  href={`/freelancers?category=${cat.slug}`}
                  className="fh-cat-cell"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '22px 22px',
                    background: 'var(--card)',
                    textDecoration: 'none',
                    transition: 'background 200ms ease, color 200ms ease',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 14,
                      color: 'var(--fh-t2)',
                    }}
                  >
                    <Icon
                      style={{ width: 18, height: 18, color: 'var(--fh-t3)' }}
                    />
                    <span
                      style={{
                        fontSize: 14.5,
                        fontWeight: 510,
                        letterSpacing: '-0.01em',
                        color: 'var(--fh-t1)',
                      }}
                    >
                      {label}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                      fontSize: 11,
                      color: 'var(--fh-t4)',
                    }}
                  >
                    →
                  </span>
                </Link>
              </motion.div>
            )
          })}
        </div>
        <style>{`
          .fh-cat-cell:hover {
            background: var(--fh-surface-3) !important;
          }
          .fh-cat-cell:hover span {
            color: var(--fh-t1);
          }
        `}</style>
      </div>
    </SectionShell>
  )
}
