'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Check, X as XIcon, Crown, Zap, Star, ArrowRight,
  MessageSquare, Search, BarChart3, Target, Calculator,
  FileText, Bot, Bell, Shield, TrendingUp, Users,
  Sparkles, BadgeCheck, Languages, Globe,
} from 'lucide-react'
import { useCurrency } from '@/lib/context/CurrencyContext'
import { convertFromUSD, CURRENCY_SYMBOLS } from '@/lib/utils/currency'
import type { Currency } from '@/lib/types'

// ── Plan definitions (prices in USD) ─────────────────────────────────────
const PLANS = [
  {
    id: 'free',
    name: 'Starter',
    monthlyUsd: 0,
    quarterlyUsd: 0,
    annualUsd: 0,
    color: 'var(--fh-t3)',
    highlight: false,
    cta: 'Начать бесплатно',
    ctaHref: '/auth/register',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyUsd: 5,
    quarterlyUsd: 12,   // $4/mo
    annualUsd: 36,      // $3/mo
    color: '#22c55e',
    highlight: false,
    cta: 'Выбрать Pro',
    ctaHref: '/premium',
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyUsd: 12,
    quarterlyUsd: 28,   // ~$9.3/mo
    annualUsd: 96,      // $8/mo
    color: '#7170ff',
    highlight: true,
    badge: 'Популярный',
    cta: 'Выбрать Premium',
    ctaHref: '/premium',
  },
]

// ── Feature categories ────────────────────────────────────────────────────
const FEATURE_GROUPS: {
  label: string
  icon: React.ReactNode
  features: { label: string; free: string | boolean; pro: string | boolean; premium: string | boolean }[]
}[] = [
  {
    label: 'Маркетплейс',
    icon: <Globe className="h-4 w-4" />,
    features: [
      { label: 'Просмотр заказов и фрилансеров',  free: true,           pro: true,              premium: true              },
      { label: 'Публикация заказов (клиент)',       free: true,           pro: true,              premium: true              },
      { label: 'Отклики на заказы',                free: '5 в месяц',    pro: '30 в месяц',      premium: 'Без лимита'      },
      { label: 'Прямые сообщения',                 free: true,           pro: true,              premium: true              },
      { label: 'Публичная страница профиля',        free: true,           pro: true,              premium: true              },
      { label: 'Каталог по городу и категории',    free: true,           pro: true,              premium: true              },
      { label: 'OAuth-вход (Google, GitHub, Apple)', free: true,         pro: true,              premium: true              },
    ],
  },
  {
    label: 'AI-инструменты',
    icon: <Sparkles className="h-4 w-4" />,
    features: [
      { label: 'AI Smart Search',                  free: '5 в день',     pro: '50 в день',       premium: 'Без лимита'      },
      { label: 'AI-ассистент (чат)',               free: false,          pro: '20 запросов/мес', premium: 'Без лимита'      },
      { label: 'AI-резюме (генератор)',            free: false,          pro: false,             premium: true              },
      { label: 'AI-инструменты (шаблоны)',         free: '3 шаблона',   pro: '15 шаблонов',     premium: 'Все шаблоны'     },
      { label: 'AI-агенты',                        free: false,          pro: false,             premium: 'Бета-доступ'     },
    ],
  },
  {
    label: 'Аналитика и цели',
    icon: <BarChart3 className="h-4 w-4" />,
    features: [
      { label: 'Калькулятор дохода',               free: false,          pro: true,              premium: true              },
      { label: 'Дашборд аналитики',                free: false,          pro: 'Базовый',         premium: 'Расширенный'     },
      { label: 'Трекер целей',                     free: false,          pro: false,             premium: true              },
      { label: 'Рабочий календарь',                free: false,          pro: false,             premium: true              },
      { label: 'Экспорт отчётов',                  free: false,          pro: false,             premium: true              },
    ],
  },
  {
    label: 'Профиль и видимость',
    icon: <TrendingUp className="h-4 w-4" />,
    features: [
      { label: 'Базовый профиль с портфолио',      free: true,           pro: true,              premium: true              },
      { label: 'Premium-бейдж на профиле',         free: false,          pro: false,             premium: true              },
      { label: 'Буст в поиске',                    free: false,          pro: 'x1.5',            premium: 'x3'              },
      { label: 'Кто просматривал профиль',         free: false,          pro: true,              premium: true              },
      { label: 'Приоритетная верификация',         free: false,          pro: false,             premium: true              },
    ],
  },
  {
    label: 'Уведомления и интеграции',
    icon: <Bell className="h-4 w-4" />,
    features: [
      { label: 'Push-уведомления в браузере',      free: true,           pro: true,              premium: true              },
      { label: 'Telegram-уведомления',             free: false,          pro: false,             premium: true              },
      { label: 'Сохранённые поиски с алертами',    free: '3',           pro: '20',              premium: 'Без лимита'      },
      { label: 'Уведомления о новых заказах',      free: true,           pro: true,              premium: true              },
    ],
  },
  {
    label: 'Поддержка и прочее',
    icon: <Shield className="h-4 w-4" />,
    features: [
      { label: 'Мультиязычность (RU / EN / KZ)',   free: true,           pro: true,              premium: true              },
      { label: 'Мультивалютность (10 валют)',       free: true,           pro: true,              premium: true              },
      { label: 'Управление контрактами',           free: false,          pro: 'До 3 активных',  premium: 'Без лимита'      },
      { label: 'Поддержка',                        free: 'Email',        pro: 'Приоритетный',    premium: 'VIP (24 ч)'      },
      { label: '7-дневный пробный период',         free: false,          pro: true,              premium: true              },
    ],
  },
]

type Period = 'monthly' | 'quarterly' | 'annual'

function fmtPrice(usd: number, currency: Currency, rates: Record<string, number>): string {
  if (usd === 0) return '0'
  const n = convertFromUSD(usd, currency, rates)
  if (['USD', 'EUR', 'GBP', 'USDT'].includes(currency))
    return `${Math.round(n).toLocaleString('en-US')}`
  return Math.round(n).toLocaleString('ru-RU')
}

function CellValue({ val }: { val: string | boolean }) {
  if (val === false) return <XIcon className="h-4 w-4 text-muted-foreground/40 mx-auto" />
  if (val === true)  return <Check className="h-4 w-4 text-green-400 mx-auto" />
  return <span className="text-[11px] font-medium text-center leading-tight">{val}</span>
}

export default function PricingPage() {
  const { currency, rates } = useCurrency()
  const sym                 = CURRENCY_SYMBOLS[currency as Currency] ?? '$'
  const [period, setPeriod] = useState<Period>('monthly')
  const [openGroup, setOpenGroup] = useState<number | null>(null)

  function getPrice(plan: typeof PLANS[number]) {
    const usd = period === 'monthly'   ? plan.monthlyUsd
               : period === 'quarterly' ? plan.quarterlyUsd / 3
               :                          plan.annualUsd / 12
    return fmtPrice(usd, currency as Currency, rates)
  }

  function getTotal(plan: typeof PLANS[number]) {
    const usd = period === 'quarterly' ? plan.quarterlyUsd : plan.annualUsd
    return fmtPrice(usd, currency as Currency, rates)
  }

  const PERIOD_LABELS: Record<Period, string> = {
    monthly:   'Помесячно',
    quarterly: '3 месяца',
    annual:    'Год',
  }
  const PERIOD_SAVINGS: Partial<Record<Period, string>> = {
    quarterly: 'Экономия 20%',
    annual:    'Экономия 40%',
  }

  return (
    <div style={{ background: 'var(--fh-canvas)', minHeight: 'calc(100vh - 52px)' }}>

      {/* ── Hero ── */}
      <div style={{
        padding: 'clamp(48px,6vw,80px) 16px 0',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 14px', borderRadius: '100px', marginBottom: '20px',
          background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)',
          fontSize: '12px', fontWeight: 590, color: '#7170ff',
        }}>
          <Star className="h-3.5 w-3.5" /> Тарифы FreelanceHub
        </div>

        <h1 style={{
          fontSize: 'clamp(26px,5vw,46px)', fontWeight: 510,
          letterSpacing: '-0.05em', color: 'var(--fh-t1)',
          marginBottom: '12px', lineHeight: 1.05,
        }}>
          Торговля бесплатна.<br />
          <span style={{ color: '#7170ff' }}>Мощь — за подписку.</span>
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--fh-t3)', maxWidth: '520px', margin: '0 auto 36px', lineHeight: 1.6 }}>
          Заключайте сделки без комиссии. Подписка открывает AI-инструменты,
          аналитику, буст в поиске и многое другое.
        </p>

        {/* Period toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          padding: '4px', borderRadius: '10px',
          background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
          marginBottom: '48px',
        }}>
          {(['monthly', 'quarterly', 'annual'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                position: 'relative',
                padding: '7px 16px', borderRadius: '7px',
                fontSize: '13px', fontWeight: period === p ? 590 : 400,
                background: period === p ? 'var(--fh-surface-2)' : 'transparent',
                border: period === p ? '1px solid var(--fh-border)' : '1px solid transparent',
                color: period === p ? 'var(--fh-t1)' : 'var(--fh-t3)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {PERIOD_LABELS[p]}
              {PERIOD_SAVINGS[p] && period === p && (
                <span style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  fontSize: '10px', fontWeight: 700, color: '#27a644',
                  whiteSpace: 'nowrap',
                }}>
                  {PERIOD_SAVINGS[p]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24">

        {/* ── Plan cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px', marginBottom: '56px',
        }}>
          {PLANS.map(plan => {
            const priceStr = getPrice(plan)
            const totalStr = getTotal(plan)
            const isPremium = plan.id === 'premium'

            return (
              <div
                key={plan.id}
                style={{
                  position: 'relative',
                  borderRadius: '18px', padding: '24px',
                  background: isPremium
                    ? 'linear-gradient(135deg, rgba(94,106,210,0.07) 0%, rgba(113,112,255,0.04) 100%)'
                    : 'var(--fh-surface)',
                  border: isPremium ? '1.5px solid rgba(94,106,210,0.35)' : '1px solid var(--fh-border)',
                  overflow: 'hidden',
                }}
              >
                {isPremium && (
                  <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '140px', height: '140px',
                    background: 'radial-gradient(circle, rgba(113,112,255,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                )}

                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: '-1px', right: '20px',
                    padding: '4px 12px', borderRadius: '0 0 8px 8px',
                    background: '#5e6ad2', color: '#fff',
                    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  {isPremium && <Crown className="h-4 w-4" style={{ color: '#7170ff' }} />}
                  {plan.id === 'pro' && <Zap className="h-4 w-4" style={{ color: '#22c55e' }} />}
                  <span style={{ fontSize: '13px', fontWeight: 590, color: plan.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {plan.name}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em' }}>
                      {priceStr === '0' ? '0' : `${['USD','EUR','GBP','USDT'].includes(currency) ? sym : ''}${priceStr}${!['USD','EUR','GBP','USDT'].includes(currency) ? ` ${sym}` : ''}`}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--fh-t4)' }}>/мес</span>
                  </div>
                  {period !== 'monthly' && plan.monthlyUsd > 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '2px' }}>
                      {['USD','EUR','GBP','USDT'].includes(currency)
                        ? `${sym}${totalStr} за ${period === 'quarterly' ? '3 месяца' : 'год'}`
                        : `${totalStr} ${sym} за ${period === 'quarterly' ? '3 месяца' : 'год'}`}
                    </p>
                  )}
                  {plan.monthlyUsd === 0 && (
                    <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginTop: '2px' }}>
                      Бесплатно навсегда
                    </p>
                  )}
                </div>

                {/* Quick highlights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {plan.id === 'free' && [
                    'Маркетплейс без комиссии',
                    '5 откликов в месяц',
                    'AI Smart Search',
                    'Прямые сообщения',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--fh-t4)' }} />
                      <span style={{ fontSize: '13px', color: 'var(--fh-t3)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.id === 'pro' && [
                    'Всё из Starter',
                    '30 откликов в месяц',
                    'Калькулятор дохода',
                    'Дашборд аналитики',
                    'Кто просматривал профиль',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                      <span style={{ fontSize: '13px', color: 'var(--fh-t2)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.id === 'premium' && [
                    'Всё из Pro',
                    'Неограниченные отклики',
                    'Трекер целей + Календарь',
                    'AI-ассистент без лимита',
                    'AI-резюме + Telegram',
                    'Premium-бейдж + Буст x3',
                  ].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Check className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#7170ff' }} />
                      <span style={{ fontSize: '13px', color: 'var(--fh-t2)', fontWeight: f === 'Всё из Pro' ? 400 : 500 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.ctaHref}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    padding: '11px 16px', borderRadius: '10px',
                    background: isPremium ? '#5e6ad2' : plan.id === 'pro' ? 'rgba(34,197,94,0.1)' : 'var(--fh-surface-2)',
                    color: isPremium ? '#fff' : plan.id === 'pro' ? '#22c55e' : 'var(--fh-t3)',
                    border: isPremium ? 'none' : plan.id === 'pro' ? '1px solid rgba(34,197,94,0.3)' : '1px solid var(--fh-border)',
                    fontSize: '14px', fontWeight: 590, textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* ── Feature breakdown stats ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))',
          gap: '12px', marginBottom: '56px',
        }}>
          {[
            { n: '25+', label: 'функций на платформе' },
            { n: '10',  label: 'валют поддерживается' },
            { n: '3',   label: 'языка интерфейса' },
            { n: '0%',  label: 'комиссия с заказов' },
          ].map(({ n, label }) => (
            <div key={n} style={{
              textAlign: 'center', padding: '20px 12px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
              borderRadius: '14px',
            }}>
              <p style={{ fontSize: '28px', fontWeight: 590, color: '#7170ff', letterSpacing: '-0.04em', marginBottom: '4px' }}>{n}</p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)', lineHeight: 1.4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Full feature comparison table ── */}
        <div style={{ marginBottom: '56px' }}>
          <h2 style={{
            fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)',
            textAlign: 'center', marginBottom: '28px', letterSpacing: '-0.03em',
          }}>
            Полное сравнение функций
          </h2>

          {/* Desktop table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-subtle">
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
              background: 'var(--fh-surface-2)', borderBottom: '1px solid var(--fh-border)',
              padding: '14px 20px',
            }}>
              <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Функция
              </span>
              {PLANS.map(p => (
                <span key={p.id} style={{
                  fontSize: '13px', fontWeight: 590, color: p.highlight ? '#7170ff' : 'var(--fh-t2)',
                  textAlign: 'center',
                }}>
                  {p.name}
                </span>
              ))}
            </div>

            {FEATURE_GROUPS.map((group, gi) => (
              <div key={gi}>
                {/* Group header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px',
                  background: 'var(--fh-surface)', borderBottom: '1px solid var(--fh-border)',
                }}>
                  <span style={{ color: '#7170ff' }}>{group.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {group.label}
                  </span>
                </div>
                {/* Rows */}
                {group.features.map((feat, fi) => (
                  <div key={fi} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    padding: '11px 20px', borderBottom: '1px solid var(--fh-border)',
                    background: fi % 2 === 0 ? 'var(--fh-surface)' : 'var(--fh-surface-2)',
                    alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--fh-t2)' }}>{feat.label}</span>
                    <div style={{ textAlign: 'center', color: 'var(--fh-t3)' }}>
                      <CellValue val={feat.free} />
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--fh-t3)' }}>
                      <CellValue val={feat.pro} />
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--fh-t2)' }}>
                      <CellValue val={feat.premium} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Mobile accordion */}
          <div className="md:hidden space-y-3">
            {FEATURE_GROUPS.map((group, gi) => (
              <div key={gi} style={{
                borderRadius: '12px', overflow: 'hidden',
                border: '1px solid var(--fh-border)',
                background: 'var(--fh-surface)',
              }}>
                <button
                  onClick={() => setOpenGroup(openGroup === gi ? null : gi)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#7170ff' }}>{group.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 510, color: 'var(--fh-t1)' }}>{group.label}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>{group.features.length} функций</span>
                </button>
                {openGroup === gi && (
                  <div>
                    {/* Mobile column header */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                      padding: '8px 16px', borderTop: '1px solid var(--fh-border)',
                      background: 'var(--fh-surface-2)',
                    }}>
                      {PLANS.map(p => (
                        <span key={p.id} style={{
                          fontSize: '11px', fontWeight: 590, textAlign: 'center',
                          color: p.highlight ? '#7170ff' : 'var(--fh-t4)',
                          textTransform: 'uppercase', letterSpacing: '0.04em',
                        }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                    {group.features.map((feat, fi) => (
                      <div key={fi} style={{
                        borderTop: '1px solid var(--fh-border)',
                        padding: '10px 16px',
                        background: fi % 2 === 0 ? 'var(--fh-surface)' : 'var(--fh-surface-2)',
                      }}>
                        <p style={{ fontSize: '12px', color: 'var(--fh-t3)', marginBottom: '8px' }}>{feat.label}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                          <div style={{ textAlign: 'center', color: 'var(--fh-t3)' }}><CellValue val={feat.free} /></div>
                          <div style={{ textAlign: 'center', color: 'var(--fh-t3)' }}><CellValue val={feat.pro} /></div>
                          <div style={{ textAlign: 'center', color: 'var(--fh-t2)' }}><CellValue val={feat.premium} /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{
          textAlign: 'center', padding: 'clamp(32px,5vw,56px) 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(94,106,210,0.06) 0%, rgba(113,112,255,0.04) 100%)',
          border: '1px solid rgba(94,106,210,0.2)',
        }}>
          <Crown className="h-8 w-8 mx-auto mb-4" style={{ color: '#7170ff' }} />
          <h2 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '10px', letterSpacing: '-0.03em' }}>
            Готовы зарабатывать больше?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--fh-t3)', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Начните с бесплатного тарифа, а когда будете готовы — прокачайтесь до Premium.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/auth/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 22px', borderRadius: '10px',
                background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
                color: 'var(--fh-t2)', fontSize: '14px', fontWeight: 510, textDecoration: 'none',
              }}
            >
              Начать бесплатно <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/premium"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 22px', borderRadius: '10px',
                background: '#5e6ad2', color: '#fff',
                fontSize: '14px', fontWeight: 590, textDecoration: 'none',
                boxShadow: '0 0 0 1px rgba(113,112,255,0.3), 0 4px 16px rgba(94,106,210,0.25)',
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
