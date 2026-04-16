'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Users, Plus, MessageSquare, LayoutGrid,
  X, Settings, BarChart3, Target, Calculator,
  Search, Zap, Bot, FileText, LogOut, User,
  LayoutDashboard, Brain, Star,
} from 'lucide-react'
import { useState } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { useLang, LANG_LABELS, Lang } from '@/lib/context/LanguageContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { Currency } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import RoleSwitcher from '@/components/layout/RoleSwitcher'

const LANGS: Lang[] = ['en', 'ru', 'kz']
const CURRENCIES: Currency[] = ['KZT', 'RUB', 'USD', 'EUR', 'USDT']
const CURRENCY_LABELS: Record<Currency, string> = {
  KZT: '₸', RUB: '₽', USD: '$', EUR: '€', GBP: '£',
  USDT: '₮', UAH: '₴', CNY: '¥', AED: 'د.إ', TRY: '₺',
}

const QUICK_LINKS = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/dashboard/analytics',  icon: BarChart3,       label: 'Analytics'  },
  { href: '/dashboard/goals',      icon: Target,          label: 'Goals'      },
  { href: '/dashboard/calculator', icon: Calculator,      label: 'Calculator' },
  { href: '/ai-search',            icon: Search,          label: 'AI Search'  },
  { href: '/ai-assistant',         icon: Brain,           label: 'AI Chat'    },
  { href: '/ai-tools',             icon: Zap,             label: 'AI Tools'   },
  { href: '/agents',               icon: Bot,             label: 'Agents'     },
  { href: '/contracts',            icon: FileText,        label: 'Contracts'  },
  { href: '/pricing',              icon: Star,            label: 'Pricing'    },
  { href: '/orders',               icon: Briefcase,       label: 'Orders'     },
  { href: '/freelancers',          icon: Users,           label: 'People'     },
]

const NAV_ITEMS = [
  { href: '/orders',      label: 'Orders', icon: Briefcase      },
  { href: '/freelancers', label: 'People', icon: Users          },
  { href: '/orders/new',  label: '',       icon: Plus, isCenter: true },
  { href: '/messages',    label: 'Chat',   icon: MessageSquare  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useUser()
  const { profile } = useProfile()
  const { lang, setLang, t } = useLang()
  const { currency, setCurrency } = useCurrency()
  const [moreOpen, setMoreOpen] = useState(false)

  const hidden = pathname.startsWith('/auth') || pathname.startsWith('/messages')
  if (hidden) return null

  const avatarUrl   = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Account'

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMoreOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {/* Bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl"
        style={{
          background: 'var(--fh-header-bg)',
          borderTop: '1px solid var(--fh-sep)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-2 h-16">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = item.href !== '/orders/new' && (
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            )

            if (item.isCenter) {
              return (
                <Link key={item.href} href={item.href} aria-label="Create new order" className="flex items-center justify-center -mt-5">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center justify-center"
                    style={{
                      width: '52px', height: '52px',
                      borderRadius: '10px',
                      background: '#5e6ad2',
                      boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 4px 16px rgba(94,106,210,0.35)',
                    }}
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </motion.div>
                </Link>
              )
            }

            const needsAuth = item.href === '/messages'
            const href = needsAuth && !user ? '/auth/login' : item.href

            return (
              <Link
                key={item.href}
                href={href}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 relative"
              >
                <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5">
                  <div className="relative">
                    <Icon
                      className="h-5 w-5 transition-colors"
                      style={{ color: isActive ? '#7170ff' : 'var(--fh-t4)' }}
                    />
                    {isActive && (
                      <motion.div
                        layoutId="bottomNavDot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full"
                        style={{ background: '#7170ff' }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-medium" style={{ color: isActive ? '#7170ff' : 'var(--fh-t4)' }}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
          >
            <motion.div whileTap={{ scale: 0.85 }} className="flex flex-col items-center gap-0.5">
              {user && avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={22}
                  height={22}
                  className="rounded-full"
                  unoptimized
                  style={{
                    outline: moreOpen ? '2px solid #7170ff' : '2px solid transparent',
                    outlineOffset: '1px',
                  }}
                />
              ) : (
                <LayoutGrid
                  className="h-5 w-5"
                  style={{ color: moreOpen ? '#7170ff' : 'var(--fh-t4)' }}
                />
              )}
              <span className="text-[10px] font-medium" style={{ color: moreOpen ? '#7170ff' : 'var(--fh-t4)' }}>
                More
              </span>
            </motion.div>
          </button>
        </div>
      </nav>

      {/* More sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setMoreOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
              style={{
                background: 'var(--card)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                maxHeight: '88dvh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-[5px] w-10 rounded-full" style={{ background: 'var(--fh-border)' }} />
              </div>

              {/* Header row */}
              <div className="flex items-center justify-between px-4 pt-1 pb-3">
                <span className="text-[16px] font-semibold" style={{ color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                  Menu
                </span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="h-7 w-7 flex items-center justify-center rounded-full"
                  style={{ background: 'var(--fh-surface-2)' }}
                >
                  <X className="h-3.5 w-3.5" style={{ color: 'var(--fh-t3)' }} />
                </button>
              </div>

              <div className="px-4 pb-6 space-y-4">

                {/* Profile card */}
                {user ? (
                  <div
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}
                  >
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={displayName} width={44} height={44} className="rounded-full shrink-0" unoptimized />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold truncate" style={{ color: 'var(--fh-t1)', letterSpacing: '-0.01em' }}>
                        {displayName}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--fh-t4)' }}>
                        {user.email}
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMoreOpen(false)}
                      className="shrink-0 text-[11px] px-3 py-1.5 rounded-lg font-semibold"
                      style={{ background: 'var(--fh-surface-3)', color: 'var(--fh-t3)' }}
                    >
                      Profile
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href="/auth/login"
                      onClick={() => setMoreOpen(false)}
                      className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-center"
                      style={{ background: 'var(--fh-surface-2)', color: 'var(--fh-t2)', border: '1px solid var(--fh-border)' }}
                    >
                      {t.auth.login}
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setMoreOpen(false)}
                      className="flex-1 py-3 rounded-xl text-[13px] font-semibold text-center text-white"
                      style={{ background: '#5e6ad2' }}
                    >
                      {t.auth.register}
                    </Link>
                  </div>
                )}

                {/* Role switcher */}
                {user && (
                  <div>
                    <div className="text-[10px] font-semibold mb-2 px-0.5 uppercase tracking-widest" style={{ color: 'var(--fh-t4)' }}>
                      Mode
                    </div>
                    <RoleSwitcher />
                  </div>
                )}

                {/* Quick links grid */}
                <div>
                  <div className="text-[10px] font-semibold mb-2 px-0.5 uppercase tracking-widest" style={{ color: 'var(--fh-t4)' }}>
                    Features
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {QUICK_LINKS.map(item => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                          style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}
                        >
                          <Icon className="h-[18px] w-[18px]" style={{ color: '#7170ff' }} />
                          <span className="text-[9px] text-center leading-tight px-1" style={{ color: 'var(--fh-t3)', fontWeight: 510 }}>
                            {item.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <div className="text-[10px] font-semibold mb-2 px-0.5 uppercase tracking-widest" style={{ color: 'var(--fh-t4)' }}>
                    Language
                  </div>
                  <div className="flex gap-2">
                    {LANGS.map(l => (
                      <button
                        key={l}
                        onClick={() => setLang(l)}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                        style={{
                          background: lang === l ? '#5e6ad2' : 'var(--fh-surface-2)',
                          color: lang === l ? '#fff' : 'var(--fh-t3)',
                          border: `1px solid ${lang === l ? '#5e6ad2' : 'var(--fh-border)'}`,
                        }}
                      >
                        {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <div className="text-[10px] font-semibold mb-2 px-0.5 uppercase tracking-widest" style={{ color: 'var(--fh-t4)' }}>
                    Currency
                  </div>
                  <div className="flex gap-2">
                    {CURRENCIES.map(c => (
                      <button
                        key={c}
                        onClick={() => setCurrency(c)}
                        className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                        style={{
                          background: currency === c ? '#5e6ad2' : 'var(--fh-surface-2)',
                          color: currency === c ? '#fff' : 'var(--fh-t3)',
                          border: `1px solid ${currency === c ? '#5e6ad2' : 'var(--fh-border)'}`,
                        }}
                      >
                        {CURRENCY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Settings */}
                <Link
                  href="/settings"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl"
                  style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}
                >
                  <Settings className="h-[18px] w-[18px]" style={{ color: 'var(--fh-t3)' }} />
                  <span className="text-[14px]" style={{ color: 'var(--fh-t2)', fontWeight: 510 }}>
                    {t.auth.settings ?? 'Settings'}
                  </span>
                </Link>

                {/* Sign out */}
                {user && (
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl"
                    style={{
                      background: 'rgba(229,72,77,0.07)',
                      border: '1px solid rgba(229,72,77,0.18)',
                    }}
                  >
                    <LogOut className="h-[18px] w-[18px]" style={{ color: '#e5484d' }} />
                    <span className="text-[14px]" style={{ color: '#e5484d', fontWeight: 510 }}>
                      {t.auth.logout}
                    </span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
