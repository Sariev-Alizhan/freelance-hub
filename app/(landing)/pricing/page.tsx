'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Check, X as XIcon, Crown, Zap, ArrowRight,
  BarChart3, Target, Sparkles, BadgeCheck,
  TrendingUp, Bell, Shield, MessageSquare,
  Calculator, Bot, FileText, Globe,
} from 'lucide-react'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { convertFromUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'

// ── Base prices in USD (matched to /premium KZT prices ÷ rate) ───────────
// Monthly ₸2000 ≈ $5 | Quarterly ₸4800 ≈ $12 | Annual ₸14400 ≈ $36
const PRICES_USD = {
  monthly:   { perMonth: 5,  total: 5  },
  quarterly: { perMonth: 4,  total: 12 },
  annual:    { perMonth: 3,  total: 36 },
}

type Period = 'monthly' | 'quarterly' | 'annual'

function fmt(usd: number, currency: Currency, rates: Record<string, number>): string {
  const sym = CURRENCY_SYMBOLS[currency]
  const n   = Math.round(convertFromUSD(usd, currency, rates))
  const num = ['USD','EUR','GBP','USDT'].includes(currency)
    ? n.toLocaleString('en-US')
    : n.toLocaleString('ru-RU')
  return ['USD','EUR','GBP','USDT'].includes(currency) ? `${sym}${num}` : `${num} ${sym}`
}

// ── Feature comparison data ───────────────────────────────────────────────
const COMPARISON: { label: string; free: string | boolean; premium: string | boolean }[] = [
  // Marketplace
  { label: 'Публикация и просмотр заказов',      free: true,          premium: true            },
  { label: 'Отклики на заказы',                  free: '5 в месяц',   premium: 'Без лимита'   },
  { label: 'Прямые сообщения',                   free: true,          premium: true            },
  { label: 'Публичный профиль с портфолио',       free: true,          premium: true            },
  // AI
  { label: 'AI Smart Search',                    free: '5/день',      premium: 'Без лимита'   },
  { label: 'AI-ассистент',                       free: false,         premium: 'Без лимита'   },
  { label: 'AI-резюме',                          free: false,         premium: true            },
  { label: 'AI-инструменты',                     free: '3 шаблона',  premium: 'Все шаблоны'  },
  { label: 'AI-агенты (бета)',                   free: false,         premium: true            },
  // Analytics
  { label: 'Калькулятор дохода',                 free: false,         premium: true            },
  { label: 'Аналитика дашборд',                  free: false,         premium: true            },
  { label: 'Трекер целей + Календарь',           free: false,         premium: true            },
  // Profile
  { label: 'Premium-бейдж',                      free: false,         premium: true            },
  { label: 'Буст в поиске',                      free: false,         premium: '3×'            },
  { label: 'Кто просматривал профиль',           free: false,         premium: true            },
  { label: 'Приоритетная верификация',           free: false,         premium: true            },
  // Notifications
  { label: 'Telegram-уведомления',               free: false,         premium: true            },
  { label: 'Сохранённые поиски',                 free: '3',           premium: 'Без лимита'   },
  // Other
  { label: 'Управление контрактами',             free: false,         premium: true            },
  { label: 'Двухфакторная аутентификация (2FA)', free: true,          premium: true            },
  { label: 'Поддержка',                          free: 'Email',       premium: 'VIP 24ч'      },
  { label: '7 дней пробного периода',            free: false,         premium: true            },
]

function Cell({ val }: { val: string | boolean }) {
  if (val === true)  return (
    <div className="flex justify-center">
      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(113,112,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check className="h-3 w-3" style={{ color: '#7170ff' }} />
      </div>
    </div>
  )
  if (val === false) return (
    <div className="flex justify-center">
      <XIcon className="h-4 w-4" style={{ color: 'var(--fh-border)' }} />
    </div>
  )
  return <div className="text-center text-xs font-medium" style={{ color: 'var(--fh-t3)' }}>{val}</div>
}

const FREE_HIGHLIGHTS = [
  { icon: Globe,        text: 'Маркетплейс без комиссии'   },
  { icon: MessageSquare,text: '5 откликов в месяц'         },
  { icon: Sparkles,     text: 'AI Smart Search — 5/день'   },
  { icon: Shield,       text: 'Профиль + 2FA'              },
]

const PREMIUM_HIGHLIGHTS = [
  { icon: Zap,          text: 'Неограниченные отклики'     },
  { icon: Sparkles,     text: 'AI-ассистент без лимита'    },
  { icon: FileText,     text: 'AI-резюме и AI-инструменты' },
  { icon: Bot,          text: 'AI-агенты (бета)'          },
  { icon: Target,       text: 'Трекер целей + Календарь'  },
  { icon: Calculator,   text: 'Калькулятор дохода'         },
  { icon: BarChart3,    text: 'Аналитика и экспорт'        },
  { icon: TrendingUp,   text: 'Буст в поиске 3×'           },
  { icon: Crown,        text: 'Premium-бейдж на профиле'   },
  { icon: BadgeCheck,   text: 'Приоритетная верификация'   },
  { icon: Bell,         text: 'Telegram-уведомления'       },
]

export default function PricingPage() {
  const { currency, rates } = useCurrency()
  const cur                 = currency as Currency
  const [period, setPeriod] = useState<Period>('monthly')
  const prices              = PRICES_USD[period]

  const periodLabels: Record<Period, string> = {
    monthly:   'В месяц',
    quarterly: '3 месяца',
    annual:    'Год',
  }
  const savings: Partial<Record<Period, string>> = {
    quarterly: '−20%',
    annual:    '−40%',
  }

  return (
    <div style={{ background: 'var(--fh-canvas)', minHeight: 'calc(100vh - 52px)' }}>

      {/* ── Hero ── */}
      <div style={{ textAlign: 'center', padding: 'clamp(56px,7vw,96px) 16px 0' }}>
        <p style={{
          display: 'inline-block', marginBottom: 20,
          padding: '4px 14px', borderRadius: 100,
          background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)',
          fontSize: 12, fontWeight: 590, color: '#7170ff', letterSpacing: '0.04em',
        }}>
          FreelanceHub · Тарифы
        </p>

        <h1 style={{
          fontSize: 'clamp(28px,5vw,52px)', fontWeight: 700,
          letterSpacing: '-0.05em', color: 'var(--fh-t1)',
          marginBottom: 14, lineHeight: 1.05,
        }}>
          Торговля — бесплатно.<br />
          <span style={{ color: '#7170ff' }}>Максимум — с Premium.</span>
        </h1>
        <p style={{ fontSize: 15, color: 'var(--fh-t3)', maxWidth: 460, margin: '0 auto 40px', lineHeight: 1.65 }}>
          Размещайте заказы и откликайтесь без комиссии. Premium открывает AI-инструменты, аналитику и буст в поиске.
        </p>

        {/* Period toggle */}
        <div style={{
          display: 'inline-flex', gap: 2, padding: 3,
          borderRadius: 12, background: 'var(--fh-surface)',
          border: '1px solid var(--fh-border)', marginBottom: 48,
        }}>
          {(['monthly', 'quarterly', 'annual'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                position: 'relative', padding: 'clamp(7px,1.5vw,8px) clamp(10px,3vw,20px)', borderRadius: 9,
                fontSize: 13, fontWeight: period === p ? 600 : 400,
                background: period === p ? 'var(--fh-surface-2)' : 'transparent',
                border: period === p ? '1px solid var(--fh-border)' : '1px solid transparent',
                color: period === p ? 'var(--fh-t1)' : 'var(--fh-t4)',
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {periodLabels[p]}
              {savings[p] && (
                <span style={{
                  position: 'absolute', top: -10, right: -2,
                  fontSize: 10, fontWeight: 700, color: '#22c55e',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)',
                  padding: '1px 5px', borderRadius: 6, whiteSpace: 'nowrap',
                }}>
                  {savings[p]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24">

        {/* ── Cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16, marginBottom: 72,
          alignItems: 'stretch',
        }}>

          {/* ── FREE ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderRadius: 20, padding: '28px 28px 24px',
            background: 'var(--fh-surface)',
            border: '1px solid var(--fh-border)',
          }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Starter
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  0
                </span>
                <span style={{ fontSize: 15, color: 'var(--fh-t4)' }}>/ мес</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--fh-t4)', marginBottom: 28 }}>Бесплатно навсегда</p>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {FREE_HIGHLIGHTS.map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: 'var(--fh-t3)' }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--fh-t3)' }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Link
                href="/auth/register"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '12px 16px', borderRadius: 12,
                  background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)',
                  color: 'var(--fh-t2)', fontSize: 14, fontWeight: 600, textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--fh-surface-2)' }}
              >
                Начать бесплатно <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* ── PREMIUM ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            borderRadius: 20, padding: '28px 28px 24px',
            background: 'linear-gradient(145deg, rgba(94,106,210,0.07) 0%, rgba(113,112,255,0.03) 100%)',
            border: '1.5px solid rgba(113,112,255,0.3)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Glow */}
            <div style={{
              position: 'absolute', top: -40, right: -40,
              width: 200, height: 200,
              background: 'radial-gradient(circle, rgba(113,112,255,0.12) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Popular badge */}
            <div style={{
              position: 'absolute', top: 0, right: 24,
              padding: '4px 12px', borderRadius: '0 0 10px 10px',
              background: '#5e6ad2', color: '#fff',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
            }}>
              ПОПУЛЯРНЫЙ
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Crown className="h-4 w-4" style={{ color: '#7170ff' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#7170ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Premium
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
                <span style={{ fontSize: 44, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                  {fmt(prices.perMonth, cur, rates)}
                </span>
                <span style={{ fontSize: 15, color: 'var(--fh-t4)' }}>/ мес</span>
              </div>

              {period !== 'monthly' ? (
                <p style={{ fontSize: 12, color: 'var(--fh-t4)', marginBottom: 28 }}>
                  {fmt(prices.total, cur, rates)} итого · {period === 'quarterly' ? 'каждые 3 месяца' : 'в год'}
                  {' '}<span style={{ color: '#22c55e', fontWeight: 600 }}>{savings[period]}</span>
                </p>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--fh-t4)', marginBottom: 28 }}>
                  Оплата помесячно · Отмена в любой момент
                </p>
              )}

              {/* Features — 2-column grid on wide, 1-col on narrow */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px 12px', marginBottom: 28,
              }}>
                {PREMIUM_HIGHLIGHTS.map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(113,112,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon className="h-3 w-3" style={{ color: '#7170ff' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--fh-t2)', lineHeight: 1.3 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <Link
                href="/premium"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '13px 16px', borderRadius: 12,
                  background: '#5e6ad2', color: '#fff',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 0 0 1px rgba(113,112,255,0.25), 0 6px 24px rgba(94,106,210,0.3)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#7170ff' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
              >
                <Crown className="h-4 w-4" /> Получить Premium <ArrowRight className="h-4 w-4" />
              </Link>
              <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: 'var(--fh-t4)' }}>
                7 дней пробного · Оплата картой
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px,1fr))',
          gap: 12, marginBottom: 72,
        }}>
          {[
            { n: '0%',  label: 'комиссии с заказов' },
            { n: '25+', label: 'функций в Premium'   },
            { n: '10',  label: 'валют поддерживается' },
            { n: '3',   label: 'языка интерфейса'    },
          ].map(({ n, label }) => (
            <div key={n} style={{
              textAlign: 'center', padding: '20px 12px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
              borderRadius: 16,
            }}>
              <p style={{ fontSize: 30, fontWeight: 700, color: '#7170ff', letterSpacing: '-0.04em', marginBottom: 4 }}>{n}</p>
              <p style={{ fontSize: 12, color: 'var(--fh-t4)', lineHeight: 1.4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Full comparison ── */}
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: 'var(--fh-t1)',
          textAlign: 'center', marginBottom: 28, letterSpacing: '-0.03em',
        }}>
          Что входит в каждый план
        </h2>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as never, borderRadius: 18, border: '1px solid var(--fh-border)' }}>
          <div style={{ minWidth: 360 }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 96px 96px',
            padding: '14px 16px',
            background: 'var(--fh-surface-2)',
            borderBottom: '1px solid var(--fh-border)',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Функция
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fh-t3)', textAlign: 'center' }}>Starter</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#7170ff', textAlign: 'center' }}>Premium</span>
          </div>

          {COMPARISON.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 96px 96px',
                padding: '11px 16px', alignItems: 'center',
                background: i % 2 === 0 ? 'var(--fh-surface)' : 'var(--fh-surface-2)',
                borderBottom: i < COMPARISON.length - 1 ? '1px solid var(--fh-border)' : 'none',
              }}
            >
              <span style={{ fontSize: 13, color: 'var(--fh-t2)' }}>{row.label}</span>
              <Cell val={row.free} />
              <Cell val={row.premium} />
            </div>
          ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{
          marginTop: 64, textAlign: 'center',
          padding: 'clamp(36px,5vw,56px) 24px',
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgba(94,106,210,0.07) 0%, rgba(113,112,255,0.03) 100%)',
          border: '1px solid rgba(113,112,255,0.2)',
        }}>
          <Crown className="h-10 w-10 mx-auto mb-4" style={{ color: '#7170ff' }} />
          <h2 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 700, color: 'var(--fh-t1)', marginBottom: 12, letterSpacing: '-0.04em' }}>
            Готовы зарабатывать больше?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fh-t3)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.65 }}>
            Начните с бесплатного тарифа. Апгрейдитесь, когда захотите — без привязки на постоянно.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 22px', borderRadius: 12,
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t2)', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}
            >
              Начать бесплатно <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/premium"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 22px', borderRadius: 12,
                background: '#5e6ad2', color: '#fff',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(94,106,210,0.3)',
              }}
            >
              <Crown className="h-4 w-4" /> Получить Premium
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
