'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, Code2, ArrowRight, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/context/LanguageContext'
import { UserRole } from '@/lib/supabase/types'
import OAuthButton, { type OAuthProvider } from '@/components/auth/OAuthButton'
import { track } from '@vercel/analytics'

type Provider = OAuthProvider

export default function RegisterPage() {
  const { t } = useLang()
  const tr = t.registerPage
  const tl = t.loginPage
  const [loading, setLoading] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>('client')
  const [authError, setAuthError] = useState<string | null>(null)
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function signUp(provider: Provider) {
    if (!ageConfirmed) {
      setAuthError(tr.mustBe18)
      return
    }
    setAuthError(null)
    setLoading(provider)
    track('signup_attempt', { provider, role })
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setAuthError(error.message)
      setLoading(null)
    }
  }

  async function signUpWithEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    if (!ageConfirmed) {
      setAuthError(tr.mustBe18)
      return
    }
    setAuthError(null)
    setLoading('email')
    track('signup_attempt', { provider: 'email', role })
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}` },
    })
    setLoading(null)
    if (error) {
      setAuthError(error.message)
    } else {
      setSent(true)
      track('auth_otp_sent', { email_domain: email.trim().split('@')[1] })
    }
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px 48px',
        background: 'var(--fh-canvas)',
        color: 'var(--fh-t1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(to right, var(--fh-sep) 1px, transparent 1px),' +
            'linear-gradient(to bottom, var(--fh-sep) 1px, transparent 1px)',
          backgroundSize: '88px 88px, 88px 88px',
          maskImage:
            'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 40%, #000 30%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ width: '100%', maxWidth: '380px', position: 'relative' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 18,
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
              width: 24,
              height: 2,
              borderRadius: 2,
              background: '#27a644',
              boxShadow: '0 0 12px rgba(39,166,68,0.55)',
            }}
          />
          <span>FreelanceHub</span>
          <Logo size={16} showWordmark={false} />
        </div>

        <h1
          style={{
            margin: 0,
            marginBottom: 10,
            fontSize: 'clamp(32px, 5vw, 44px)',
            lineHeight: 1.0,
            letterSpacing: '-0.035em',
            fontWeight: 700,
            color: 'var(--fh-t1)',
            fontFeatureSettings: '"cv01", "ss03"',
          }}
        >
          {tr.title.split(' ').slice(0, -1).join(' ')}{' '}
          <span
            style={{
              fontFamily:
                'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {tr.title.split(' ').slice(-1)[0]}
          </span>
        </h1>

        <p style={{ fontSize: 14, color: 'var(--fh-t3)', margin: '0 0 28px' }}>
          {tr.hasAccount}{' '}
          <Link
            href="/auth/login"
            style={{
              color: 'var(--fh-t1)',
              fontWeight: 590,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(39,166,68,0.5)',
              textUnderlineOffset: 3,
            }}
          >
            {tr.signInLink}
          </Link>
        </p>

        <div
          style={{
            borderRadius: 0,
            padding: 22,
            background: 'var(--card)',
            border: '1px solid var(--fh-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {authError && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(229,72,77,0.08)',
                border: '1px solid rgba(229,72,77,0.25)',
                fontSize: 13,
                color: '#e5484d',
                lineHeight: 1.4,
              }}
            >
              {authError}
            </div>
          )}

          {/* Role selector */}
          <div>
            <p
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 10,
                fontWeight: 500,
                color: 'var(--fh-t4)',
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                margin: '0 0 10px',
              }}
            >
              {tr.iRegisterAs}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(
                [
                  {
                    value: 'client' as UserRole,
                    Icon: Briefcase,
                    label: tr.roleClient,
                    sub: tr.roleClientSub,
                  },
                  {
                    value: 'freelancer' as UserRole,
                    Icon: Code2,
                    label: tr.roleFreelancer,
                    sub: tr.roleFreelancerSub,
                  },
                ]
              ).map(({ value, Icon, label, sub }) => {
                const active = role === value
                return (
                  <button
                    key={value}
                    onClick={() => setRole(value)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '14px 14px',
                      borderRadius: 0,
                      cursor: 'pointer',
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: active ? 'var(--fh-t1)' : 'var(--fh-border)',
                      background: active ? 'var(--fh-t1)' : 'var(--fh-surface-2)',
                      color: active ? 'var(--fh-canvas)' : 'var(--fh-t1)',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    <Icon
                      size={16}
                      style={{
                        color: active ? 'var(--fh-canvas)' : 'var(--fh-t3)',
                      }}
                    />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 590,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: active ? 'rgba(247,248,248,0.7)' : 'var(--fh-t4)',
                        lineHeight: 1.3,
                      }}
                    >
                      {sub}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 18+ age gate */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 0,
              background: ageConfirmed
                ? 'rgba(39,166,68,0.08)'
                : 'var(--fh-surface-2)',
              border: ageConfirmed
                ? '1px solid rgba(39,166,68,0.35)'
                : '1px solid var(--fh-border)',
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <input
              type="checkbox"
              checked={ageConfirmed}
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              style={{
                marginTop: 2,
                width: 16,
                height: 16,
                accentColor: '#27a644',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--fh-t2)', lineHeight: 1.5 }}>
              {tr.age18}{' '}
              <strong style={{ color: 'var(--fh-t1)' }}>{tr.age18Bold}</strong>
              {tr.age18Suffix}
            </span>
          </label>

          {/* Email magic-link */}
          {sent ? (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 0,
                textAlign: 'center',
                background: 'rgba(39,166,68,0.08)',
                border: '1px solid rgba(39,166,68,0.3)',
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 590, color: '#27a644', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                {tl.checkEmail}
              </p>
              <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: 0 }}>
                {tl.linkSentTo} <strong style={{ color: 'var(--fh-t2)' }}>{email}</strong>
              </p>
            </div>
          ) : (
            <form
              onSubmit={signUpWithEmail}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                opacity: ageConfirmed ? 1 : 0.5,
                pointerEvents: ageConfirmed ? 'auto' : 'none',
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  padding: '13px 14px',
                  borderRadius: 0,
                  background: 'var(--fh-surface-2)',
                  border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t1)',
                  fontSize: 14,
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  minHeight: 44,
                }}
              />
              <button
                type="submit"
                disabled={loading !== null || !email.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '13px 18px',
                  borderRadius: 0,
                  background: 'var(--fh-t1)',
                  color: 'var(--fh-canvas)',
                  border: '1px solid var(--fh-t1)',
                  fontSize: 14,
                  fontWeight: 590,
                  letterSpacing: '-0.01em',
                  minHeight: 44,
                  cursor: loading !== null || !email.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading !== null || !email.trim() ? 0.5 : 1,
                  width: '100%',
                }}
              >
                {loading === 'email' ? (
                  <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <ArrowRight style={{ width: 15, height: 15 }} />
                )}
                {tl.sendEmailLink}
              </button>
            </form>
          )}

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--fh-sep)' }} />
            <span
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--fh-t4)',
              }}
            >
              {tr.signUpVia}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--fh-sep)' }} />
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              opacity: ageConfirmed ? 1 : 0.5,
              pointerEvents: ageConfirmed ? 'auto' : 'none',
            }}
          >
            <OAuthButton
              provider="google"
              label={t.loginPage.continueGoogle}
              loading={loading}
              onClick={signUp}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <OAuthButton provider="github" label="GitHub" loading={loading} onClick={signUp} />
              <OAuthButton provider="apple" label="Apple" loading={loading} onClick={signUp} />
            </div>

            <OAuthButton
              provider="discord"
              label={t.loginPage.continueDiscord}
              loading={loading}
              onClick={signUp}
            />
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--fh-t3)',
              margin: 0,
            }}
          >
            {tr.commissionLabel}{' '}
            <span style={{ color: '#27a644', fontWeight: 590 }}>
              {tr.commissionValue}
            </span>{' '}
            {tr.commissionSuffix}
          </p>
        </div>

        <p
          style={{
            textAlign: 'left',
            marginTop: 18,
            fontSize: 11,
            color: 'var(--fh-t4)',
            lineHeight: 1.6,
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
            letterSpacing: '0.04em',
          }}
        >
          {tr.termsPrefix}{' '}
          <Link
            href="/terms"
            style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}
          >
            {tr.termsLink}
          </Link>{' '}
          {tr.termsAnd}{' '}
          <Link
            href="/privacy"
            style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}
          >
            {tr.privacyLink}
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
