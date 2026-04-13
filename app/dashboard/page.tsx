'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  Briefcase, Star, DollarSign, Clock, CheckCircle,
  ArrowRight, Sparkles, User, LogIn, MapPin,
  Tag, Edit3, Zap, MessageSquare, Heart, ChevronRight,
  Circle, Eye, Crown, ShieldCheck, TrendingUp
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { createClient } from '@/lib/supabase/client'
import {
  Skeleton, SkeletonStats, SkeletonProfileHeader, SkeletonDashboardOrder
} from '@/components/ui/Skeleton'
import { MOCK_ORDERS, MOCK_FREELANCERS } from '@/lib/mock'

// ── Types ──────────────────────────────────────────────────
interface Profile {
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  role: string
}

type AvailabilityStatus = 'open' | 'busy' | 'vacation'

const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; dot: string; border: string; bg: string }> = {
  open:     { label: 'Открыт к заказам', dot: '#27a644', border: 'rgba(39,166,68,0.25)',    bg: 'rgba(39,166,68,0.06)'    },
  busy:     { label: 'Занят',            dot: '#f59e0b', border: 'rgba(245,158,11,0.25)',   bg: 'rgba(245,158,11,0.06)'   },
  vacation: { label: 'В отпуске',        dot: '#8a8f98', border: 'rgba(138,143,152,0.25)',  bg: 'rgba(138,143,152,0.06)'  },
}

interface FreelancerProfile {
  title: string; category: string; skills: string[]
  price_from: number; price_to: number | null
  level: string; rating: number; reviews_count: number; completed_orders: number
  availability_status?: AvailabilityStatus
}

interface MyOrder {
  id: string; title: string; status: string
  budget_min: number; budget_max: number
  responses_count: number; created_at: string; category: string
}

interface MyResponse {
  id: string; proposed_price: number | null; created_at: string
  order: { id: string; title: string; status: string; budget_min: number; budget_max: number }
}

// ── Helpers ────────────────────────────────────────────────
const LEVEL_LABELS: Record<string, string> = {
  new: '🌱 Новичок', junior: '⚡ Junior', middle: '🔥 Middle', senior: '💎 Senior', top: '👑 Топ'
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Открыт',    color: 'text-green-400',  bg: 'bg-green-500/10'  },
  in_progress: { label: 'В работе',  color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
  completed:   { label: 'Завершён',  color: 'text-muted-foreground', bg: 'bg-subtle'  },
  cancelled:   { label: 'Отменён',   color: 'text-red-400',    bg: 'bg-red-500/10'    },
}

export default function DashboardPage() {
  const { user, loading } = useUser()
  const [tab, setTab] = useState<'freelancer' | 'client' | 'favorites'>('freelancer')
  const { favorites } = useFavorites()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fp, setFp] = useState<FreelancerProfile | null>(null)
  const [availability, setAvailability] = useState<AvailabilityStatus>('open')
  const [availSaving, setAvailSaving] = useState(false)
  const [myOrders, setMyOrders] = useState<MyOrder[]>([])
  const [myResponses, setMyResponses] = useState<MyResponse[]>([])
  const [profileLoading, setProfileLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Analytics
  const [analytics, setAnalytics] = useState<{
    views7: number; views30: number; responsesThisMonth: number
    responseLimit: number | null; isPremium: boolean; isVerified: boolean
    verificationRequested: boolean
  } | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  useEffect(() => {
    if (!user) { setProfileLoading(false); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    async function load() {
      setProfileLoading(true)
      const [profRes, fpRes] = await Promise.all([
        db.from('profiles').select('full_name,avatar_url,bio,location,role').eq('id', user!.id).single(),
        db.from('freelancer_profiles').select('title,category,skills,price_from,price_to,level,rating,reviews_count,completed_orders,availability_status').eq('user_id', user!.id).single(),
      ])
      if (profRes.data) setProfile(profRes.data)
      if (fpRes.data) {
        setFp(fpRes.data)
        if (fpRes.data.availability_status) setAvailability(fpRes.data.availability_status)
      }
      setProfileLoading(false)

      // Load analytics for freelancers
      if (fpRes.data) {
        fetch('/api/profile/analytics')
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d) setAnalytics(d) })
          .catch(() => {})
      }
    }
    load()
  }, [user])

  // Load orders/responses when tab changes
  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    setOrdersLoading(true)

    async function loadTab() {
      if (tab === 'client') {
        const { data } = await db
          .from('orders')
          .select('id,title,status,budget_min,budget_max,responses_count,created_at,category')
          .eq('client_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setMyOrders(data || [])
      } else {
        const { data } = await db
          .from('order_responses')
          .select('id,proposed_price,created_at,order:orders(id,title,status,budget_min,budget_max)')
          .eq('freelancer_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(10)
        setMyResponses(data || [])
      }
      setOrdersLoading(false)
    }
    loadTab()
  }, [user, tab])

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <SkeletonProfileHeader />
        <SkeletonStats />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <LogIn className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Войдите в аккаунт</h1>
          <p className="text-muted-foreground">Чтобы открыть личный кабинет, нужна авторизация</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            Войти
          </Link>
          <Link href="/auth/register" className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors">
            Регистрация
          </Link>
        </div>
      </div>
    )
  }

  async function requestVerification() {
    setVerifyLoading(true)
    try {
      await fetch('/api/profile/verify-request', { method: 'POST' })
      setAnalytics(prev => prev ? { ...prev, verificationRequested: true } : prev)
    } finally {
      setVerifyLoading(false)
    }
  }

  async function saveAvailability(status: AvailabilityStatus) {
    setAvailSaving(true)
    setAvailability(status)
    try {
      await fetch('/api/profile/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } finally {
      setAvailSaving(false)
    }
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Пользователь'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null

  const completionItems = [
    { label: 'Аккаунт создан',  done: true },
    { label: 'Фото профиля',    done: !!avatarUrl },
    { label: 'Имя и описание',  done: !!(profile?.full_name && profile?.bio) },
    { label: 'Специализация',   done: !!fp?.title },
    { label: 'Навыки',          done: (fp?.skills?.length ?? 0) >= 2 },
  ]
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ── */}
      {profileLoading ? <SkeletonProfileHeader /> : (
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={displayName} width={64} height={64} className="rounded-2xl object-cover w-16 h-16" unoptimized />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground">Добро пожаловать,</div>
            <h1 className="text-xl font-bold truncate">{displayName}</h1>
            {fp?.title ? (
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-sm text-muted-foreground">{fp.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {LEVEL_LABELS[fp.level] ?? fp.level}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            )}
            {profile?.location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" /> {profile.location}
              </div>
            )}
          </div>
          <Link href="/profile/setup" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground flex-shrink-0">
            <Edit3 className="h-3.5 w-3.5" /> Редактировать
          </Link>
        </div>
      )}

      {/* Bio */}
      {!profileLoading && profile?.bio && (
        <div className="mb-6 p-4 rounded-xl bg-subtle border border-subtle text-sm text-muted-foreground leading-relaxed">
          {profile.bio}
        </div>
      )}

      {/* Skills */}
      {!profileLoading && (fp?.skills?.length ?? 0) > 0 && (
        <div className="mb-6 flex items-center gap-2 flex-wrap">
          <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          {fp!.skills.map(s => (
            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
          ))}
          {fp?.price_from ? (
            <span className="ml-auto text-sm font-semibold text-green-400">
              от {fp.price_from.toLocaleString('ru')} ₽{fp.price_to ? ` — ${fp.price_to.toLocaleString('ru')} ₽` : ''}
            </span>
          ) : null}
        </div>
      )}

      {/* ── Availability toggle (freelancers only) ── */}
      {!profileLoading && fp && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <Circle className="h-3 w-3 flex-shrink-0" style={{ color: AVAILABILITY_CONFIG[availability].dot, fill: AVAILABILITY_CONFIG[availability].dot }} />
          <span className="text-sm text-muted-foreground">Статус:</span>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.entries(AVAILABILITY_CONFIG) as [AvailabilityStatus, typeof AVAILABILITY_CONFIG['open']][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => saveAvailability(key)}
                disabled={availSaving}
                className="transition-all disabled:opacity-50"
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 510,
                  background: availability === key ? cfg.bg : 'transparent',
                  border: availability === key ? `1px solid ${cfg.border}` : '1px solid var(--fh-border-2)',
                  color: availability === key ? cfg.dot : 'var(--fh-t4)',
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      {profileLoading ? <SkeletonStats /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Заработано',  value: '0 ₽',                                  icon: DollarSign, color: 'text-green-400'  },
            { label: 'Заказов',     value: String(fp?.completed_orders ?? 0),       icon: Briefcase,  color: 'text-blue-400'   },
            { label: 'Рейтинг',     value: fp?.rating ? String(fp.rating) : '—',   icon: Star,       color: 'text-amber-400'  },
            { label: 'В работе',    value: '0',                                     icon: Clock,      color: 'text-purple-400' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="rounded-2xl border border-subtle bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Analytics (freelancers only) ── */}
      {analytics && fp && (
        <div className="mb-6 rounded-2xl border border-subtle bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Аналитика профиля</span>
            </div>
            {/* Premium / Verified badges */}
            <div className="flex items-center gap-2">
              {analytics.isPremium && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(94,106,210,0.1)', color: '#5e6ad2', border: '1px solid rgba(94,106,210,0.2)' }}>
                  <Crown className="h-3 w-3" /> Premium
                </span>
              )}
              {analytics.isVerified && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: 'rgba(39,166,68,0.08)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
                  <ShieldCheck className="h-3 w-3" /> Верифицирован
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3" style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-border-2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">За 7 дней</span>
              </div>
              <div className="text-xl font-bold">{analytics.views7}</div>
              <div className="text-xs text-muted-foreground">просмотров</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-border-2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">За 30 дней</span>
              </div>
              <div className="text-xl font-bold">{analytics.views30}</div>
              <div className="text-xs text-muted-foreground">просмотров</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-border-2)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Отклики</span>
              </div>
              <div className="text-xl font-bold">
                {analytics.responsesThisMonth}
                {analytics.responseLimit !== null && (
                  <span className="text-sm font-normal text-muted-foreground"> / {analytics.responseLimit}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">в этом месяце</div>
            </div>
          </div>

          {/* Response limit bar */}
          {analytics.responseLimit !== null && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Лимит откликов</span>
                <span>{analytics.responsesThisMonth} / {analytics.responseLimit}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--fh-border-2)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (analytics.responsesThisMonth / analytics.responseLimit) * 100)}%`,
                    background: analytics.responsesThisMonth >= analytics.responseLimit ? '#ef4444' : '#5e6ad2',
                  }}
                />
              </div>
              {!analytics.isPremium && (
                <p className="text-xs text-muted-foreground mt-2">
                  Premium снимает лимит и даёт приоритет в поиске.{' '}
                  <span className="text-primary font-medium">2 000 ₸/мес</span>
                </p>
              )}
            </div>
          )}

          {/* Verification CTA */}
          {!analytics.isVerified && !analytics.verificationRequested && (
            <button
              onClick={requestVerification}
              disabled={verifyLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{ background: 'rgba(94,106,210,0.08)', border: '1px solid rgba(94,106,210,0.2)', color: '#5e6ad2' }}
            >
              <ShieldCheck className="h-4 w-4" />
              {verifyLoading ? 'Отправка…' : 'Подать заявку на верификацию — 5 000 ₸'}
            </button>
          )}
          {!analytics.isVerified && analytics.verificationRequested && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Заявка на верификацию отправлена — ожидайте проверки
            </div>
          )}
        </div>
      )}

      {/* ── Role tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-subtle">
        {(['freelancer', 'client', 'favorites'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'favorites' && <Heart className="h-3.5 w-3.5" />}
            {t === 'freelancer' ? 'Как фрилансер' : t === 'client' ? 'Как заказчик' : 'Избранное'}
            {t === 'favorites' && favorites.length > 0 && (
              <span className="ml-0.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {favorites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Orders / Responses / Favorites ── */}
        <div className="lg:col-span-2">
          {tab !== 'favorites' && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {tab === 'freelancer' ? 'Мои отклики' : 'Мои заказы'}
            </h2>
            <Link href={tab === 'freelancer' ? '/orders' : '/orders/new'}
              className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
              {tab === 'freelancer' ? 'Найти заказы' : 'Разместить заказ'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          )}

          {tab === 'favorites' ? (
            <FavoritesTab favorites={favorites} />
          ) : ordersLoading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <SkeletonDashboardOrder key={i} />)}
            </div>
          ) : tab === 'client' ? (
            myOrders.length === 0 ? (
              <EmptyState
                emoji="📋" title="Заказов пока нет"
                sub="Разместите первый заказ и получите предложения"
                href="/orders/new" cta="Создать заказ"
              />
            ) : (
              <div className="space-y-3">
                {myOrders.map(order => {
                  const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.open
                  return (
                    <Link key={order.id} href={`/orders/${order.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{order.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {order.budget_min.toLocaleString('ru')}–{order.budget_max.toLocaleString('ru')} ₽
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{order.responses_count} откликов</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color} ${st.bg}`}>
                          {st.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          ) : (
            myResponses.length === 0 ? (
              <EmptyState
                emoji="📭" title="Откликов пока нет"
                sub="Найдите подходящий проект и откликнитесь"
                href="/orders" cta="Смотреть заказы"
              />
            ) : (
              <div className="space-y-3">
                {myResponses.map(resp => {
                  const order = Array.isArray(resp.order) ? resp.order[0] : resp.order
                  if (!order) return null
                  const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.open
                  return (
                    <Link key={resp.id} href={`/orders/${order.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{order.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            Заказ: {order.budget_min.toLocaleString('ru')}–{order.budget_max.toLocaleString('ru')} ₽
                          </span>
                          {resp.proposed_price && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="text-xs text-green-400">Моя цена: {resp.proposed_price.toLocaleString('ru')} ₽</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color} ${st.bg}`}>
                          {st.label}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            )
          )}
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-6">
          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/messages" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Сообщения</span>
            </Link>
            <Link href="/orders/new" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Новый заказ</span>
            </Link>
          </div>

          {/* AI hint */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI-ассистент</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Используйте AI-подбор, чтобы быстро найти нужного специалиста или подходящий заказ
            </p>
            <Link href="/ai-assistant" className="block w-full py-2 text-center rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Открыть AI-ассистент
            </Link>
          </div>

          {/* Profile completion */}
          {profileLoading ? (
            <div className="rounded-2xl border border-subtle bg-card p-5 space-y-3">
              <div className="flex justify-between"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 w-10" /></div>
              <Skeleton className="h-2 rounded-full" />
              {[0,1,2,3,4].map(i => <div key={i} className="flex items-center gap-2"><Skeleton className="h-3.5 w-3.5 rounded-full" /><Skeleton className="h-3 w-28" /></div>)}
            </div>
          ) : (
            <div className="rounded-2xl border border-subtle bg-card p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Заполнение профиля</span>
                <span className={`text-sm font-bold ${completionPct === 100 ? 'text-green-400' : 'text-primary'}`}>{completionPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden mb-4">
                <div className={`h-full rounded-full transition-all duration-700 ${completionPct === 100 ? 'bg-green-400' : 'bg-primary'}`} style={{ width: `${completionPct}%` }} />
              </div>
              {completionItems.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-xs py-1">
                  <CheckCircle className={`h-3.5 w-3.5 flex-shrink-0 ${item.done ? 'text-green-400' : 'text-muted-foreground'}`} />
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
              {completionPct < 100 ? (
                <Link href="/profile/setup" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/20">
                  <Zap className="h-3.5 w-3.5" /> Заполнить профиль
                </Link>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                  <CheckCircle className="h-3.5 w-3.5" /> Профиль заполнен
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ emoji, title, sub, href, cta }: {
  emoji: string; title: string; sub: string; href: string; cta: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-subtle p-10 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{sub}</p>
      <Link href={href} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
        {cta} <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}

interface FavoriteItem {
  id: string
  target_type: 'order' | 'freelancer'
  target_id: string
}

function FavoritesTab({ favorites }: { favorites: FavoriteItem[] }) {
  const favOrders = favorites
    .filter((f) => f.target_type === 'order')
    .map((f) => MOCK_ORDERS.find((o) => o.id === f.target_id))
    .filter(Boolean)

  const favFreelancers = favorites
    .filter((f) => f.target_type === 'freelancer')
    .map((f) => MOCK_FREELANCERS.find((fl) => fl.id === f.target_id))
    .filter(Boolean)

  if (favorites.length === 0) {
    return (
      <EmptyState
        emoji="❤️"
        title="Избранное пусто"
        sub="Нажмите ❤️ на карточке заказа или фрилансера, чтобы сохранить"
        href="/orders"
        cta="Смотреть заказы"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Saved orders */}
      {favOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" /> Заказы ({favOrders.length})
          </h3>
          <div className="space-y-2">
            {favOrders.map((order) => {
              if (!order) return null
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{order.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.budget.min.toLocaleString('ru')}–{order.budget.max.toLocaleString('ru')} ₽
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Saved freelancers */}
      {favFreelancers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <User className="h-3.5 w-3.5" /> Фрилансеры ({favFreelancers.length})
          </h3>
          <div className="space-y-2">
            {favFreelancers.map((fl) => {
              if (!fl) return null
              return (
                <Link
                  key={fl.id}
                  href={`/freelancers/${fl.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
                >
                  <Image src={fl.avatar} alt={fl.name} width={36} height={36} className="rounded-xl object-cover flex-shrink-0" unoptimized />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{fl.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{fl.title}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-primary flex-shrink-0">
                    <Star className="h-3 w-3 fill-current" />
                    {fl.rating}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
