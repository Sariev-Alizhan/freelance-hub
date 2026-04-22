'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function SplashScreen() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--fh-surface)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Centered logo */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Image
          src="/logo-icon.svg"
          alt="FreelanceHub"
          width={88}
          height={88}
          priority
          style={{ borderRadius: 20, boxShadow: '0 8px 32px rgba(67,56,202,0.18)' }}
        />
      </motion.div>

      {/* Bottom branding */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 6,
          paddingBottom: 28,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--fh-t4)', letterSpacing: '0.02em' }}>
          from
        </span>
        <span
          style={{
            fontSize: 17, fontWeight: 700,
            background: 'linear-gradient(135deg, #4338CA, #27a644)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}
        >
          FreelanceHub
        </span>
      </motion.div>
    </div>
  )
}
