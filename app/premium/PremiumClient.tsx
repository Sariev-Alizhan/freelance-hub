'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Crown, Check, Zap, TrendingUp, Shield, MessageSquare,
  Sparkles, Star, ArrowRight, Loader2, ChevronDown,
  Infinity as InfinityIcon, Eye, BadgeCheck, Bell,
  CreditCard, Upload, X, CheckCircle2, Copy, Clock,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { convertFromUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'

function fmt(usd: number, currency: Currency, rates: Record<string, number>): string {
  const sym = CURRENCY_SYMBOLS[currency]
  const n   = Math.round(convertFromUSD(usd, currency, rates))
  const isPrefix = ['USD', 'EUR', 'GBP', 'USDT'].includes(currency)
  const num = isPrefix ? n.toLocaleString('en-US') : n.toLocaleString('ru-RU')
  return isPrefix ? `${sym}${num}` : `${num} ${sym}`
}

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
  { icon: MessageSquare,label: 'Priority support',                    highlight: false },
  { icon: Sparkles,     label: 'All future AI features included',     highlight: false },
]

// Prices in USD — displayed in the user's selected currency
const PLANS = [
  {
    id: 'monthly',
    label: 'Monthly',
    priceUsd: 5,
    totalUsd: 5,
    period: '/month',
    savings: null,
    popular: false,
  },
  {
    id: 'quarterly',
    label: '3 months',
    priceUsd: 4,
    totalUsd: 12,
    period: '/month',
    savings: 'Save 20%',
    popular: true,
  },
  {
    id: 'annual',
    label: 'Annual',
    priceUsd: 3,
    totalUsd: 36,
    period: '/month',
    savings: 'Save 40%',
    popular: false,
  },
]

const FAQ = [
  {
    q: 'How does activation work?',
    a: 'Transfer the amount to our card and send a screenshot of the receipt. We verify and activate Premium within a few hours.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Transfer from any Kazakhstani bank card (Kaspi, Halyk, Forte, and others) by card number.',
  },
  {
    q: 'Can I cancel?',
    a: 'To cancel, message support before the next billing date. Access remains until the end of the paid period.',
  },
  {
    q: 'Does Premium affect how clients see me?',
    a: 'Yes — Premium freelancers rank higher in search and display a prominent badge that builds client trust.',
  },
  {
    q: 'Is there a trial period?',
    a: 'New accounts get a 7-day Premium automatically after completing their profile.',
  },
]

// Card details from env (public — shown to users)
const CARD_NUMBER = process.env.NEXT_PUBLIC_PAYMENT_CARD_NUMBER ?? '0000 0000 0000 0000'
const CARD_HOLDER = process.env.NEXT_PUBLIC_PAYMENT_CARD_HOLDER ?? 'Ализhan Р.'

export default function PremiumClient() {
  const { user } = useUser()
  const { currency, rates } = useCurrency()
  const [selectedPlan, setSelectedPlan] = useState('quarterly')
  const [openFaq,      setOpenFaq]      = useState<number | null>(null)

  // Payment modal state
  const [showModal,  setShowModal]  = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [preview,    setPreview]    = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [copied,     setCopied]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const plan = PLANS.find(p => p.id === selectedPlan)!

  function openModal() {
    if (!user) {
      window.location.href = '/auth/login?next=/premium'
      return
    }
    setShowModal(true)
    setScreenshot(null)
    setPreview(null)
    setError(null)
    setSubmitted(false)
  }

  function closeModal() {
    setShowModal(false)
  }

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Only images are allowed (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large (max 10 MB)')
      return
    }
    setError(null)
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submitPayment() {
    if (!screenshot) {
      setError('Please attach a receipt screenshot')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('plan', selectedPlan)
      form.append('screenshot', screenshot)
      const res = await fetch('/api/payments/card', { method: 'POST', body: form })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Submission error. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function copyCard() {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, '')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
          More orders.<br />
          <span style={{ color: '#7170ff' }}>Stand out from the crowd.</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--fh-t3)', maxWidth: '480px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Unlimited proposals, top search ranking, and a Premium badge — clients will choose you first.
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
                {fmt(p.priceUsd, currency, rates)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{p.period}</span>
              {p.savings && (
                <span style={{ marginTop: '4px', fontSize: '11px', fontWeight: 590, color: '#27a644' }}>
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
              {fmt(0, currency, rates)}
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
              {fmt(plan.priceUsd, currency, rates)}
              <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--fh-t4)', marginLeft: '4px' }}>/month</span>
            </p>
            {plan.id !== 'monthly' && (
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '16px' }}>
                {fmt(plan.totalUsd, currency, rates)} total {plan.id === 'quarterly' ? 'every 3 months' : 'annually'}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {PREMIUM_FEATURES.map(({ icon: Icon, label, highlight }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: highlight ? '#7170ff' : '#27a644' }} />
                  <span style={{ fontSize: '13px', color: highlight ? 'var(--fh-t1)' : 'var(--fh-t2)', fontWeight: highlight ? 510 : 400 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={openModal}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '13px 20px', borderRadius: '10px',
                background: '#5e6ad2', color: '#fff',
                fontSize: '15px', fontWeight: 590,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 4px 16px rgba(94,106,210,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
            >
              {user
                ? <><CreditCard className="h-4 w-4" /> Get Premium <ArrowRight className="h-4 w-4" /></>
                : <><Crown className="h-4 w-4" /> Get Premium — sign in first</>
              }
            </button>

            <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--fh-t4)' }}>
              Card payment · Activation within a few hours
            </p>
          </div>
        </div>

        {/* ── Social proof ── */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
          {[
            { stat: '3×', label: 'more orders on average' },
            { stat: '87%', label: 'of Premium users get hired faster' },
            { stat: '7 days', label: 'free trial period' },
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
              { name: 'Arman K.', role: 'Full-Stack Developer', text: 'In my first Premium month, I landed 4 new clients. The ranking boost really works.', stars: 5 },
              { name: 'Diana S.', role: 'UI/UX Designer', text: 'Unlimited proposals are worth it. Before, my limit ran out within 2 weeks.', stars: 5 },
              { name: 'Ruslan M.', role: 'Data Analyst', text: 'The Premium badge immediately builds trust. My response rate went up 40%.', stars: 5 },
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
            Questions?{' '}
            <Link href="/messages" style={{ color: '#7170ff' }}>Contact support</Link>
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
              Создать бесплатный аккаунт <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          PAYMENT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div style={{
            width: '100%', maxWidth: '440px',
            background: 'var(--fh-surface)', borderRadius: '20px',
            border: '1px solid var(--fh-border-2)',
            overflow: 'hidden',
            maxHeight: '90vh', overflowY: 'auto',
          }}>

            {/* Modal header */}
            <div style={{
              padding: '20px 20px 0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard className="h-5 w-5" style={{ color: '#7170ff' }} />
                <span style={{ fontSize: '16px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                  Pay for Premium
                </span>
              </div>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fh-t4)', padding: '4px' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div style={{ padding: '20px' }}>

              {/* ── Success state ── */}
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '16px',
                      background: 'rgba(39,166,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle2 className="h-8 w-8" style={{ color: '#27a644' }} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px', letterSpacing: '-0.03em' }}>
                    Receipt received!
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.65, marginBottom: '20px' }}>
                    We&apos;ll verify the payment and activate Premium within a few hours.
                    You&apos;ll receive a notification on the site.
                  </p>
                  <div style={{
                    padding: '12px 16px', borderRadius: '10px',
                    background: 'rgba(39,166,68,0.06)', border: '1px solid rgba(39,166,68,0.15)',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '12px', color: '#27a644', marginBottom: '16px',
                  }}>
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    Usually confirmed within 1–3 hours during business hours
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      width: '100%', padding: '11px', borderRadius: '10px',
                      background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                      color: 'var(--fh-t2)', fontSize: '14px', fontWeight: 510, cursor: 'pointer',
                    }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Plan summary */}
                  <div style={{
                    padding: '12px 14px', borderRadius: '10px', marginBottom: '20px',
                    background: 'rgba(94,106,210,0.06)', border: '1px solid rgba(94,106,210,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>Selected plan</span>
                      <div style={{ fontSize: '15px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                        {plan.label}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '22px', fontWeight: 700, color: '#7170ff', letterSpacing: '-0.04em' }}>
                        {fmt(plan.totalUsd, currency, rates)}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>to transfer</span>
                    </div>
                  </div>

                  {/* Step 1 — Card details */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                      1. Transfer to card
                    </p>
                    <div style={{
                      borderRadius: '12px', padding: '16px',
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                      border: '1px solid rgba(113,112,255,0.2)',
                      position: 'relative',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          CARD NUMBER
                        </span>
                        <button
                          onClick={copyCard}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            background: 'rgba(255,255,255,0.08)', border: 'none',
                            borderRadius: '6px', padding: '4px 8px',
                            color: 'rgba(255,255,255,0.6)', fontSize: '11px', cursor: 'pointer',
                          }}
                        >
                          {copied ? <CheckCircle2 className="h-3 w-3" style={{ color: '#27a644' }} /> : <Copy className="h-3 w-3" />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p style={{
                        fontSize: '20px', fontWeight: 700, color: '#ffffff',
                        letterSpacing: '0.12em', marginBottom: '12px',
                        fontFamily: 'monospace',
                      }}>
                        {CARD_NUMBER}
                      </p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 510 }}>
                        {CARD_HOLDER}
                      </p>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '8px' }}>
                      Add comment: <strong style={{ color: 'var(--fh-t3)' }}>Premium {plan.label}</strong>
                    </p>
                  </div>

                  {/* Step 2 — Screenshot upload */}
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '11px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                      2. Attach receipt screenshot
                    </p>

                    {preview ? (
                      <div style={{ position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preview}
                          alt="receipt preview"
                          style={{
                            width: '100%', borderRadius: '10px',
                            border: '1px solid var(--fh-border)',
                            maxHeight: '200px', objectFit: 'cover',
                          }}
                        />
                        <button
                          onClick={() => { setScreenshot(null); setPreview(null) }}
                          style={{
                            position: 'absolute', top: '8px', right: '8px',
                            background: 'rgba(0,0,0,0.6)', border: 'none',
                            borderRadius: '50%', width: '28px', height: '28px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#fff',
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault()
                          const f = e.dataTransfer.files[0]
                          if (f) handleFile(f)
                        }}
                        style={{
                          border: '2px dashed var(--fh-border-2)', borderRadius: '12px',
                          padding: '32px 20px', textAlign: 'center', cursor: 'pointer',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(113,112,255,0.4)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--fh-border-2)' }}
                      >
                        <Upload className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--fh-t4)' }} />
                        <p style={{ fontSize: '13px', color: 'var(--fh-t2)', fontWeight: 510 }}>
                          Click or drag & drop receipt
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '4px' }}>
                          JPG, PNG, WEBP · max 10 MB
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div style={{
                      padding: '10px 14px', borderRadius: '8px', marginBottom: '16px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      fontSize: '13px', color: '#ef4444',
                    }}>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={submitPayment}
                    disabled={submitting || !screenshot}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      padding: '13px 20px', borderRadius: '10px',
                      background: screenshot ? '#5e6ad2' : 'var(--fh-surface-2)',
                      color: screenshot ? '#fff' : 'var(--fh-t4)',
                      fontSize: '14px', fontWeight: 590,
                      border: 'none', cursor: submitting || !screenshot ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                      : <><Zap className="h-4 w-4" /> Send receipt</>
                    }
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--fh-t4)', marginTop: '12px' }}>
                    Activation after review · Usually 1–3 hours
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
