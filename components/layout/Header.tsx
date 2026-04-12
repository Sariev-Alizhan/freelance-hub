'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, LogOut, User, MessageSquare, BarChart3, ChevronDown } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import NotificationBell from '@/components/layout/NotificationBell'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { useUser } from '@/lib/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { Currency } from '@/lib/types'
import { useRouter } from 'next/navigation'

const CURRENCIES: Currency[] = ['RUB', 'UAH', 'KZT']
const CURRENCY_LABELS: Record<Currency, string> = { RUB: '₽', UAH: '₴', KZT: '₸' }

const NAV_LINKS = [
  { href: '/orders',       label: 'Заказы'     },
  { href: '/freelancers',  label: 'Фрилансеры' },
  { href: '/ai-assistant', label: 'AI-подбор'  },
  { href: '/contracts',    label: 'Контракты'  },
]

export default function Header() {
  const { currency, setCurrency } = useCurrency()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const { user, loading } = useUser()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Профиль'
  const adminEmail  = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const isAdmin     = adminEmail && user?.email === adminEmail

  return (
    <header className="sticky top-0 z-50 glass" style={{
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      backgroundColor: 'rgba(8, 9, 10, 0.85)',
    }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[52px] items-center justify-between">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center">
            <Logo size={30} wordmarkClass="text-[#f7f8f8]" />
          </Link>

          {/* Desktop nav — Linear link style */}
          <nav className="hidden md:flex items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-1.5 text-[13px] transition-colors"
                style={{
                  color: '#8a8f98',
                  fontWeight: 510,
                  letterSpacing: '-0.01em',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f7f8f8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8a8f98')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Currency switcher */}
            <div
              className="hidden sm:flex items-center gap-0.5 p-0.5 rounded-md"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className="px-2 py-0.5 rounded text-[11px] transition-all"
                  style={{
                    fontWeight: 510,
                    background: currency === c ? '#5e6ad2' : 'transparent',
                    color: currency === c ? '#ffffff' : '#8a8f98',
                  }}
                >
                  {CURRENCY_LABELS[c]}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Messages + Bell (logged in) */}
            {user && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/messages"
                  className="flex items-center justify-center h-8 w-8 rounded-md transition-colors"
                  style={{ color: '#8a8f98' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = '#f7f8f8'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = '#8a8f98'
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Link>
                <NotificationBell />
              </div>
            )}

            {/* Auth */}
            {!loading && (
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors"
                      style={{
                        background: menuOpen ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={displayName} width={20} height={20} className="rounded-full" unoptimized />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <span className="text-[13px] max-w-[90px] truncate" style={{ color: '#d0d6e0', fontWeight: 510 }}>
                        {displayName}
                      </span>
                      <ChevronDown className="h-3 w-3" style={{ color: '#62666d' }} />
                    </button>

                    {menuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden py-1 z-50"
                        style={{
                          background: '#191a1b',
                          border: '1px solid rgba(255,255,255,0.08)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.2)',
                        }}
                      >
                        {[
                          { href: '/dashboard', icon: User, label: 'Личный кабинет' },
                          { href: '/messages', icon: MessageSquare, label: 'Сообщения' },
                        ].map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                            style={{ color: '#d0d6e0', fontWeight: 510 }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                              e.currentTarget.style.color = '#f7f8f8'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = '#d0d6e0'
                            }}
                            onClick={() => setMenuOpen(false)}
                          >
                            <item.icon className="h-3.5 w-3.5" style={{ color: '#62666d' }} />
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                            style={{ color: '#7170ff', fontWeight: 510 }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.06)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                            onClick={() => setMenuOpen(false)}
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                            Аналитика
                          </Link>
                        )}
                        <div className="my-1 h-px mx-3" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        <button
                          onClick={() => { signOut(); setMenuOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                          style={{ color: '#e5484d', fontWeight: 510 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,72,77,0.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Выйти
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link
                      href="/auth/login"
                      className="px-3.5 py-1.5 text-[13px] transition-colors"
                      style={{ color: '#8a8f98', fontWeight: 510 }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f7f8f8' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#8a8f98' }}
                    >
                      Войти
                    </Link>
                    <Link
                      href="/auth/register"
                      className="px-3.5 py-1.5 rounded-md text-[13px] text-white transition-all"
                      style={{
                        background: '#5e6ad2',
                        fontWeight: 510,
                        letterSpacing: '-0.01em',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
                    >
                      Начать
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile burger */}
            <button
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-md transition-colors"
              style={{ color: '#8a8f98' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0f1011' }}
        >
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 rounded-lg text-[14px] transition-colors"
                style={{ color: '#8a8f98', fontWeight: 510 }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!loading && (
              <div className="pt-2 mt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {user ? (
                  <div className="space-y-0.5 pt-2">
                    <Link href="/dashboard" className="block px-3 py-2.5 rounded-lg text-[14px] transition-colors" style={{ color: '#d0d6e0', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                      Личный кабинет
                    </Link>
                    <Link href="/messages" className="block px-3 py-2.5 rounded-lg text-[14px] transition-colors" style={{ color: '#d0d6e0', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                      Сообщения
                    </Link>
                    <button onClick={signOut} className="w-full text-left px-3 py-2.5 rounded-lg text-[14px] transition-colors" style={{ color: '#e5484d', fontWeight: 510 }}>
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <Link href="/auth/login" className="block px-3 py-2.5 rounded-lg text-[14px] text-center transition-colors" style={{ color: '#8a8f98', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                      Войти
                    </Link>
                    <Link href="/auth/register" className="block px-3 py-2.5 rounded-lg text-[14px] text-white text-center font-medium" style={{ background: '#5e6ad2' }} onClick={() => setMobileOpen(false)}>
                      Начать бесплатно
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile currency + theme */}
            <div className="pt-3 mt-1 flex items-center gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <ThemeToggle />
              <div className="flex items-center gap-0.5 p-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className="px-3 py-1.5 rounded text-[12px] transition-all"
                    style={{ fontWeight: 510, background: currency === c ? '#5e6ad2' : 'transparent', color: currency === c ? '#fff' : '#8a8f98' }}
                  >
                    {CURRENCY_LABELS[c]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
