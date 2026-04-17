'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Briefcase, Plus, User,
  Settings, BarChart3,
  Search, Zap, FileText, LogOut,
  LayoutDashboard, Brain, Star, Users, MessageSquare,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { useUnreadNotifications } from '@/lib/hooks/useUnreadNotifications'
import { useUnreadMessages } from '@/lib/hooks/useUnreadMessages'
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
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/ai-search',            icon: Search,          label: 'AI Search'  },
  { href: '/ai-assistant',         icon: Brain,           label: 'AI Chat'    },
  { href: '/freelancers',          icon: Users,           label: 'People'     },
  { href: '/contracts',            icon: FileText,        label: 'Contracts'  },
  { href: '/ai-tools',             icon: Zap,             label: 'AI Tools'   },
  { href: '/pricing',              icon: Star,            label: 'Pricing'    },
  { href: '/dashboard/analytics',  icon: BarChart3,       label: 'Analytics'  },
  { href: '/settings',             icon: Settings,        label: 'Settings'   },
]

// ── Tab definition ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'feed',          href: '/feed',          icon: Home,         matchPrefix: '/feed'          },
  { id: 'orders',        href: '/orders',        icon: Briefcase,    matchPrefix: '/orders'        },
  { id: 'create',        href: '/orders/new',    icon: Plus,         isCenter: true                },
  { id: 'messages',      href: '/messages',      icon: MessageSquare,matchPrefix: '/messages'      },
  { id: 'profile',       href: null,             icon: User,         isProfile: true               },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useUser()
  const { profile } = useProfile()
  const { lang, setLang, t } = useLang()
  const { currency, setCurrency } = useCurrency()
  const [sheetOpen, setSheetOpen] = useState(false)
  const unreadNotifs = useUnreadNotifications()
  const unreadMsgs = useUnreadMessages()

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setSheetOpen(false)
    router.push('/')
    router.refresh()
  }, [router])

  const isActive = useCallback((tab: typeof TABS[0]) => {
    if (tab.isCenter || tab.isProfile) return false
    if (tab.matchPrefix === '/feed') return pathname === '/feed' || pathname === '/'
    return !!tab.matchPrefix && pathname.startsWith(tab.matchPrefix)
  }, [pathname])

  const hidden = pathname.startsWith('/auth')
  if (hidden) return null

  const avatarUrl   = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Аккаунт'

  return (
    <>
      {/* ── Bottom navigation bar ─────────────────────────────────── */}
      <nav
        className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'var(--fh-nav-bg, var(--fh-header-bg))',
          borderTop: '0.5px solid var(--fh-sep)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          contain: 'layout style',
          transform: 'translateZ(0)',
        }}
      >
        <div className="flex items-center" style={{ height: 52 }}>
          {TABS.map(tab => {
            const Icon  = tab.icon
            const active = isActive(tab)

            // ── Center + button ────────────────────────────────────
            if (tab.isCenter) {
              return (
                <div key={tab.id} className="flex-1 flex items-center justify-center">
                  <Link
                    href={user ? tab.href! : '/auth/login'}
                    aria-label="Создать заказ"
                  >
                    <div
                      style={{
                        width: 40, height: 40,
                        borderRadius: 12,
                        background: 'var(--fh-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Plus style={{ width: 20, height: 20, color: '#fff', strokeWidth: 2.2 }} />
                    </div>
                  </Link>
                </div>
              )
            }

            // ── Profile button → opens sheet ───────────────────────
            if (tab.isProfile) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setSheetOpen(true)}
                  className="flex-1 flex items-center justify-center"
                  style={{ height: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <div className="transition-transform duration-100 active:scale-[0.85]" style={{ position: 'relative' }}>
                    {unreadNotifs > 0 && (
                      <span style={{
                        position: 'absolute', top: -2, right: -2, zIndex: 1,
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#e5484d',
                        boxShadow: '0 0 0 1.5px var(--fh-nav-bg, var(--fh-header-bg))',
                      }} />
                    )}
                    {user && avatarUrl ? (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', overflow: 'hidden',
                        outline: sheetOpen ? '2px solid var(--fh-primary)' : '2px solid transparent',
                        outlineOffset: 1.5,
                        transition: 'outline-color 0.15s',
                      }}>
                        <Image src={avatarUrl} alt="" width={26} height={26} style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                    ) : (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: sheetOpen ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
                        border: `1.5px solid ${sheetOpen ? 'var(--fh-primary)' : 'var(--fh-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}>
                        <User style={{ width: 14, height: 14, color: sheetOpen ? '#fff' : 'var(--fh-t4)' }} />
                      </div>
                    )}
                  </div>
                </button>
              )
            }

            // ── Normal tab ─────────────────────────────────────────
            const href = (tab.id === 'messages' && !user) ? '/auth/login' : tab.href!
            const badge = tab.id === 'messages' ? unreadMsgs : 0

            return (
              <Link
                key={tab.id}
                href={href}
                className="flex-1 flex items-center justify-center"
                style={{ height: '100%' }}
              >
                <div className="transition-transform duration-100 active:scale-[0.82]" style={{ position: 'relative' }}>
                  <Icon
                    style={{
                      width: 24, height: 24,
                      color: active ? 'var(--fh-t1)' : 'var(--fh-t4)',
                      // Filled vs outlined — simulate fill with stroke weight
                      strokeWidth: active ? 2.5 : 1.8,
                      transition: 'color 0.15s, stroke-width 0.15s',
                    }}
                    // Instagram pattern: filled icon when active
                    fill={active ? 'currentColor' : 'none'}
                  />
                  {badge > 0 && (
                    <span style={{
                      position: 'absolute', top: -3, right: -5,
                      minWidth: 14, height: 14, borderRadius: 7,
                      background: '#e5484d', color: '#fff',
                      fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 3px',
                      boxShadow: '0 0 0 2px var(--fh-nav-bg, var(--fh-header-bg))',
                    }}>
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ── Profile / More Sheet ────────────────────────────────────── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setSheetOpen(false)}
            />

            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-50"
              style={{
                background: 'var(--card)',
                borderRadius: '20px 20px 0 0',
                paddingBottom: 'env(safe-area-inset-bottom)',
                maxHeight: '90dvh',
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div style={{ height: 4, width: 36, borderRadius: 99, background: 'var(--fh-border-2)' }} />
              </div>

              <div style={{ padding: '0 0 8px' }}>

                {/* ── Profile card ─────────────────────────────── */}
                {user ? (
                  <div style={{ padding: '8px 16px 16px' }}>
                    <Link
                      href="/dashboard"
                      onClick={() => setSheetOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px', borderRadius: 16,
                        background: 'var(--fh-surface-2)',
                        textDecoration: 'none',
                      }}
                    >
                      {avatarUrl ? (
                        <Image src={avatarUrl} alt={displayName} width={48} height={48}
                          style={{ borderRadius: '50%', flexShrink: 0, objectFit: 'cover' }} unoptimized />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--fh-primary-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User style={{ width: 22, height: 22, color: 'var(--fh-primary)' }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fh-t1)', letterSpacing: '-0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {displayName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--fh-t4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {user.email}
                        </div>
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--fh-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 12, color: 'var(--fh-t3)' }}>›</span>
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, padding: '8px 16px 16px' }}>
                    <Link href="/auth/login" onClick={() => setSheetOpen(false)}
                      style={{ flex: 1, padding: '14px', borderRadius: 12, textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'var(--fh-t2)', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textDecoration: 'none' }}>
                      Sign In
                    </Link>
                    <Link href="/auth/register" onClick={() => setSheetOpen(false)}
                      style={{ flex: 1, padding: '14px', borderRadius: 12, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#fff', background: 'var(--fh-primary)', textDecoration: 'none' }}>
                      Get Started
                    </Link>
                  </div>
                )}

                {/* ── Role switcher ─────────────────────────────── */}
                {user && (
                  <SheetSection label="Mode">
                    <RoleSwitcher variant="mobile" />
                  </SheetSection>
                )}

                {/* ── Quick links — 3-column icon grid ─────────── */}
                <SheetSection label="Navigate">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, paddingTop: 8 }}>
                    {QUICK_LINKS.map(item => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setSheetOpen(false)}
                          style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            padding: '12px 8px', borderRadius: 12,
                            background: 'var(--fh-surface-2)',
                            textDecoration: 'none',
                            transition: 'background 0.15s',
                          }}
                        >
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fh-surface-3, var(--fh-surface))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon style={{ width: 18, height: 18, color: 'var(--fh-t2)' }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--fh-t3)', fontWeight: 500, textAlign: 'center', lineHeight: 1.2 }}>
                            {item.label}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </SheetSection>

                {/* ── Language ─────────────────────────────────── */}
                <SheetSection label="Language">
                  <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                    {LANGS.map(l => (
                      <button key={l} onClick={() => setLang(l)} style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: lang === l ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
                        color: lang === l ? '#fff' : 'var(--fh-t3)',
                      }}>
                        {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </SheetSection>

                {/* ── Currency ─────────────────────────────────── */}
                <SheetSection label="Currency">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0' }}>
                    {CURRENCIES.map(c => (
                      <button key={c} onClick={() => setCurrency(c)} style={{
                        padding: '9px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: currency === c ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
                        color: currency === c ? '#fff' : 'var(--fh-t3)',
                      }}>
                        {CURRENCY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </SheetSection>

                {/* ── Sign Out ─────────────────────────────────── */}
                {user && (
                <SheetSection label="Account">
                  <button
                    onClick={signOut}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 0', background: 'none', border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(229,72,77,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LogOut style={{ width: 18, height: 18, color: '#e5484d' }} />
                    </div>
                    <span style={{ fontSize: 16, color: '#e5484d', fontWeight: 500 }}>Sign Out</span>
                  </button>
                </SheetSection>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Sheet section (Meta Settings style) ──────────────────────────────────────
function SheetSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '0.5px solid var(--fh-sep)', padding: '12px 16px 4px' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--fh-t4)', marginBottom: 4, letterSpacing: '0.01em' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

