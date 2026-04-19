'use client'
import { Check, SunMoon, Sun, Moon } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { useTheme } from '@/lib/context/ThemeContext'
import type { ThemeMode } from '@/lib/context/ThemeContext'
import type { Currency } from '@/lib/types'
import RoleSwitcher from '@/components/layout/RoleSwitcher'
import { useUser } from '@/lib/hooks/useUser'

const LANGS = [
  { code: 'en' as const, flag: '🇬🇧', name: 'English'  },
  { code: 'ru' as const, flag: '🇷🇺', name: 'Русский'  },
  { code: 'kz' as const, flag: '🇰🇿', name: 'Қазақша'  },
]

const CURRENCIES: { code: Currency; label: string; nameKey: 'currencyTenge' | 'currencyRuble' | 'currencyDollar' | 'currencyEuro' | 'currencyPound' | 'currencyTether' | 'currencyHryvnia' | 'currencyYuan' | 'currencyDirham' | 'currencyLira' }[] = [
  { code: 'KZT',  label: '₸',   nameKey: 'currencyTenge'   },
  { code: 'RUB',  label: '₽',   nameKey: 'currencyRuble'   },
  { code: 'USD',  label: '$',   nameKey: 'currencyDollar'  },
  { code: 'EUR',  label: '€',   nameKey: 'currencyEuro'    },
  { code: 'GBP',  label: '£',   nameKey: 'currencyPound'   },
  { code: 'USDT', label: '₮',   nameKey: 'currencyTether'  },
  { code: 'UAH',  label: '₴',   nameKey: 'currencyHryvnia' },
  { code: 'CNY',  label: '¥',   nameKey: 'currencyYuan'    },
  { code: 'AED',  label: 'د.إ', nameKey: 'currencyDirham'  },
  { code: 'TRY',  label: '₺',   nameKey: 'currencyLira'    },
]

export default function PreferencesPage() {
  const { lang, setLang, t } = useLang()
  const { currency, setCurrency } = useCurrency()
  const { themeMode, theme, setThemeMode } = useTheme()
  const { user } = useUser()
  const td = t.settingsPage

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
          {td.prefTitle}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '2px' }}>
          {td.prefSubtitle}
        </p>
      </div>

      {/* Language */}
      <Card label={td.langCard} description={td.langCardSub}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {LANGS.map(l => {
            const active = lang === l.code
            return (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                  padding: '14px 24px', borderRadius: '12px', cursor: 'pointer', position: 'relative',
                  background: active ? 'rgba(94,106,210,0.08)' : 'var(--fh-surface-2)',
                  border: `2px solid ${active ? 'rgba(94,106,210,0.45)' : 'transparent'}`,
                  outline: 'none', transition: 'all 0.15s', minWidth: '100px',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    background: '#5e6ad2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Check style={{ width: 9, height: 9, color: '#fff' }} />
                  </span>
                )}
                <span style={{ fontSize: '26px' }}>{l.flag}</span>
                <span style={{
                  fontSize: '13px', fontWeight: active ? 590 : 400,
                  color: active ? 'var(--fh-t1)' : 'var(--fh-t3)',
                }}>
                  {l.name}
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Currency */}
      <Card label={td.currencyCard} description={td.currencyCardSub}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: '8px' }}>
          {CURRENCIES.map(c => {
            const active = currency === c.code
            return (
              <button
                key={c.code}
                onClick={() => setCurrency(c.code)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                  padding: '12px 8px', borderRadius: '10px', cursor: 'pointer',
                  background: active ? 'rgba(94,106,210,0.08)' : 'var(--fh-surface-2)',
                  border: `2px solid ${active ? 'rgba(94,106,210,0.45)' : 'transparent'}`,
                  outline: 'none', transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: '20px', fontWeight: 700,
                  color: active ? '#7170ff' : 'var(--fh-t2)',
                  lineHeight: 1,
                }}>
                  {c.label}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: active ? 590 : 400,
                  color: active ? '#7170ff' : 'var(--fh-t4)',
                }}>
                  {c.code}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--fh-t4)' }}>{td[c.nameKey]}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Theme */}
      <Card label={td.themeCard} description={td.themeCardSub}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {([
            {
              id: 'auto'  as ThemeMode,
              Icon: SunMoon,
              label: td.themeAuto,
              sub: td.themeAutoSub,
              previewLeft: '#0d0d12',
              previewRight: '#f5f5f7',
            },
            {
              id: 'light' as ThemeMode,
              Icon: Sun,
              label: td.themeLight,
              sub: td.themeLightSub,
              previewLeft: '#f5f5f7',
              previewRight: '#f5f5f7',
            },
            {
              id: 'dark'  as ThemeMode,
              Icon: Moon,
              label: td.themeDark,
              sub: td.themeDarkSub,
              previewLeft: '#0d0d12',
              previewRight: '#0d0d12',
            },
          ]).map(tk => {
            const active = themeMode === tk.id
            return (
              <button
                key={tk.id}
                onClick={() => setThemeMode(tk.id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  background: active ? 'rgba(94,106,210,0.08)' : 'var(--fh-surface-2)',
                  border: `2px solid ${active ? 'rgba(94,106,210,0.45)' : 'transparent'}`,
                  outline: 'none', transition: 'all 0.15s', minWidth: '120px', flex: 1,
                }}
              >
                {/* Preview swatch */}
                <div style={{
                  width: '100%', height: '60px', borderRadius: '8px',
                  overflow: 'hidden', border: '1px solid rgba(128,128,128,0.15)',
                  display: 'flex',
                }}>
                  <div style={{ flex: 1, background: tk.previewLeft }} />
                  {tk.id === 'auto' && (
                    <div style={{ flex: 1, background: tk.previewRight, borderLeft: '1px solid rgba(128,128,128,0.2)' }} />
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <tk.Icon style={{ width: 13, height: 13, color: active ? '#7170ff' : 'var(--fh-t4)', flexShrink: 0 }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <p style={{ fontSize: '13px', fontWeight: active ? 590 : 400, color: active ? 'var(--fh-t1)' : 'var(--fh-t3)' }}>
                      {tk.label}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>{tk.sub}</p>
                  </div>
                  {active && (
                    <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#5e6ad2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 8, height: 8, color: '#fff' }} />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {themeMode === 'auto' && (
          <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <SunMoon style={{ width: 11, height: 11 }} />
            {td.themeNow1} <strong style={{ color: 'var(--fh-t3)' }}>{theme}</strong> {td.themeNow2}
          </p>
        )}
      </Card>

      {/* Role */}
      {user && (
        <Card label={td.roleCard} description={td.roleCardSub}>
          <RoleSwitcher />
        </Card>
      )}
    </div>
  )
}

function Card({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
      borderRadius: '16px', padding: '20px', marginBottom: '12px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '3px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{description}</p>
      </div>
      {children}
    </div>
  )
}
