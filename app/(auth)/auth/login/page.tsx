'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import { useLang } from '@/lib/context/LanguageContext'
import OAuthButton, { type OAuthProvider } from '@/components/auth/OAuthButton'
import { track } from '@vercel/analytics'

type Provider = OAuthProvider

export default function LoginPage() {
  const { t } = useLang()
  const tl = t.loginPage
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const supabase = createClient()

  async function signIn(provider: Provider) {
    setAuthError(null)
    setLoading(provider)
    track('auth_attempt', { provider, flow: 'login' })
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setAuthError(error.message)
      setLoading(null)
    }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setAuthError(null)
    setLoading('email')
    track('auth_attempt', { provider: 'email', flow: 'login' })
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
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
      {/* Editorial grid background */}
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
        {/* Eyebrow */}
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

        {/* Editorial heading */}
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
          {tl.title.split(' ').slice(0, -1).join(' ')}{' '}
          <span
            style={{
              fontFamily:
                'var(--font-serif-display), ui-serif, Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            {tl.title.split(' ').slice(-1)[0]}
          </span>
        </h1>

        <p style={{ fontSize: 14, color: 'var(--fh-t3)', margin: '0 0 28px' }}>
          {tl.noAccount}{' '}
          <Link
            href="/auth/register"
            style={{
              color: 'var(--fh-t1)',
              fontWeight: 590,
              textDecoration: 'underline',
              textDecorationColor: 'rgba(39,166,68,0.5)',
              textUnderlineOffset: 3,
            }}
          >
            {tl.signUpLink}
          </Link>
        </p>

        {/* Card */}
        <div
          style={{
            borderRadius: 0,
            padding: 22,
            background: 'var(--card)',
            border: '1px solid var(--fh-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
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

          <OAuthButton
            provider="google"
            label={tl.continueGoogle}
            loading={loading}
            onClick={signIn}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <OAuthButton provider="github" label="GitHub" loading={loading} onClick={signIn} />
            <OAuthButton provider="apple" label="Apple" loading={loading} onClick={signIn} />
          </div>

          <OAuthButton
            provider="discord"
            label={tl.continueDiscord}
            loading={loading}
            onClick={signIn}
          />

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0' }}>
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
              {tl.or}
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--fh-sep)' }} />
          </div>

          {sent ? (
            <div
              style={{
                borderRadius: 0,
                padding: 16,
                textAlign: 'center',
                background: 'rgba(39,166,68,0.08)',
                border: '1px solid rgba(39,166,68,0.3)',
              }}
            >
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 590,
                  color: '#27a644',
                  margin: '0 0 4px',
                  letterSpacing: '-0.01em',
                }}
              >
                {tl.checkEmail}
              </p>
              <p style={{ fontSize: 12, color: 'var(--fh-t4)', margin: 0 }}>
                {tl.linkSentTo}{' '}
                <strong style={{ color: 'var(--fh-t2)' }}>{email}</strong>
              </p>
            </div>
          ) : (
            <form
              onSubmit={signInWithEmail}
              style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
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
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(39,166,68,0.6)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--fh-border)'
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
                  cursor:
                    loading !== null || !email.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading !== null || !email.trim() ? 0.5 : 1,
                  transition: 'opacity 0.15s, transform 0.15s',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!(loading !== null || !email.trim()))
                    e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {loading === 'email' ? (
                  <Loader2
                    style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }}
                  />
                ) : (
                  <ArrowRight style={{ width: 15, height: 15 }} />
                )}
                {tl.sendEmailLink}
              </button>
            </form>
          )}
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
          {tl.termsPrefix}{' '}
          <Link
            href="/terms"
            style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}
          >
            {tl.termsLink}
          </Link>{' '}
          {tl.termsAnd}{' '}
          <Link
            href="/privacy"
            style={{ color: 'var(--fh-t3)', textDecoration: 'underline' }}
          >
            {tl.privacyLink}
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
