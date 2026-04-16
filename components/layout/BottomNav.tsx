'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Briefcase, Plus, MessageSquare, User,
  X, Settings, BarChart3, Target, Calculator,
  Search, Zap, Bot, FileText, LogOut,
  LayoutDashboard, Brain, Star, Users, Bell,
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
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Дашборд'    },
  { href: '/dashboard/analytics',   icon: BarChart3,       label: 'Аналитика'  },
  { href: '/dashboard/goals',       icon: Target,          label: 'Цели'       },
  { href: '/dashboard/calculator',  icon: Calculator,      label: 'Калькулятор'},
  { href: '/ai-search',             icon: Search,          label: 'AI Поиск'   },
  { href: '/ai-assistant',          icon: Brain,           label: 'AI Чат'     },
  { href: '/ai-tools',              icon: Zap,             label: 'AI Инструм.'},
  { href: '/agents',                icon: Bot,             label: 'Агенты'     },
  { href: '/contracts',             icon: FileText,        label: 'Контракты'  },
  { href: '/pricing',               icon: Star,            label: 'Тарифы'     },
  { href: '/orders',                icon: Briefcase,       label: 'Заказы'     },
  { href: '/freelancers',           icon: Users,           label: 'Люди'       },
]

// ── Tab definition ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'feed',     href: '/feed',      icon: Home,         matchPrefix: '/feed'     },
  { id: 'orders',   href: '/orders',    icon: Briefcase,    matchPrefix: '/orders'   },
  { id: 'create',   href: '/orders/new',icon: Plus,         isCenter: true           },
  { id: 'messages', href: '/messages',  icon: MessageSquare,matchPrefix: '/messages' },
  { id: 'profile',  href: null,         icon: User,         isProfile: true          },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router   = useRouter()
  const { user } = useUser()
  const { profile } = useProfile()
  const { lang, setLang, t } = useLang()
  const { currency, setCurrency } = useCurrency()
  const [sheetOpen, setSheetOpen] = useState(false)

  const hidden = pathname.startsWith('/auth') || pathname.startsWith('/messages')
  if (hidden) return null

  const avatarUrl   = profile?.avatar_url || user?.user_metadata?.avatar_url
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Аккаунт'

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setSheetOpen(false)
    router.push('/')
    router.refresh()
  }

  function isActive(tab: typeof TABS[0]) {
    if (tab.isCenter || tab.isProfile) return false
    if (tab.matchPrefix === '/feed') return pathname === '/feed' || pathname === '/'
    return !!tab.matchPrefix && pathname.startsWith(tab.matchPrefix)
  }

  return (
    <>
      {/* ── Bottom navigation bar ─────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: 'var(--fh-nav-bg, var(--fh-header-bg))',
          borderTop: '0.5px solid var(--fh-sep)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
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
                    <motion.div
                      whileTap={{ scale: 0.88 }}
                      style={{
                        width: 44, height: 44,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #5e6ad2, #7170ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(113,112,255,0.35)',
                      }}
                    >
                      <Plus style={{ width: 22, height: 22, color: '#fff', strokeWidth: 2.5 }} />
                    </motion.div>
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
                  <motion.div whileTap={{ scale: 0.85 }}>
                    {user && avatarUrl ? (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%', overflow: 'hidden',
                        outline: sheetOpen ? '2px solid #7170ff' : '2px solid transparent',
                        outlineOffset: 1.5,
                        transition: 'outline-color 0.15s',
                      }}>
                        <Image src={avatarUrl} alt="" width={26} height={26} style={{ objectFit: 'cover' }} unoptimized />
                      </div>
                    ) : (
                      <div style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: sheetOpen ? '#7170ff' : 'var(--fh-surface-2)',
                        border: `1.5px solid ${sheetOpen ? '#7170ff' : 'var(--fh-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s, border-color 0.15s',
                      }}>
                        <User style={{ width: 14, height: 14, color: sheetOpen ? '#fff' : 'var(--fh-t4)' }} />
                      </div>
                    )}
                  </motion.div>
                </button>
              )
            }

            // ── Normal tab ─────────────────────────────────────────
            const href = (tab.id === 'messages' && !user) ? '/auth/login' : tab.href!

            return (
              <Link
                key={tab.id}
                href={href}
                className="flex-1 flex items-center justify-center"
                style={{ height: '100%' }}
              >
                <motion.div whileTap={{ scale: 0.82 }}>
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
                </motion.div>
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
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#7170ff20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User style={{ width: 22, height: 22, color: '#7170ff' }} />
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
                      style={{ flex: 1, padding: '14px', borderRadius: 14, textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'var(--fh-t2)', background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', textDecoration: 'none' }}>
                      Войти
                    </Link>
                    <Link href="/auth/register" onClick={() => setSheetOpen(false)}
                      style={{ flex: 1, padding: '14px', borderRadius: 14, textAlign: 'center', fontSize: 15, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#5e6ad2,#7170ff)', textDecoration: 'none' }}>
                      Начать
                    </Link>
                  </div>
                )}

                {/* ── Role switcher ─────────────────────────────── */}
                {user && (
                  <div style={{ padding: '0 16px 12px' }}>
                    <SheetSection label="Режим">
                      <RoleSwitcher />
                    </SheetSection>
                  </div>
                )}

                {/* ── Quick links — Meta Settings style ─────────── */}
                <SheetSection label="Разделы">
                  {QUICK_LINKS.map(item => {
                    const Icon = item.icon
                    return (
                      <SheetRow
                        key={item.href}
                        href={item.href}
                        icon={<Icon style={{ width: 20, height: 20, color: 'var(--fh-t3)' }} />}
                        label={item.label}
                        onClick={() => setSheetOpen(false)}
                      />
                    )
                  })}
                </SheetSection>

                {/* ── Language ─────────────────────────────────── */}
                <SheetSection label="Язык">
                  <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                    {LANGS.map(l => (
                      <button key={l} onClick={() => setLang(l)} style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: lang === l ? '#7170ff' : 'var(--fh-surface-2)',
                        color: lang === l ? '#fff' : 'var(--fh-t3)',
                      }}>
                        {LANG_LABELS[l]}
                      </button>
                    ))}
                  </div>
                </SheetSection>

                {/* ── Currency ─────────────────────────────────── */}
                <SheetSection label="Валюта">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '4px 0' }}>
                    {CURRENCIES.map(c => (
                      <button key={c} onClick={() => setCurrency(c)} style={{
                        padding: '9px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                        border: 'none', cursor: 'pointer',
                        background: currency === c ? '#7170ff' : 'var(--fh-surface-2)',
                        color: currency === c ? '#fff' : 'var(--fh-t3)',
                      }}>
                        {CURRENCY_LABELS[c]}
                      </button>
                    ))}
                  </div>
                </SheetSection>

                {/* ── Settings + Logout ─────────────────────────── */}
                <SheetSection label="Настройки">
                  <SheetRow href="/settings" icon={<Settings style={{ width: 20, height: 20, color: 'var(--fh-t3)' }} />} label="Настройки" onClick={() => setSheetOpen(false)} />
                  {user && (
                    <button
                      onClick={signOut}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 0', background: 'none', border: 'none',
                        cursor: 'pointer', borderTop: '0.5px solid var(--fh-sep)',
                      }}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(229,72,77,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LogOut style={{ width: 18, height: 18, color: '#e5484d' }} />
                      </div>
                      <span style={{ fontSize: 16, color: '#e5484d', fontWeight: 500 }}>Выйти</span>
                    </button>
                  )}
                </SheetSection>

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

// ── Single row item ───────────────────────────────────────────────────────────
function SheetRow({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 0',
        borderTop: '0.5px solid var(--fh-sep)',
        textDecoration: 'none',
      }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--fh-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ flex: 1, fontSize: 16, color: 'var(--fh-t1)', fontWeight: 400, letterSpacing: '-0.01em' }}>
        {label}
      </span>
      <span style={{ color: 'var(--fh-t4)', fontSize: 18, lineHeight: 1 }}>›</span>
    </Link>
  )
}
