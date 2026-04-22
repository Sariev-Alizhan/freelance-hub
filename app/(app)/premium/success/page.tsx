'use client'
import Link from 'next/link'
import { Crown, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export default function PremiumSuccessPage() {
  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4"
      style={{ background: 'var(--fh-canvas)' }}
    >
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(39,166,68,0.15), rgba(39,166,68,0.08))',
              border: '2px solid rgba(39,166,68,0.3)',
            }}
          >
            <Crown className="h-9 w-9" style={{ color: '#27a644' }} />
          </div>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(24px,5vw,36px)',
            fontWeight: 700,
            color: 'var(--fh-t1)',
            letterSpacing: '-0.04em',
            marginBottom: '12px',
          }}
        >
          You're now Premium!
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--fh-t3)', lineHeight: 1.65, marginBottom: '32px' }}>
          Your account has been upgraded. Unlimited proposals, top search ranking, and your Premium badge are all active now.
        </p>

        {/* What's unlocked */}
        <div
          className="rounded-2xl p-5 mb-8 text-left space-y-3"
          style={{ background: 'var(--fh-surface)', border: '1px solid rgba(39,166,68,0.2)' }}
        >
          {[
            'Unlimited proposals per month',
            'Boosted ranking in search results',
            'Premium badge on your profile',
            'Priority support',
            'All future AI features',
          ].map(item => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#27a644' }} />
              <span style={{ fontSize: '13px', color: 'var(--fh-t2)' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2"
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: '#27a644',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 590,
              textDecoration: 'none',
            }}
          >
            <Sparkles className="h-4 w-4" />
            Go to Operations
          </Link>
          <Link
            href="/orders"
            className="flex-1 flex items-center justify-center gap-2"
            style={{
              padding: '12px 20px',
              borderRadius: '10px',
              background: 'var(--fh-surface)',
              border: '1px solid var(--fh-border)',
              color: 'var(--fh-t2)',
              fontSize: '14px',
              fontWeight: 510,
              textDecoration: 'none',
            }}
          >
            Browse orders <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '20px' }}>
          Receipt sent to your email · Cancel anytime from operations
        </p>
      </div>
    </div>
  )
}
