'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, LogOut, User, MessageSquare, BarChart3, ChevronDown, Target, Calculator, Settings } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useLang } from '@/lib/context/LanguageContext'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const { t } = useLang()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const { user } = useUser()
  const { profile } = useProfile()
  const router = useRouter()

  const NAV_LINKS = [
    { href: '/orders',       label: t.nav.orders      },
    { href: '/freelancers',  label: t.nav.freelancers  },
    { href: '/agents',       label: t.nav.agents       },
    { href: '/ai-search',    label: 'AI Search'        },
    { href: '/ai-assistant', label: t.nav.ai           },
    { href: '/ai-tools',     label: 'AI Tools'         },
    { href: '/contracts',    label: t.nav.contracts    },
    { href: '/pricing',      label: t.nav.pricing ?? 'Pricing' },
  ]

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const avatarUrl   = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || t.auth.dashboard
  const adminEmail  = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const isAdmin     = adminEmail && user?.email === adminEmail

  return (
    <header
      className="sticky top-0 z-50 glass header-safe md:hidden"
      style={{
        borderBottom: '1px solid var(--fh-sep)',
        backgroundColor: 'var(--fh-header-bg)',
      }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-[52px] items-center justify-between gap-2">

          {/* Logo */}
          <Link href={user ? '/feed' : '/'} className="shrink-0 flex items-center">
            <Logo size={28} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-[13px] transition-colors whitespace-nowrap"
                style={{ color: 'var(--fh-t4)', fontWeight: 510, letterSpacing: '-0.01em' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--fh-t1)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fh-t4)')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5 shrink-0">


            {/* Auth */}
            <div className="hidden md:flex items-center gap-1.5">
              {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors"
                      style={{
                        background: menuOpen ? 'var(--fh-surface-3)' : 'var(--fh-surface-2)',
                        border: '1px solid var(--fh-border)',
                      }}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={displayName} width={20} height={20} className="rounded-full" unoptimized />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-primary/30 flex items-center justify-center">
                          <User className="h-3 w-3 text-primary" />
                        </div>
                      )}
                      <span className="text-[13px] max-w-[80px] truncate hidden sm:block" style={{ color: 'var(--fh-t2)', fontWeight: 510 }}>
                        {displayName}
                      </span>
                      <ChevronDown className="h-3 w-3" style={{ color: 'var(--fh-t4)' }} />
                    </button>

                    {menuOpen && (
                      <div
                        className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden py-1 z-50"
                        style={{
                          background: 'var(--popover)',
                          border: '1px solid var(--fh-border-2)',
                          boxShadow: 'var(--shadow-dropdown)',
                        }}
                      >
                        {[
                          { href: '/dashboard',             icon: User,          label: t.auth.dashboard  },
                          { href: '/dashboard/analytics',  icon: BarChart3,     label: t.auth.analytics  },
                          { href: '/dashboard/goals',      icon: Target,        label: t.auth.goals      },
                          { href: '/dashboard/calculator', icon: Calculator,    label: t.auth.calculator },
                          { href: '/messages',             icon: MessageSquare, label: t.auth.messages   },
                          { href: '/settings',             icon: Settings,      label: t.auth.settings ?? 'Settings' },
                        ].map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                            style={{ color: 'var(--fh-t2)', fontWeight: 510 }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)'; e.currentTarget.style.color = 'var(--fh-t1)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fh-t2)' }}
                            onClick={() => setMenuOpen(false)}
                          >
                            <item.icon className="h-3.5 w-3.5" style={{ color: 'var(--fh-t4)' }} />
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
                            Admin
                          </Link>
                        )}
                        <div className="my-1 h-px mx-3" style={{ background: 'var(--fh-sep)' }} />
                        <button
                          onClick={() => { signOut(); setMenuOpen(false) }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] transition-colors"
                          style={{ color: '#e5484d', fontWeight: 510 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,72,77,0.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          {t.auth.logout}
                        </button>
                      </div>
                    )}
                  </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/auth/login"
                    className="px-3 py-1.5 text-[13px] transition-colors whitespace-nowrap"
                    style={{ color: 'var(--fh-t3)', fontWeight: 510 }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t3)' }}
                  >
                    {t.auth.login}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-1.5 rounded-md text-[13px] text-white transition-all whitespace-nowrap"
                    style={{ background: '#5e6ad2', fontWeight: 510, letterSpacing: '-0.01em' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#828fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
                  >
                    {t.auth.register}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden flex items-center justify-center h-8 w-8 rounded-md transition-colors"
              style={{ color: 'var(--fh-t3)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
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
          style={{ borderTop: '1px solid var(--fh-sep)', background: 'var(--card)' }}
        >
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 rounded-lg text-[14px] transition-colors"
                style={{ color: 'var(--fh-t3)', fontWeight: 510 }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-2 mt-1" style={{ borderTop: '1px solid var(--fh-sep)' }}>
              {user ? (
                <div className="space-y-0.5 pt-2">
                  <Link href="/dashboard" className="block px-3 py-2.5 rounded-lg text-[14px]" style={{ color: 'var(--fh-t2)', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                    {t.auth.dashboard}
                  </Link>
                  <Link href="/messages" className="block px-3 py-2.5 rounded-lg text-[14px]" style={{ color: 'var(--fh-t2)', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                    {t.auth.messages}
                  </Link>
                  <Link href="/settings" className="block px-3 py-2.5 rounded-lg text-[14px]" style={{ color: 'var(--fh-t2)', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                    {t.auth.settings ?? 'Settings'}
                  </Link>
                  <button onClick={signOut} className="w-full text-left px-3 py-2.5 rounded-lg text-[14px]" style={{ color: '#e5484d', fontWeight: 510 }}>
                    {t.auth.logout}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link href="/auth/login" className="block px-3 py-2.5 rounded-lg text-[14px] text-center" style={{ color: 'var(--fh-t3)', fontWeight: 510 }} onClick={() => setMobileOpen(false)}>
                    {t.auth.login}
                  </Link>
                  <Link href="/auth/register" className="block px-3 py-2.5 rounded-lg text-[14px] text-white text-center font-medium" style={{ background: '#5e6ad2' }} onClick={() => setMobileOpen(false)}>
                    {t.auth.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
