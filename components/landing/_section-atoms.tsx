'use client'
import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode } from 'react'

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Mono uppercase underline link — used as secondary CTA next to the primary button */
export const SECONDARY_LINK_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  fontSize: 11,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--fh-t3)',
  textDecoration: 'underline',
  textDecorationColor: 'var(--fh-t4)',
  textUnderlineOffset: 6,
}

/** Mono uppercase eyebrow label with a short hairline accent dash */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        fontFamily:
          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--fh-t3)',
      }}
    >
      <span
        aria-hidden
        style={{
          display: 'inline-block',
          width: 28,
          height: 2,
          borderRadius: 2,
          background: '#27a644',
          boxShadow: '0 0 16px rgba(39,166,68,0.55)',
        }}
      />
      <span>{children}</span>
    </div>
  )
}

/** Editorial h2: Inter 700 + optional Instrument Serif italic accent */
export function EditorialHeading({
  eyebrow,
  pre,
  accent,
  post,
  sub,
  align = 'left',
}: {
  eyebrow?: string
  pre?: ReactNode
  accent?: ReactNode
  post?: ReactNode
  sub?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        alignItems: align === 'center' ? 'center' : 'flex-start',
        textAlign: align,
      }}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        style={{
          margin: 0,
          fontSize: 'clamp(30px, 4.8vw, 64px)',
          lineHeight: 0.98,
          letterSpacing: '-0.04em',
          fontWeight: 700,
          color: 'var(--fh-t1)',
          fontFeatureSettings: '"cv01", "ss03"',
          maxWidth: 960,
        }}
      >
        {pre}
        {accent && (
          <>
            {pre ? ' ' : ''}
            <span
              style={{
                fontFamily:
                  'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--fh-t1)',
              }}
            >
              {accent}
            </span>
          </>
        )}
        {post && <> {post}</>}
      </h2>
      {sub && (
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.55,
            color: 'var(--fh-t3)',
            maxWidth: 620,
          }}
        >
          {sub}
        </p>
      )}
    </motion.div>
  )
}

/** Fine-grid background layer — used to tie sections to the hero */
export function SectionGrid() {
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage:
          'linear-gradient(to right, rgba(127,127,140,0.06) 1px, transparent 1px),' +
          'linear-gradient(to bottom, rgba(127,127,140,0.04) 1px, transparent 1px)',
        backgroundSize: '88px 88px, 88px 88px',
        maskImage:
          'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)',
      }}
    />
  )
}

/** Section wrapper with consistent padding + optional grid background */
export function SectionShell({
  children,
  withGrid = true,
  id,
}: {
  children: ReactNode
  withGrid?: boolean
  id?: string
}) {
  return (
    <section
      id={id}
      style={{
        position: 'relative',
        padding: 'clamp(72px, 10vw, 140px) clamp(20px, 4vw, 48px)',
        background: 'var(--fh-canvas)',
        borderTop: '1px solid var(--fh-sep)',
        overflow: 'hidden',
      }}
    >
      {withGrid && <SectionShell.Grid />}
      <div
        style={{
          position: 'relative',
          maxWidth: 1240,
          margin: '0 auto',
        }}
      >
        {children}
      </div>
    </section>
  )
}
SectionShell.Grid = SectionGrid
