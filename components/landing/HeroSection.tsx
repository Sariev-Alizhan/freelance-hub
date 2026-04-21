'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLang } from '@/lib/context/LanguageContext'
import { SECONDARY_LINK_STYLE } from './_section-atoms'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_OUT_SOFT: [number, number, number, number] = [0.22, 1, 0.36, 1]

// Rolling ticker items — regions + payment methods + skill verticals
const TICKER = [
  'Kazakhstan', 'Russia', 'Ukraine', 'Belarus', 'Georgia', 'Worldwide',
  'Kaspi', 'USDT', 'Bank transfer', 'Cash', 'Crypto',
  'Development', 'Design', 'SMM', 'Copywriting', 'Video', 'AI / ML',
]

export default function HeroSection() {
  const { t, lang } = useLang()
  const h = t.hero
  // Browsers hyphenate per-language dictionary; KZ falls back to RU.
  const langAttr = lang === 'kz' ? 'ru' : lang

  return (
    <>
      <style>{`
        @keyframes fh-grain {
          0%,100% { transform: translate(0,0); }
          10%     { transform: translate(-5%, -10%); }
          20%     { transform: translate(-15%, 5%); }
          30%     { transform: translate(7%, -25%); }
          40%     { transform: translate(-5%, 25%); }
          50%     { transform: translate(-15%, 10%); }
          60%     { transform: translate(15%, 0%); }
          70%     { transform: translate(0%, 15%); }
          80%     { transform: translate(3%, 25%); }
          90%     { transform: translate(-10%, 10%); }
        }
        @keyframes fh-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes fh-pulse-dot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(0.7); }
        }
        /* Grain: SVG noise with monochrome channel. Opacity + blend mode
           flip between modes so it stays visible but not harsh on light. */
        .fh-grain {
          position: absolute; inset: -50%;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          animation: fh-grain 7s steps(10) infinite;
          pointer-events: none;
          mix-blend-mode: multiply;
          opacity: 0.08;
        }
        .dark .fh-grain {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          mix-blend-mode: overlay;
          opacity: 0.7;
        }

        .fh-scan {
          position: absolute; inset: 0;
          background-image: linear-gradient(
            to bottom,
            transparent 0%,
            transparent calc(50% - 0.5px),
            var(--fh-scan-line) 50%,
            transparent calc(50% + 0.5px),
            transparent 100%
          );
          background-size: 100% 4px;
          pointer-events: none;
        }

        .fh-serif {
          font-family: var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif;
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.015em;
        }

        .fh-cta-primary {
          position: relative;
          isolation: isolate;
          transition: transform 420ms cubic-bezier(0.22,1,0.36,1),
                      background 260ms ease;
        }
        .fh-cta-primary:hover { transform: translateY(-2px); }

        .fh-ticker-track {
          display: flex;
          gap: 48px;
          width: max-content;
          animation: fh-ticker 55s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .fh-ticker-track { animation: none; }
          .fh-grain { animation: none; opacity: 0.04; }
          .dark .fh-grain { opacity: 0.35; }
        }

        /* Hero local design tokens — flipped per theme */
        .fh-hero {
          --fh-scan-line: rgba(0,0,0,0.03);
          --fh-hero-grid-a: rgba(0,0,0,0.06);
          --fh-hero-grid-b: rgba(0,0,0,0.04);
          --fh-hero-ticker-bg: rgba(247,248,248,0.7);
          --fh-hero-stat-border: rgba(0,0,0,0.09);
        }
        .dark .fh-hero {
          --fh-scan-line: rgba(255,255,255,0.02);
          --fh-hero-grid-a: rgba(255,255,255,0.035);
          --fh-hero-grid-b: rgba(255,255,255,0.025);
          --fh-hero-ticker-bg: rgba(7,8,10,0.6);
          --fh-hero-stat-border: rgba(244,244,246,0.09);
        }
      `}</style>

      <section
        className="fh-hero"
        style={{
          position: 'relative',
          minHeight: '100dvh',
          background: 'var(--fh-canvas)',
          color: 'var(--fh-t1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        {/* Layer 1 — fine grid (editorial canvas) */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundImage:
              'linear-gradient(to right, var(--fh-hero-grid-a) 1px, transparent 1px),' +
              'linear-gradient(to bottom, var(--fh-hero-grid-b) 1px, transparent 1px)',
            backgroundSize: '88px 88px, 88px 88px',
            maskImage:
              'radial-gradient(ellipse at 50% 40%, #000 40%, transparent 78%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at 50% 40%, #000 40%, transparent 78%)',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 2 — single accent glow (monochrome + one signal) */}
        <div
          aria-hidden
          style={{
            position: 'absolute', top: '-20%', right: '-10%',
            width: 'min(70vw, 900px)', height: 'min(70vw, 900px)',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 50% 50%, rgba(39,166,68,0.12) 0%, transparent 58%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />

        {/* Layer 3 — grain + scanline overlays */}
        <div aria-hidden className="fh-grain" />
        <div aria-hidden className="fh-scan" />

        {/* Content column */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            maxWidth: 1240,
            margin: '0 auto',
            padding: 'clamp(96px, 14vh, 140px) clamp(20px, 4vw, 48px) clamp(40px, 6vh, 64px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(28px, 4vh, 48px)',
          }}
        >
          {/* Top meta row: live badge + locale/geo micro-label */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--fh-t3)',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#27a644',
                  boxShadow: '0 0 12px rgba(39,166,68,0.8)',
                  animation: 'fh-pulse-dot 2.2s ease-in-out infinite',
                }}
              />
              <span style={{ color: 'var(--fh-t1)' }}>{h.early}</span>
            </span>
            <span style={{ color: 'var(--fh-t4)' }}>{h.badge1}</span>
          </motion.div>

          {/* Headline block */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <motion.h1
              lang={langAttr}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
              style={{
                fontSize: 'clamp(40px, 11vw, 152px)',
                lineHeight: 0.9,
                hyphens: 'auto',
                WebkitHyphens: 'auto',
                letterSpacing: '-0.045em',
                fontWeight: 700,
                margin: 0,
                color: 'var(--fh-t1)',
                fontFeatureSettings: '"cv01", "ss03"',
              }}
            >
              {h.h1a}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: EASE_OUT_EXPO }}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 'clamp(12px, 2vw, 28px)',
                flexWrap: 'wrap',
                marginTop: 'clamp(4px, 1vh, 12px)',
              }}
            >
              <span
                lang={langAttr}
                className="fh-serif"
                style={{
                  fontSize: 'clamp(40px, 11vw, 152px)',
                  lineHeight: 0.9,
                  color: 'var(--fh-t1)',
                  display: 'inline-block',
                  hyphens: 'auto',
                  WebkitHyphens: 'auto',
                }}
              >
                {h.h1b}
              </span>

              {/* Accent slash */}
              <span
                aria-hidden
                style={{
                  width: 'clamp(40px, 6vw, 96px)',
                  height: 2,
                  background: '#27a644',
                  boxShadow: '0 0 24px rgba(39,166,68,0.6)',
                  alignSelf: 'center',
                  marginBottom: 'clamp(12px, 2vw, 28px)',
                  borderRadius: 2,
                }}
              />
            </motion.div>
          </div>

          {/* Sub + CTA + stats — asymmetric two-column */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: 'clamp(24px, 4vh, 40px)',
              alignItems: 'end',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: 'clamp(24px, 3vh, 32px)',
              }}
            >
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24, ease: EASE_OUT_SOFT }}
                style={{
                  maxWidth: 560,
                  fontSize: 'clamp(16px, 1.6vw, 19px)',
                  lineHeight: 1.55,
                  letterSpacing: '-0.012em',
                  color: 'var(--fh-t3)',
                  margin: 0,
                }}
              >
                {h.sub}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.32, ease: EASE_OUT_SOFT }}
                style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center' }}
              >
                <Link
                  href="/auth/register"
                  className="fh-cta-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '18px 30px',
                    background: 'var(--fh-t1)',
                    color: 'var(--fh-canvas)',
                    fontSize: 15,
                    fontWeight: 590,
                    letterSpacing: '-0.01em',
                    textDecoration: 'none',
                    borderRadius: 0,
                  }}
                >
                  {h.cta1}
                </Link>

                <Link href="/orders" style={SECONDARY_LINK_STYLE}>
                  {h.cta2}
                </Link>
              </motion.div>
            </div>

            {/* Specimen-label metadata strip — replaces stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.42, ease: EASE_OUT_SOFT }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'clamp(20px, 3vw, 40px)',
                margin: 0,
                paddingTop: 'clamp(20px, 3vh, 32px)',
                borderTop: '1px solid var(--fh-hero-stat-border)',
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--fh-t3)',
              }}
            >
              <span>v0.1.0</span>
              <span style={{ color: 'var(--fh-t4)' }}>—</span>
              <span>No commission</span>
              <span style={{ color: 'var(--fh-t4)' }}>—</span>
              <span>Self-hostable</span>
              <span style={{ color: 'var(--fh-t4)' }}>—</span>
              <span>Federated identity</span>
              <span style={{ color: 'var(--fh-t4)' }}>—</span>
              <span>Kaspi · USDT · bank</span>
            </motion.div>
          </div>
        </div>

        {/* Ticker — full-bleed bottom band */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            borderTop: '1px solid var(--fh-hero-stat-border)',
            borderBottom: '1px solid var(--fh-hero-stat-border)',
            background: 'var(--fh-hero-ticker-bg)',
            overflow: 'hidden',
          }}
        >
          <div
            className="fh-ticker-track"
            style={{
              padding: '14px 0',
              fontFamily:
                'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
              fontSize: 12,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--fh-t3)',
            }}
          >
            {[...TICKER, ...TICKER].map((item, i) => (
              <span
                key={i}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 48, whiteSpace: 'nowrap' }}
              >
                {item}
                <span
                  aria-hidden
                  style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: 'var(--fh-t4)',
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
