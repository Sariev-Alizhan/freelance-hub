'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  Briefcase, Star, DollarSign, Clock, CheckCircle,
  ArrowRight, Sparkles, User, LogIn, MapPin,
  Tag, Edit3, Zap, MessageSquare, Heart, ChevronRight,
  Circle, Eye, TrendingUp, Share2,
  Loader2, X, Camera,
} from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useProfile } from '@/lib/context/ProfileContext'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { createClient } from '@/lib/supabase/client'
import {
  Skeleton, SkeletonStats, SkeletonProfileHeader, SkeletonDashboardOrder
} from '@/components/ui/Skeleton'
import PortfolioManager from '@/components/dashboard/PortfolioManager'
import JobMatchWidget from '@/components/dashboard/JobMatchWidget'
import SavedSearchesWidget from '@/components/dashboard/SavedSearchesWidget'
import ReferralWidget from '@/components/dashboard/ReferralWidget'
import TelegramWidget from '@/components/dashboard/TelegramWidget'
import AnalyticsTab from '@/components/dashboard/AnalyticsTab'
import FavoritesTab from '@/components/dashboard/FavoritesTab'
import EmptyState from '@/components/dashboard/EmptyState'
import {
  AVAILABILITY_CONFIG, LEVEL_LABELS, STATUS_CONFIG,
  type AvailabilityStatus, type DashboardAnalytics,
  type FreelancerProfile, type MyOrder, type MyResponse, type Profile,
} from '@/components/dashboard/types'

export default function DashboardPage() {
  const { user, loading } = useUser()
  const { refreshProfile } = useProfile()
  const [tab, setTab] = useState<'freelancer' | 'client' | 'favorites' | 'portfolio' | 'analytics'>('freelancer')
  const { favorites } = useFavorites()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fp, setFp] = useState<FreelancerProfile | null>(null)
  const [availability, setAvailability] = useState<AvailabilityStatus>('open')
  const [availSaving, setAvailSaving] = useState(false)
  const [myOrders, setMyOrders] = useState<MyOrder[]>([])
  const [myResponses, setMyResponses] = useState<MyResponse[]>([])
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) { setProfileLoading(false); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any

    async function load() {
      setProfileLoading(true)
      const [profRes, fpRes] = await Promise.all([
        db.from('profiles').select('full_name,avatar_url,bio,location,role,username').eq('id', user!.id).single(),
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
          .select('id,proposed_price,created_at,status,message,order:orders(id,title,status,budget_min,budget_max)')
          .eq('freelancer_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setMyResponses(data || [])
      }
      setOrdersLoading(false)
    }
    loadTab()
  }, [user, tab])

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-shell page-shell--wide space-y-8">
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
          <h1 className="text-2xl font-bold mb-2">Sign in to your account</h1>
          <p className="text-muted-foreground">You need to be signed in to access your dashboard</p>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login" className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">
            Sign in
          </Link>
          <Link href="/auth/register" className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors">
            Register
          </Link>
        </div>
      </div>
    )
  }

  async function withdrawResponse(responseId: string) {
    setWithdrawing(responseId)
    try {
      const res = await fetch('/api/orders/withdraw', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId }),
      })
      if (res.ok) {
        setMyResponses(prev => prev.filter(r => r.id !== responseId))
      }
    } finally {
      setWithdrawing(null)
    }
  }

  async function uploadAvatar(file: File) {
    setAvatarUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.url) {
        setProfile(prev => prev ? { ...prev, avatar_url: data.url } : prev)
        // Refresh global ProfileContext so Header updates immediately
        refreshProfile()
      }
    } finally {
      setAvatarUploading(false)
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

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || null

  const completionItems = [
    { label: 'Account created',  done: true },
    { label: 'Profile photo',    done: !!avatarUrl },
    { label: 'Name & bio',       done: !!(profile?.full_name && profile?.bio) },
    { label: 'Specialization',   done: !!fp?.title },
    { label: 'Skills',           done: (fp?.skills?.length ?? 0) >= 2 },
  ]
  const completionPct = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100)

  return (
    <div className="page-shell page-shell--wide">

      {/* ── Header ── */}
      {profileLoading ? <SkeletonProfileHeader /> : (
        <div className="flex items-start gap-4 mb-6" style={{ minWidth: 0, maxWidth: '100%' }}>
          <div className="flex-shrink-0">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = '' }}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="relative group h-16 w-16 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
              title="Change photo"
            >
              {avatarUploading ? (
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} width={64} height={64} className="rounded-2xl object-cover w-16 h-16" unoptimized />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
              )}
              {!avatarUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              )}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground">Welcome,</div>
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
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {profile?.username && (
              <button
                onClick={() => navigator.clipboard?.writeText(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'}/u/${profile.username}`).catch(() => {})}
                title={`/u/${profile.username}`}
                className="narrow-hide flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
            )}
            {profile?.username && (
              <Link href={`/u/${profile.username}`} className="narrow-hide flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground">
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View</span>
              </Link>
            )}
            <Link href="/profile/setup" className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-subtle text-sm hover:bg-subtle transition-colors text-muted-foreground">
              <Edit3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
          </div>
        </div>
      )}

      {/* Bio */}
      {!profileLoading && profile?.bio && (
        <div className="mb-5 p-4 rounded-xl bg-subtle border border-subtle text-sm text-muted-foreground leading-relaxed"
          style={{
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            hyphens: 'auto',
            minWidth: 0,
            maxWidth: '100%',
            width: '100%',
            boxSizing: 'border-box',
            whiteSpace: 'pre-wrap',
          }}>
          {profile.bio}
        </div>
      )}

      {/* Skills + price */}
      {!profileLoading && (fp?.skills?.length ?? 0) > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            {fp!.skills.map(s => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">{s}</span>
            ))}
          </div>
          {fp?.price_from ? (
            <div className="mt-1.5 text-sm font-semibold" style={{ color: '#27a644' }}>
              from {fp.price_from.toLocaleString()} ₸{fp.price_to ? ` — ${fp.price_to.toLocaleString()} ₸` : ''}
            </div>
          ) : null}
        </div>
      )}

      {/* ── Availability toggle (freelancers only) ── */}
      {!profileLoading && fp && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="h-3 w-3 flex-shrink-0" style={{ color: AVAILABILITY_CONFIG[availability].dot, fill: AVAILABILITY_CONFIG[availability].dot }} />
            <span className="text-xs text-muted-foreground font-medium">Status</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(Object.entries(AVAILABILITY_CONFIG) as [AvailabilityStatus, typeof AVAILABILITY_CONFIG['open']][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => saveAvailability(key)}
                disabled={availSaving}
                className="transition-all disabled:opacity-50 flex-shrink-0"
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { label: 'Earned',      value: '0 ₸',                                  icon: DollarSign, color: 'text-green-400'  },
            { label: 'Orders',      value: String(fp?.completed_orders ?? 0),       icon: Briefcase,  color: 'text-blue-400'   },
            { label: 'Rating',      value: fp?.rating ? String(fp.rating) : '—',   icon: Star,       color: 'text-amber-400'  },
            { label: 'In progress', value: '0',                                     icon: Clock,      color: 'text-purple-400' },
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



      {/* ── Role tabs ── */}
      <div className="flex gap-2 mb-6 border-b border-subtle overflow-x-auto">
        {(['freelancer', 'client', 'portfolio', 'favorites', ...(fp && analytics ? ['analytics'] : [])] as const).map((t) => (
          <button key={t} onClick={() => setTab(t as typeof tab)}
            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'favorites' && <Heart className="h-3.5 w-3.5" />}
            {t === 'analytics' && <TrendingUp className="h-3.5 w-3.5" />}
            {t === 'freelancer' ? 'As freelancer' : t === 'client' ? 'As client' : t === 'portfolio' ? 'Portfolio' : t === 'favorites' ? 'Saved' : 'Analytics'}
            {t === 'favorites' && favorites.length > 0 && (
              <span className="ml-0.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                {favorites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Orders / Responses / Favorites / Portfolio ── */}
        <div className="lg:col-span-2">
          {tab !== 'favorites' && tab !== 'portfolio' && tab !== 'analytics' && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">
              {tab === 'freelancer' ? 'My responses' : 'My orders'}
            </h2>
            <Link href={tab === 'freelancer' ? '/orders' : '/orders/new'}
              className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
              {tab === 'freelancer' ? 'Find orders' : 'Post a job'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          )}

          {tab === 'analytics' ? (
            <AnalyticsTab analytics={analytics} />
          ) : tab === 'portfolio' ? (
            user ? <PortfolioManager freelancerId={user.id} /> : null
          ) : tab === 'favorites' ? (
            <FavoritesTab favorites={favorites} />
          ) : tab === 'freelancer' && !ordersLoading ? (
            <>
              <JobMatchWidget />
              {myResponses.length === 0 ? (
                <EmptyState
                  emoji="📭" title="No responses yet"
                  sub="Find a suitable project and apply"
                  href="/orders" cta="Browse orders"
                />
              ) : (
                <div className="space-y-3">
                  {myResponses.map(resp => {
                    const order = Array.isArray(resp.order) ? resp.order[0] : resp.order
                    if (!order) return null

                    const RESP_STATUS = {
                      pending:  { label: 'Pending',  color: '#8a8f98', bg: 'rgba(138,143,152,0.08)', border: 'rgba(138,143,152,0.2)' },
                      accepted: { label: 'Accepted', color: '#27a644', bg: 'rgba(39,166,68,0.08)',   border: 'rgba(39,166,68,0.25)'  },
                      rejected: { label: 'Declined', color: '#e5484d', bg: 'rgba(229,72,77,0.06)',   border: 'rgba(229,72,77,0.2)'   },
                    }
                    const rs = RESP_STATUS[resp.status ?? 'pending']

                    return (
                      <div
                        key={resp.id}
                        style={{
                          borderRadius: '12px', border: `1px solid ${rs.border}`,
                          background: rs.bg, overflow: 'hidden',
                          transition: 'box-shadow 0.15s',
                        }}
                      >
                        <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none', display: 'block', padding: '14px 16px' }}>
                          <div className="flex items-start justify-between gap-3">
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '14px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '4px',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {order.title}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                                  {order.budget_min.toLocaleString()}–{order.budget_max.toLocaleString()} ₸
                                </span>
                                {resp.proposed_price && (
                                  <>
                                    <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>·</span>
                                    <span style={{ fontSize: '12px', color: '#27a644', fontWeight: 510 }}>
                                      My bid: {resp.proposed_price.toLocaleString()} ₸
                                    </span>
                                  </>
                                )}
                                <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>·</span>
                                <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>
                                  {new Date(resp.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              {resp.message && (
                                <p style={{ fontSize: '12px', color: 'var(--fh-t3)', marginTop: '6px', lineHeight: 1.5,
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {resp.message}
                                </p>
                              )}
                            </div>
                            <span style={{
                              flexShrink: 0, fontSize: '11px', fontWeight: 700, padding: '3px 10px',
                              borderRadius: '6px', letterSpacing: '0.02em',
                              background: rs.bg, color: rs.color, border: `1px solid ${rs.border}`,
                            }}>
                              {rs.label}
                            </span>
                          </div>
                        </Link>

                        {/* Withdraw button — only for pending */}
                        {(resp.status ?? 'pending') === 'pending' && (
                          <div style={{
                            borderTop: '1px solid rgba(255,255,255,0.05)',
                            padding: '8px 16px',
                            display: 'flex', justifyContent: 'flex-end',
                          }}>
                            <button
                              onClick={() => withdrawResponse(resp.id)}
                              disabled={withdrawing === resp.id}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '12px', color: 'var(--fh-t4)',
                                opacity: withdrawing === resp.id ? 0.5 : 1,
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#e5484d' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
                            >
                              {withdrawing === resp.id
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <X className="h-3 w-3" />
                              }
                              Withdraw application
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          ) : ordersLoading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => <SkeletonDashboardOrder key={i} />)}
            </div>
          ) : tab === 'client' ? (
            myOrders.length === 0 ? (
              <EmptyState
                emoji="📋" title="No orders yet"
                sub="Post your first job and start receiving proposals"
                href="/orders/new" cta="Create order"
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
                            {order.budget_min.toLocaleString()}–{order.budget_max.toLocaleString()} ₸
                          </span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{order.responses_count} responses</span>
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
          ) : null}
        </div>

        {/* ── Right panel ── */}
        <div className="space-y-6">
          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/messages" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <MessageSquare className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">Messages</span>
            </Link>
            <Link href="/orders/new" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors text-center">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium">New order</span>
            </Link>
          </div>

          {/* Saved searches */}
          {tab === 'freelancer' && (
            <div className="rounded-2xl border border-subtle bg-card p-5">
              <SavedSearchesWidget />
            </div>
          )}

          {/* AI hint */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI assistant</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Use AI matching to quickly find the right specialist or a suitable order
            </p>
            <Link href="/ai-assistant" className="block w-full py-2 text-center rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              Open AI assistant
            </Link>
          </div>

          {/* Referral widget */}
          {profile?.username && (
            <ReferralWidget username={profile.username} />
          )}

          {/* Telegram notifications */}
          {fp && <TelegramWidget />}

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
                <span className="text-sm font-semibold">Profile completion</span>
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
                  <Zap className="h-3.5 w-3.5" /> Complete profile
                </Link>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                  <CheckCircle className="h-3.5 w-3.5" /> Profile complete
                </div>
              )}
              <Link
                href="/ai-resume"
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'var(--fh-primary-muted)', border: '1px solid var(--fh-primary)', color: 'var(--fh-primary)' }}
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Resume Builder
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
