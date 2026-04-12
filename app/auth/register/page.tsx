'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Briefcase, Code2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/supabase/types'

export default function RegisterPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [role, setRole] = useState<UserRole>('client')
  const supabase = createClient()

  async function signUpWithProvider(provider: 'google' | 'github') {
    setLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      console.error(error)
      setLoading(null)
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-52px)] flex items-center justify-center px-4 py-16"
      style={{ background: '#08090a' }}
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
              color: '#f7f8f8',
              marginBottom: '8px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Создать аккаунт
          </h1>
          <p style={{ fontSize: '13px', color: '#62666d', fontWeight: 400 }}>
            Уже есть аккаунт?{' '}
            <Link
              href="/auth/login"
              style={{ color: '#7170ff', fontWeight: 510 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#828fff' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#7170ff' }}
            >
              Войти
            </Link>
          </p>
        </div>

        <div
          className="rounded-xl p-6 space-y-5"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Role selector */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 590, color: '#8a8f98', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Вы регистрируетесь как
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                { value: 'client' as UserRole, icon: Briefcase, label: 'Заказчик', sub: 'Размещаю задачи' },
                { value: 'freelancer' as UserRole, icon: Code2, label: 'Фрилансер', sub: 'Выполняю заказы' },
              ]).map(({ value, icon: Icon, label, sub }) => {
                const active = role === value
                return (
                  <button
                    key={value}
                    onClick={() => setRole(value)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all"
                    style={{
                      border: active ? '1px solid rgba(113,112,255,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      background: active ? 'rgba(113,112,255,0.08)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: active ? '#7170ff' : '#62666d' }} />
                    <span style={{ fontSize: '13px', fontWeight: 590, color: active ? '#f7f8f8' : '#8a8f98', letterSpacing: '-0.01em' }}>
                      {label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#62666d', fontWeight: 400 }}>{sub}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => signUpWithProvider('google')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
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
              {loading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white" fillOpacity="0.9"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white" fillOpacity="0.9"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white" fillOpacity="0.9"/>
                </svg>
              )}
              Продолжить с Google
            </button>

            <button
              onClick={() => signUpWithProvider('github')}
              disabled={loading !== null}
              className="w-full flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
              style={{
                padding: '10px 16px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#d0d6e0',
                fontSize: '14px',
                fontWeight: 510,
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { if (loading === null) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              {loading === 'github' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              )}
              Продолжить с GitHub
            </button>
          </div>

          <p className="text-center" style={{ fontSize: '12px', color: '#4a4f57', fontWeight: 400 }}>
            Комиссия платформы:{' '}
            <span style={{ color: '#27a644', fontWeight: 590 }}>0%</span>{' '}
            — навсегда
          </p>
        </div>

        <p className="text-center mt-5" style={{ fontSize: '12px', color: '#4a4f57', fontWeight: 400 }}>
          Регистрируясь, вы принимаете{' '}
          <Link href="#" style={{ color: '#62666d' }} onMouseEnter={e => { e.currentTarget.style.color = '#8a8f98' }} onMouseLeave={e => { e.currentTarget.style.color = '#62666d' }}>
            условия использования
          </Link>
        </p>
      </div>
    </div>
  )
}
