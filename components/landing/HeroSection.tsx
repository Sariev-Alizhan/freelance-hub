'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const STATS = [
  { val: '0%',   label: 'Commission' },
  { val: '∞',    label: 'Countries'  },
  { val: 'Free', label: 'Forever'    },
]

export default function HeroSection() {
  return (
    <>
      <style>{`
        @keyframes orb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(40px,-30px) scale(1.06); }
        }
        @keyframes orb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-40px,30px) scale(1.04); }
        }
        @keyframes pulseRing {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .hero-shimmer {
          background: linear-gradient(90deg,
            #a78bfa 0%, #7170ff 25%,
            #ffffff 50%,
            #7170ff 75%, #a78bfa 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
      `}</style>

      <section style={{
        position: 'relative',
        minHeight: '100dvh',
        background: '#060612',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}>

        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Orbs */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: 'clamp(300px, 60vw, 640px)', height: 'clamp(300px, 60vw, 640px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, rgba(113,112,255,0.22) 0%, transparent 65%)',
            filter: 'blur(50px)',
            animation: 'orb1 14s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', right: '-8%',
            width: 'clamp(260px, 55vw, 580px)', height: 'clamp(260px, 55vw, 580px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 60% 60%, rgba(94,106,210,0.18) 0%, transparent 65%)',
            filter: 'blur(60px)',
            animation: 'orb2 18s ease-in-out infinite',
          }} />
        </div>

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 5,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          maxWidth: 640,
          width: '100%',
          paddingTop: 'clamp(80px, 14vh, 120px)',
          paddingBottom: 'clamp(60px, 10vh, 80px)',
        }}>

          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: 32 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 99,
              background: 'rgba(39,166,68,0.08)',
              border: '1px solid rgba(39,166,68,0.2)',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#27a644',
                boxShadow: '0 0 8px rgba(39,166,68,0.8)',
                flexShrink: 0,
                animation: 'pulseRing 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#27a644', letterSpacing: '0.01em' }}>
                Platform is live
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(40px, 10vw, 76px)',
              fontWeight: 800,
              lineHeight: 1.0,
              letterSpacing: '-0.04em',
              color: '#fff',
              marginBottom: 12,
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Decentralized
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 28 }}
          >
            <span
              className="hero-shimmer"
              style={{
                fontSize: 'clamp(40px, 10vw, 76px)',
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.04em',
                display: 'block',
              }}
            >
              Freelance Space
            </span>
          </motion.div>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.22 }}
            style={{
              fontSize: 'clamp(15px, 3.2vw, 18px)',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.65,
              maxWidth: 440,
              marginBottom: 40,
              letterSpacing: '-0.01em',
              fontWeight: 400,
            }}
          >
            Work directly with clients and freelancers worldwide.
            No commission, no middlemen — pay any way you want.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            style={{
              display: 'flex',
              gap: 10,
              width: '100%',
              maxWidth: 380,
              marginBottom: 56,
              flexWrap: 'wrap',
            }}
          >
            <Link
              href="/auth/register"
              style={{
                flex: 1, minWidth: 140,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '15px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #5e6ad2 0%, #7170ff 100%)',
                color: '#fff',
                fontSize: 15, fontWeight: 700,
                letterSpacing: '-0.02em',
                boxShadow: '0 0 0 1px rgba(113,112,255,0.35), 0 8px 28px rgba(113,112,255,0.3)',
                textDecoration: 'none',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(113,112,255,0.5), 0 12px 36px rgba(113,112,255,0.4)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(113,112,255,0.35), 0 8px 28px rgba(113,112,255,0.3)'
              }}
            >
              Get started free
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>

            <Link
              href="/orders"
              style={{
                flex: 1, minWidth: 140,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '15px 24px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 15, fontWeight: 600,
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
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              Browse orders
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              width: '100%',
              maxWidth: 340,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                style={{
                  padding: '18px 0',
                  textAlign: 'center',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <div
                  className="hero-shimmer"
                  style={{
                    fontSize: 'clamp(20px, 5vw, 26px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    marginBottom: 5,
                  }}
                >
                  {s.val}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 600,
                  color: 'rgba(255,255,255,0.3)',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>

        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to top, rgba(6,6,18,1) 0%, transparent 100%)',
          zIndex: 4, pointerEvents: 'none',
        }} />
      </section>
    </>
  )
}
