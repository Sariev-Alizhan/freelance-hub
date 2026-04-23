import { ImageResponse } from 'next/og'

export const alt = 'FreelanceHub — A freelance platform you can own'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: '#0d0e11',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(39,166,68,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '200px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(39,166,68,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #27a644, #27a644)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: '#fff',
            }}
          >
            F
          </div>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#f7f8f8', letterSpacing: '-0.02em' }}>
            FreelanceHub
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#f7f8f8',
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '800px',
          }}
        >
          Find top freelancers in Kazakhstan & beyond
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#62666d',
            fontWeight: 400,
            marginBottom: '48px',
            maxWidth: '640px',
            lineHeight: 1.4,
          }}
        >
          AI-powered matching · 0% commission · Verified professionals
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            { label: 'Freelancers', color: '#27a644', bg: 'rgba(39,166,68,0.1)', border: 'rgba(39,166,68,0.2)' },
            { label: 'AI-powered', color: '#27a644', bg: 'rgba(39,166,68,0.1)', border: 'rgba(39,166,68,0.2)' },
            { label: '0% Commission', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
          ].map(({ label, color, bg, border }) => (
            <div
              key={label}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: bg,
                border: `1px solid ${border}`,
                fontSize: '16px',
                fontWeight: 600,
                color,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            fontSize: '16px',
            color: '#4a4f57',
            fontWeight: 400,
          }}
        >
          freelance-hub.kz
        </div>
      </div>
    ),
    { ...size }
  )
}
