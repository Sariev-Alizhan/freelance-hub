'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function signInWithProvider(provider: 'google' | 'github') {
    setLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error(error)
      setLoading(null)
    }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading('email')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(null)
    if (!error) setSent(true)
  }

  return (
    <div
      className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4 py-16"
      style={{ background: 'var(--fh-canvas)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-5">
            <Logo size={40} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 510,
              letterSpacing: '-0.03em',
              color: 'var(--fh-t1)',
              marginBottom: '8px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Sign In
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400 }}>
            No account?{' '}
            <Link
              href="/auth/register"
              style={{ color: '#7170ff', fontWeight: 510 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#828fff' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7170ff' }}
            >
              Register
            </Link>
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6 space-y-3"
          style={{
            background: 'var(--fh-surface)',
            border: '1px solid var(--fh-border-2)',
          }}
        >
          {/* Google */}
          <button
            onClick={() => signInWithProvider('google')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t2)',
              fontSize: '14px',
              fontWeight: 510,
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (loading === null) e.currentTarget.style.background = 'var(--fh-surface-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
          >
            {loading === 'google' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* GitHub */}
          <button
            onClick={() => signInWithProvider('github')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            style={{
              padding: '10px 16px',
              borderRadius: '6px',
              background: 'var(--fh-surface-2)',
              border: '1px solid var(--fh-border-2)',
              color: 'var(--fh-t2)',
              fontSize: '14px',
              fontWeight: 510,
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => { if (loading === null) e.currentTarget.style.background = 'var(--fh-surface-3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
          >
            {loading === 'github' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            )}
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'var(--fh-sep)' }} />
            <span style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>or via email</span>
            <div className="flex-1 h-px" style={{ background: 'var(--fh-sep)' }} />
          </div>

          {/* Magic link */}
          {sent ? (
            <div
              className="rounded-lg p-4 text-center"
              style={{
                background: 'rgba(39,166,68,0.06)',
                border: '1px solid rgba(39,166,68,0.18)',
              }}
            >
              <p style={{ fontSize: '14px', fontWeight: 510, color: '#27a644', marginBottom: '4px' }}>Email sent!</p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 400 }}>
                Check {email} — we sent you a magic link to sign in
              </p>
            </div>
          ) : (
            <form onSubmit={signInWithEmail} className="space-y-2.5">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full transition-all outline-none"
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'var(--fh-surface-2)',
                  border: '1px solid var(--fh-border-2)',
                  color: 'var(--fh-t1)',
                  fontSize: '16px',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                }}
                onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.4)' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
              />
              <button
                type="submit"
                disabled={loading !== null || !email.trim()}
                className="w-full flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  background: '#5e6ad2',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 510,
                  letterSpacing: '-0.01em',
                  boxShadow: '0 0 0 1px rgba(113,112,255,0.3)',
                }}
                onMouseEnter={e => { if (loading === null) e.currentTarget.style.background = '#828fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                {loading === 'email' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Get magic link
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-5" style={{ fontSize: '12px', color: 'var(--fh-t2)', fontWeight: 400 }}>
          By signing in you agree to our{' '}
          <Link href="#" style={{ color: 'var(--fh-t3)' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t2)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t3)' }}>
            Terms of Use
          </Link>
          {' '}and{' '}
          <Link href="#" style={{ color: 'var(--fh-t3)' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t2)' }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t3)' }}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
