'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowRight, Zap, BadgeCheck, Globe, Sparkles } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'

// ── Floating notification card ────────────────────────────────────────────────
function FloatCard({
  style, icon, text, sub, delay = 0,
}: {
  style?: React.CSSProperties
  icon: React.ReactNode
  text: string
  sub: string
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="float-card"
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 3,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(113,112,255,0.18)',
        fontSize: 16,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>{text}</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1, whiteSpace: 'nowrap' }}>{sub}</div>
      </div>
    </motion.div>
  )
}

// ── Pill badge ────────────────────────────────────────────────────────────────
function Pill({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <div style={{
      flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '7px 14px', borderRadius: 99,
      background: `${color}12`,
      border: `1px solid ${color}30`,
      fontSize: 12, fontWeight: 600, color,
      letterSpacing: '-0.01em', whiteSpace: 'nowrap',
    }}>
      <span>{icon}</span>
      {text}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function HeroSection() {
  const { t } = useLang()
  const h = t.hero

  // Mouse parallax (desktop)
  const heroRef   = useRef<HTMLElement>(null)
  const rawX      = useMotionValue(0)
  const rawY      = useMotionValue(0)
  const springX   = useSpring(rawX, { stiffness: 50, damping: 20 })
  const springY   = useSpring(rawY, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    function onMove(e: MouseEvent) {
      const rect = el!.getBoundingClientRect()
      rawX.set((e.clientX - rect.left - rect.width  / 2) / rect.width  * 30)
      rawY.set((e.clientY - rect.top  - rect.height / 2) / rect.height * 30)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [rawX, rawY])

  // Typewriter stat cycle
  const STATS = [
    { val: '0%',   label: 'Комиссия' },
    { val: '∞',    label: 'Стран' },
    { val: 'Free', label: 'Навсегда' },
  ]
  const [statIdx, setStatIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStatIdx(i => (i + 1) % STATS.length), 2200)
    return () => clearInterval(t)
  }, [])

  const PILLS_RU = [
    { icon: '🇰🇿', text: 'Казахстан',    color: '#fbbf24' },
    { icon: '💜',  text: '0% комиссий',   color: '#a855f7' },
    { icon: '⚡',  text: 'Kaspi · USDT',  color: '#7170ff' },
    { icon: '🤝',  text: 'Напрямую',      color: '#27a644' },
    { icon: '🌍',  text: 'Весь мир',      color: '#06b6d4' },
  ]

  return (
    <>
      {/* ── CSS Animations ────────────────────────────────────────── */}
      <style>{`
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(60px,-40px) scale(1.08); }
          66%      { transform: translate(-30px,50px) scale(0.95); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(-50px,60px) scale(1.05); }
          66%      { transform: translate(40px,-30px) scale(1.1); }
        }
        @keyframes orb3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,40px) scale(1.06); }
        }
        @keyframes pulseRing {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.15); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes floatUp {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes floatDown {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(8px); }
        }
        @keyframes heroGrid {
          0%   { opacity: 0.35; }
          50%  { opacity: 0.55; }
          100% { opacity: 0.35; }
        }
        .float-card:nth-child(1) { animation: floatUp   6s ease-in-out infinite; }
        .float-card:nth-child(2) { animation: floatDown 7s ease-in-out infinite; }
        .float-card:nth-child(3) { animation: floatUp   8s ease-in-out infinite 1s; }

        .hero-shimmer-text {
          background: linear-gradient(
            90deg,
            #a78bfa 0%, #7170ff 20%, #c084fc 40%,
            #ffffff 50%,
            #c084fc 60%, #7170ff 80%, #a78bfa 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .hero-stat-val {
          transition: opacity 0.3s, transform 0.3s;
        }

        @media (min-width: 768px) {
          .float-card-hide { display: none !important; }
        }
        @media (max-width: 767px) {
          .float-card-desktop { display: none !important; }
        }
      `}</style>

      {/* ── Hero Section ──────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: '100dvh',
          background: '#060612',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
        }}
      >
        {/* ── Dot / grid background ─────────────────────────────── */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          animation: 'heroGrid 6s ease-in-out infinite',
        }} />

        {/* ── Gradient orbs ─────────────────────────────────────── */}
        <motion.div style={{ x: springX, y: springY, position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          {/* Orb 1 — top left, purple */}
          <div style={{
            position: 'absolute', top: '-20%', left: '-15%',
            width: 'clamp(320px, 70vw, 700px)', height: 'clamp(320px, 70vw, 700px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, rgba(113,112,255,0.28) 0%, transparent 65%)',
            filter: 'blur(40px)',
            animation: 'orb1 12s ease-in-out infinite',
          }} />
          {/* Orb 2 — bottom right, indigo */}
          <div style={{
            position: 'absolute', bottom: '-25%', right: '-10%',
            width: 'clamp(280px, 65vw, 650px)', height: 'clamp(280px, 65vw, 650px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 60% 60%, rgba(94,106,210,0.22) 0%, transparent 65%)',
            filter: 'blur(50px)',
            animation: 'orb2 15s ease-in-out infinite',
          }} />
          {/* Orb 3 — center, soft violet */}
          <div style={{
            position: 'absolute', top: '35%', left: '40%',
            width: 'clamp(200px, 50vw, 450px)', height: 'clamp(200px, 50vw, 450px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'orb3 18s ease-in-out infinite',
          }} />
          {/* Orb 4 — top right, green accent */}
          <div style={{
            position: 'absolute', top: '8%', right: '5%',
            width: 'clamp(120px, 25vw, 280px)', height: 'clamp(120px, 25vw, 280px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(39,166,68,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'orb1 20s ease-in-out infinite reverse',
          }} />
        </motion.div>

        {/* ── Floating notification cards (desktop only) ─────────── */}
        {/* desktop only — hidden on mobile via CSS */}
        <div className="float-card-desktop" style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
          <FloatCard
            style={{ top: '18%', left: '5%' }}
            icon="✅"
            text="Задача выполнена"
            sub="2 минуты назад"
            delay={0.8}
          />
          <FloatCard
            style={{ top: '30%', right: '4%' }}
            icon="💰"
            text="500 USDT получено"
            sub="Kaspi · мгновенно"
            delay={1.1}
          />
          <FloatCard
            style={{ bottom: '26%', left: '4%' }}
            icon="⭐"
            text="Новый отзыв 5.0"
            sub="«Отличная работа!»"
            delay={1.4}
          />
        </div>

        {/* ── Main content ──────────────────────────────────────── */}
        <div style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          maxWidth: 680,
          width: '100%',
          paddingTop: 'clamp(80px, 16vh, 120px)',
          paddingBottom: 'clamp(60px, 10vh, 80px)',
        }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 99,
              background: 'rgba(39,166,68,0.1)',
              border: '1px solid rgba(39,166,68,0.25)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: '#27a644',
                boxShadow: '0 0 8px rgba(39,166,68,0.8)',
                flexShrink: 0,
                animation: 'pulseRing 2s ease-in-out infinite',
              }} />
              <Sparkles style={{ width: 13, height: 13, color: '#27a644' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#27a644', letterSpacing: '0.01em' }}>
                Платформа запущена · Будь первым
              </span>
            </div>
          </motion.div>

          {/* H1 */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(38px, 10vw, 72px)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#fff',
              marginBottom: 8,
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            {h.h1a}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.17, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 28 }}
          >
            <span
              className="hero-shimmer-text"
              style={{
                fontSize: 'clamp(38px, 10vw, 72px)',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.04em',
                display: 'block',
              }}
            >
              {h.h1b}
            </span>
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            style={{
              fontSize: 'clamp(15px, 3.5vw, 18px)',
              color: 'rgba(255,255,255,0.55)',
              lineHeight: 1.6,
              maxWidth: 480,
              marginBottom: 32,
              letterSpacing: '-0.01em',
              fontWeight: 400,
            }}
          >
            {h.sub}
          </motion.p>

          {/* Feature pills — horizontal scroll on mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            style={{
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none',
              width: '100%',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 40,
              padding: '0 4px',
            }}
          >
            {PILLS_RU.map(p => <Pill key={p.text} {...p} />)}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.42 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              width: '100%',
              maxWidth: 360,
              marginBottom: 48,
            }}
          >
            <Link
              href="/auth/register"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '16px 28px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #5e6ad2 0%, #7170ff 100%)',
                color: '#fff',
                fontSize: 16, fontWeight: 700,
                letterSpacing: '-0.02em',
                boxShadow: '0 0 0 1px rgba(113,112,255,0.4), 0 8px 32px rgba(113,112,255,0.35)',
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(113,112,255,0.5), 0 12px 40px rgba(113,112,255,0.45)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(113,112,255,0.4), 0 8px 32px rgba(113,112,255,0.35)'
              }}
            >
              <Zap style={{ width: 18, height: 18 }} />
              {h.cta1}
              <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>

            <Link
              href="/orders"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '15px 28px',
                borderRadius: 14,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.75)',
                fontSize: 16, fontWeight: 600,
                letterSpacing: '-0.02em',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
              }}
            >
              {h.cta2}
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              width: '100%',
              maxWidth: 360,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.08)',
              overflow: 'hidden',
            }}
          >
            {[
              { val: '0%',   label: 'Комиссия' },
              { val: '∞',    label: 'Стран' },
              { val: 'Free', label: 'Навсегда' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '16px 0',
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                }}
              >
                <div className="hero-shimmer-text" style={{
                  fontSize: 'clamp(20px, 5vw, 26px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {s.val}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            style={{
              marginTop: 24,
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: '0.01em',
            }}
          >
            {h.geo}
          </motion.p>
        </div>

        {/* ── Bottom gradient fade to next section ──────────────── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to top, rgba(6,6,18,1) 0%, transparent 100%)',
          zIndex: 4, pointerEvents: 'none',
        }} />
      </section>

      {/* ── MOBILE sticky CTA bar ─────────────────────────────────── */}
      <MobileStickyBar cta1={h.cta1} cta2={h.cta2} />
    </>
  )
}

// ── Sticky bottom bar (mobile only) ───────────────────────────────────────────
function MobileStickyBar({ cta1, cta2 }: { cta1: string; cta2: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 200) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 999,
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: 'rgba(6,6,18,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        gap: 10,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
        willChange: 'transform',
      }}
    >
      <Link
        href="/auth/register"
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '14px 0',
          borderRadius: 12,
          background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
          color: '#fff',
          fontSize: 15, fontWeight: 700,
          letterSpacing: '-0.01em',
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(113,112,255,0.4)',
        }}
      >
        <Zap style={{ width: 16, height: 16 }} />
        {cta1}
      </Link>
      <Link
        href="/orders"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '14px 18px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 15, fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {cta2}
      </Link>
    </div>
  )
}
