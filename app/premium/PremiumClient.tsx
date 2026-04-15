'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  Crown, Check, Zap, TrendingUp, Shield, MessageSquare,
  Sparkles, Star, ArrowRight, Loader2, ChevronDown,
  Infinity as InfinityIcon, Eye, BadgeCheck, Bell,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'

const FREE_FEATURES = [
  'Post orders — free forever',
  'Up to 5 proposals/month',
  'Basic profile',
  'All marketplace features',
  'AI Smart Search',
]

const PREMIUM_FEATURES = [
  { icon: InfinityIcon, label: 'Unlimited proposals per month',       highlight: true  },
  { icon: TrendingUp,   label: 'Boosted ranking in search results',   highlight: true  },
  { icon: Crown,        label: 'Premium badge on your profile',       highlight: false },
  { icon: BadgeCheck,   label: 'Priority verification review',        highlight: false },
  { icon: Eye,          label: 'See who viewed your profile',         highlight: false },
  { icon: Bell,         label: 'Saved search alerts — no limit',      highlight: false },
  { icon: MessageSquare,label: 'Priority support',                     highlight: false },
  { icon: Sparkles,     label: 'All future AI features included',     highlight: false },
]

const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: 2000,
    currency: '₸',
    period: '/month',
    savings: null,
    popular: false,
  },
  {
    id: 'quarterly',
    label: '3 months',
    price: 1600,
    currency: '₸',
    period: '/month',
    savings: 'Save 20%',
    popular: true,
    total: 4800,
  },
  {
    id: 'annual',
    label: 'Annual',
    price: 1200,
    currency: '₸',
    period: '/month',
    savings: 'Save 40%',
    popular: false,
    total: 14400,
  },
]

const FAQ = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel before the next billing date and you\'ll keep Premium until the end of your paid period. No questions asked.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Visa, Mastercard, Apple Pay, Google Pay — all major bank cards accepted. Payment is processed securely via LemonSqueezy.',
  },
  {
    q: 'Does Premium affect how clients see me?',
    a: 'Yes — Premium freelancers appear higher in search results and have a visible badge that builds trust with clients.',
  },
  {
    q: 'Is there a free trial?',
    a: 'New accounts get a 7-day Premium trial automatically after completing their profile.',
  },
  {
    q: 'What happens to my proposals if I downgrade?',
    a: 'Existing proposals remain active. After downgrading, the 5/month free limit kicks in at the start of your next billing cycle.',
  },
]

export default function PremiumClient() {
  const { user } = useUser()
  const [selectedPlan, setSelectedPlan] = useState('quarterly')
  const [loading, setLoading]           = useState(false)
  const [openFaq,  setOpenFaq]          = useState<number | null>(null)

  const plan = PLANS.find(p => p.id === selectedPlan)!

  async function handleUpgrade() {
    if (!user) {
      window.location.href = '/auth/login?next=/premium'
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/payments/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('[premium] checkout error:', data.error)
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--fh-canvas)', minHeight: 'calc(100vh - 52px)' }}>

      {/* ── Hero ── */}
      <div style={{
        padding: 'clamp(48px,6vw,88px) 16px 0',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(94,106,210,0.05) 0%, transparent 100%)',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 14px', borderRadius: '100px', marginBottom: '20px',
          background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)',
          fontSize: '12px', fontWeight: 590, color: '#7170ff',
        }}>
          <Crown className="h-3.5 w-3.5" /> FreelanceHub Premium
        </div>

        <h1 style={{
          fontSize: 'clamp(28px,5vw,50px)', fontWeight: 510,
          letterSpacing: '-0.05em', color: 'var(--fh-t1)',
          marginBottom: '14px', lineHeight: 1.05,
          fontFeatureSettings: '"cv01", "ss03"',
        }}>
          Get more orders.<br />
          <span style={{ color: '#7170ff' }}>Stand out from the crowd.</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--fh-t3)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Unlimited proposals, top search placement, and a Premium badge that makes clients choose you first.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-20">

        {/* ── Plan selector ── */}
        <div style={{
          display: 'flex', gap: '10px', justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: '28px',
        }}>
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '14px 24px', borderRadius: '12px', minWidth: '130px',
                background: selectedPlan === p.id ? 'rgba(94,106,210,0.08)' : 'var(--fh-surface)',
                border: selectedPlan === p.id ? '2px solid rgba(94,106,210,0.4)' : '1px solid var(--fh-border)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {p.popular && (
                <span style={{
                  position: 'absolute', top: '-10px',
                  fontSize: '10px', fontWeight: 700, padding: '2px 10px',
                  borderRadius: '100px', background: '#5e6ad2', color: '#fff',
                  letterSpacing: '0.04em',
                }}>
                  POPULAR
                </span>
              )}
              <span style={{ fontSize: '13px', color: 'var(--fh-t3)', marginBottom: '4px' }}>{p.label}</span>
              <span style={{ fontSize: '22px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                {p.currency}{p.price}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{p.period}</span>
              {p.savings && (
                <span style={{
                  marginTop: '4px', fontSize: '11px', fontWeight: 590,
                  color: '#27a644',
                }}>
                  {p.savings}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>

          {/* Free */}
          <div style={{
            borderRadius: '16px', padding: '24px',
            background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
          }}>
            <p style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Free
            </p>
            <p style={{ fontSize: '28px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '20px', letterSpacing: '-0.03em' }}>
              ₸0
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--fh-t4)', marginLeft: '4px' }}>/month</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {FREE_FEATURES.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', padding: '10px 16px', borderRadius: '8px', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textAlign: 'center', fontSize: '13px', color: 'var(--fh-t4)' }}>
              Current plan
            </div>
          </div>

          {/* Premium */}
          <div style={{
            borderRadius: '16px', padding: '24px',
            background: 'linear-gradient(135deg, rgba(94,106,210,0.06) 0%, rgba(113,112,255,0.04) 100%)',
            border: '1.5px solid rgba(94,106,210,0.35)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '160px', height: '160px',
              background: 'radial-gradient(circle, rgba(113,112,255,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 590, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Premium
              </p>
              <Crown className="h-3.5 w-3.5" style={{ color: '#7170ff' }} />
            </div>
            <p style={{ fontSize: '28px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '4px', letterSpacing: '-0.03em' }}>
              ₸{plan.price}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--fh-t4)', marginLeft: '4px' }}>/month</span>
            </p>
            {'total' in plan && plan.total && (
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '16px' }}>
                ₸{plan.total} billed {plan.id === 'quarterly' ? 'every 3 months' : 'annually'}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {PREMIUM_FEATURES.map(({ icon: Icon, label, highlight }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: highlight ? '#7170ff' : '#27a644' }}
                  />
                  <span style={{
                    fontSize: '13px',
                    color: highlight ? 'var(--fh-t1)' : 'var(--fh-t2)',
                    fontWeight: highlight ? 510 : 400,
                  }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpgrade}
              disabled={loading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px 20px', borderRadius: '10px',
                background: '#5e6ad2', color: '#fff',
                fontSize: '15px', fontWeight: 590,
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 4px 16px rgba(94,106,210,0.25)',
                transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#828fff' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#5e6ad2' }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to checkout…</>
                : user
                ? <><Zap className="h-4 w-4" /> Upgrade to Premium <ArrowRight className="h-4 w-4" /></>
                : <><Crown className="h-4 w-4" /> Get Premium — Sign in first</>
              }
            </button>

            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--fh-t4)' }}>
              Cancel anytime · No hidden fees · 7-day trial for new users
            </p>
          </div>
        </div>

        {/* ── Social proof ── */}
        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: '48px',
        }}>
          {[
            { stat: '3×', label: 'more orders on average' },
            { stat: '87%', label: 'of premium users get hired faster' },
            { stat: '7 days', label: 'free trial for new members' },
          ].map(({ stat, label }) => (
            <div key={stat} style={{
              textAlign: 'center', padding: '16px 24px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
              borderRadius: '12px', minWidth: '130px',
            }}>
              <p style={{ fontSize: '24px', fontWeight: 590, color: '#7170ff', letterSpacing: '-0.04em', marginBottom: '4px' }}>{stat}</p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonials ── */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 590, color: 'var(--fh-t1)', textAlign: 'center', marginBottom: '20px', letterSpacing: '-0.03em' }}>
            What Premium members say
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {[
              { name: 'Arman K.', role: 'Full-Stack Developer', text: 'Got 4 new clients in my first premium month. The ranking boost is real.', stars: 5 },
              { name: 'Diana S.', role: 'UI/UX Designer', text: 'The unlimited proposals alone are worth it. I used to run out in 2 weeks.', stars: 5 },
              { name: 'Ruslan M.', role: 'Data Analyst', text: 'Premium badge makes clients trust me more. My response rate went up 40%.', stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} style={{
                padding: '18px', borderRadius: '12px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
              }}>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5" fill="#fbbf24" stroke="#fbbf24" />
                  ))}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--fh-t2)', lineHeight: 1.6, marginBottom: '12px' }}>"{text}"</p>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>{name}</p>
                  <p style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: '640px', margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 590, color: 'var(--fh-t1)', textAlign: 'center', marginBottom: '16px', letterSpacing: '-0.03em' }}>
            FAQ
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{
                borderRadius: '10px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)' }}>{item.q}</span>
                  <ChevronDown
                    className="h-4 w-4 flex-shrink-0"
                    style={{
                      color: 'var(--fh-t4)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.2s',
                      marginLeft: '12px',
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 16px 14px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginBottom: '12px' }}>
            Have questions?{' '}
            <Link href="/messages" style={{ color: '#7170ff' }}>Chat with support</Link>
          </p>
          {!user && (
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 22px', borderRadius: '8px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t2)', fontSize: '13px', fontWeight: 510, textDecoration: 'none',
              }}
            >
              Create free account <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
