'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, LogOut, Sun, Moon, Pencil, X, Circle } from 'lucide-react'
import RoleSwitcher from '@/components/layout/RoleSwitcher'
import { useLang, LANG_LABELS, Lang } from '@/lib/context/LanguageContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { useTheme } from '@/lib/context/ThemeContext'
import { Currency } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

const LANGS: Lang[] = ['en', 'ru', 'kz']
const CURRENCIES: Currency[] = ['KZT', 'RUB', 'USD', 'EUR', 'USDT']
const CURRENCY_LABELS: Record<Currency, string> = {
  KZT: '₸', RUB: '₽', USD: '$', EUR: '€', GBP: '£',
  USDT: '₮', UAH: '₴', CNY: '¥', AED: 'د.إ', TRY: '₺',
}

type Availability = 'open' | 'busy' | 'vacation'
const AVAILABILITY: Record<Availability, { label: string; dot: string; bg: string; border: string }> = {
  open:     { label: 'Available',   dot: '#27a644', bg: 'rgba(39,166,68,0.06)',   border: 'rgba(39,166,68,0.25)'    },
  busy:     { label: 'Busy',        dot: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.25)'   },
  vacation: { label: 'On vacation', dot: '#8a8f98', bg: 'rgba(138,143,152,0.06)', border: 'rgba(138,143,152,0.25)'  },
}

interface Props {
  /** If true, show the Availability section in the sheet (freelancers only). */
  isFreelancer?: boolean
  /** Current availability for initial UI state. */
  initialAvailability?: Availability
}

/** Own-profile only: gear button pinned to cover top-right → opens settings bottom sheet. */
export default function ProfileOwnerActions({ isFreelancer, initialAvailability }: Props = {}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { lang, setLang } = useLang()
  const { currency, setCurrency } = useCurrency()
  const { theme, setTheme } = useTheme()
  const [availability, setAvailability] = useState<Availability>(initialAvailability ?? 'open')
  const [availSaving, setAvailSaving] = useState(false)

  const saveAvailability = useCallback(async (next: Availability) => {
    if (next === availability || availSaving) return
    const prev = availability
    setAvailability(next)
    setAvailSaving(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any
      const { error } = await db
        .from('freelancer_profiles')
        .update({ availability_status: next })
        .eq('user_id', user.id)
      if (error) setAvailability(prev)
    } catch {
      setAvailability(prev)
    } finally {
      setAvailSaving(false)
    }
  }, [availability, availSaving])

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }, [router])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Settings"
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.18)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Settings style={{ width: 17, height: 17 }} strokeWidth={1.8} />
      </button>

      <Link
        href="/profile/setup"
        aria-label="Edit profile"
        style={{
          position: 'absolute', top: 12, right: 56, zIndex: 2,
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.18)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          textDecoration: 'none',
        }}
      >
        <Pencil style={{ width: 15, height: 15 }} strokeWidth={1.8} />
      </Link>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
                background: 'var(--card)',
                borderRadius: '20px 20px 0 0',
                paddingBottom: 'env(safe-area-inset-bottom)',
                maxHeight: '90dvh', overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px 10px',
              }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                  Settings
                </span>
                <button onClick={() => setOpen(false)} aria-label="Close" style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--fh-surface-2)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--fh-t3)',
                }}>
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              {isFreelancer && (
                <Section label="Status">
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {(Object.entries(AVAILABILITY) as [Availability, typeof AVAILABILITY['open']][]).map(([key, cfg]) => {
                      const active = availability === key
                      return (
                        <button
                          key={key}
                          onClick={() => saveAvailability(key)}
                          disabled={availSaving}
                          style={{
                            padding: '9px 14px', borderRadius: 10,
                            fontSize: 13, fontWeight: 600,
                            background: active ? cfg.bg : 'var(--fh-surface-2)',
                            border: active ? `1px solid ${cfg.border}` : '1px solid transparent',
                            color: active ? cfg.dot : 'var(--fh-t3)',
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            cursor: availSaving ? 'not-allowed' : 'pointer',
                            opacity: availSaving ? 0.6 : 1,
                          }}
                        >
                          <Circle style={{ width: 8, height: 8, fill: cfg.dot, color: cfg.dot }} />
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </Section>
              )}

              <Section label="Mode">
                <RoleSwitcher variant="mobile" />
              </Section>

              <Section label="Theme">
                <div style={{ display: 'flex', gap: 8 }}>
                  <ThemeBtn active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun style={{ width: 14, height: 14 }} />} label="Light" />
                  <ThemeBtn active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon style={{ width: 14, height: 14 }} />} label="Dark" />
                </div>
              </Section>

              <Section label="Language">
                <div style={{ display: 'flex', gap: 8 }}>
                  {LANGS.map(l => (
                    <button key={l} onClick={() => setLang(l)} style={chipStyle(lang === l)}>
                      {LANG_LABELS[l]}
                    </button>
                  ))}
                </div>
              </Section>

              <Section label="Currency">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurrency(c)} style={{
                      ...chipStyle(currency === c), padding: '9px 14px', flex: 'none',
                    }}>
                      {CURRENCY_LABELS[c]}
                    </button>
                  ))}
                </div>
              </Section>

              <div style={{ borderTop: '0.5px solid var(--fh-sep)', padding: '8px 16px 16px', marginTop: 4 }}>
                <button
                  onClick={signOut}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(229,72,77,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <LogOut style={{ width: 18, height: 18, color: '#e5484d' }} />
                  </div>
                  <span style={{ fontSize: 15, color: '#e5484d', fontWeight: 600 }}>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: '0.5px solid var(--fh-sep)', padding: '12px 16px 10px' }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: 'var(--fh-t4)',
        marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ThemeBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600,
      border: 'none', cursor: 'pointer',
      background: active ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
      color: active ? '#fff' : 'var(--fh-t3)',
    }}>
      {icon} {label}
    </button>
  )
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer',
    background: active ? 'var(--fh-primary)' : 'var(--fh-surface-2)',
    color: active ? '#fff' : 'var(--fh-t3)',
  }
}
