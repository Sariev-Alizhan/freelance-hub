'use client'
import { Check } from 'lucide-react'
import { useLang } from '@/lib/context/LanguageContext'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { useTheme } from '@/lib/context/ThemeContext'
import type { Currency } from '@/lib/types'

const LANGS = [
  { code: 'en' as const, flag: '🇬🇧', name: 'English'  },
  { code: 'ru' as const, flag: '🇷🇺', name: 'Русский'  },
  { code: 'kz' as const, flag: '🇰🇿', name: 'Қазақша'  },
]

const CURRENCIES: { code: Currency; label: string; name: string }[] = [
  { code: 'KZT',  label: '₸',   name: 'Tenge'    },
  { code: 'RUB',  label: '₽',   name: 'Ruble'    },
  { code: 'USD',  label: '$',   name: 'Dollar'   },
  { code: 'EUR',  label: '€',   name: 'Euro'     },
  { code: 'GBP',  label: '£',   name: 'Pound'    },
  { code: 'USDT', label: '₮',   name: 'Tether'   },
  { code: 'UAH',  label: '₴',   name: 'Hryvnia'  },
  { code: 'CNY',  label: '¥',   name: 'Yuan'     },
  { code: 'AED',  label: 'د.إ', name: 'Dirham'   },
  { code: 'TRY',  label: '₺',   name: 'Lira'     },
]

export default function PreferencesPage() {
  const { lang, setLang } = useLang()
  const { currency, setCurrency } = useCurrency()
  const { theme, setTheme } = useTheme()

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
          Appearance & Region
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--fh-t4)', marginTop: '2px' }}>
          Saved locally in your browser — applied immediately.
        </p>
      </div>

      {/* Language */}
      <Card label="Language" description="Interface language used across the entire platform.">
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
      <Card label="Default Currency" description="All prices and amounts across the platform will be shown in this currency.">
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
                <span style={{ fontSize: '10px', color: 'var(--fh-t4)' }}>{c.name}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Theme */}
      <Card label="Theme" description="Choose between dark mode and light mode.">
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {([
            {
              id: 'dark'  as const,
              label: 'Dark',
              bg: '#0d0d12',
              headerBg: 'rgba(255,255,255,0.04)',
              headerBorder: 'rgba(255,255,255,0.07)',
              line1: 'rgba(255,255,255,0.15)',
              line2: 'rgba(255,255,255,0.07)',
            },
            {
              id: 'light' as const,
              label: 'Light',
              bg: '#f5f5f7',
              headerBg: 'rgba(0,0,0,0.03)',
              headerBorder: 'rgba(0,0,0,0.07)',
              line1: 'rgba(0,0,0,0.12)',
              line2: 'rgba(0,0,0,0.06)',
            },
          ]).map(t => {
            const active = theme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  display: 'flex', flexDirection: 'column', gap: '10px',
                  padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  background: active ? 'rgba(94,106,210,0.08)' : 'var(--fh-surface-2)',
                  border: `2px solid ${active ? 'rgba(94,106,210,0.45)' : 'transparent'}`,
                  outline: 'none', transition: 'all 0.15s', minWidth: '130px',
                }}
              >
                {/* Mini UI preview */}
                <div style={{
                  width: '100%', height: '72px', borderRadius: '8px',
                  background: t.bg, overflow: 'hidden',
                  border: '1px solid rgba(128,128,128,0.15)',
                }}>
                  <div style={{
                    height: '14px',
                    background: t.headerBg,
                    borderBottom: `1px solid ${t.headerBorder}`,
                    display: 'flex', alignItems: 'center', gap: '3px', padding: '0 7px',
                  }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{
                        width: i === 1 ? '8px' : '18px', height: '4px',
                        borderRadius: '2px', background: t.headerBorder,
                      }} />
                    ))}
                  </div>
                  <div style={{ padding: '8px 7px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ height: '5px', width: '60%', borderRadius: '3px', background: t.line1 }} />
                    <div style={{ height: '4px', width: '80%', borderRadius: '3px', background: t.line2 }} />
                    <div style={{ height: '4px', width: '45%', borderRadius: '3px', background: t.line2 }} />
                    <div style={{
                      marginTop: '2px', height: '14px', width: '60px', borderRadius: '4px',
                      background: 'rgba(94,106,210,0.5)',
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <span style={{
                    fontSize: '13px', fontWeight: active ? 590 : 400,
                    color: active ? 'var(--fh-t1)' : 'var(--fh-t3)',
                  }}>
                    {t.label}
                  </span>
                  {active && (
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: '#5e6ad2', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check style={{ width: 9, height: 9, color: '#fff' }} />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>
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
