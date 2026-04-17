import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import {
  Users, Briefcase, MessageSquare, TrendingUp,
  Activity, Bell, Heart, BarChart3, ExternalLink,
  ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Crown
} from 'lucide-react'
import AdminManageButtons from '@/components/admin/AdminManageButtons'
import PaymentApproveButton from '@/components/admin/PaymentApproveButton'
import CompanyReport from '@/components/admin/CompanyReport'
import Link from 'next/link'
import { isAdmin } from '@/lib/auth/isAdmin'
import { getSessionUser } from '@/lib/auth/getSessionUser'

export const metadata: Metadata = {
  title: 'Analytics — FreelanceHub',
  robots: { index: false, follow: false },
}

// ── Helpers ─────────────────────────────────────────────────
function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ── Types ────────────────────────────────────────────────────
interface StatRow { count: string }
interface DayRow  { day: string; count: string }
interface CatRow  { category: string; count: string }
interface UserRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  role: string | null
}

interface VerifyRow {
  user_id: string
  verification_requested_at: string
  profiles: { full_name: string | null } | null
}

interface PremiumRow {
  user_id: string
  is_premium: boolean
  premium_until: string | null
  profiles: { full_name: string | null } | null
}

interface PendingPaymentRow {
  id: string
  user_id: string
  amount_kzt: number
  kaspi_order_id: string | null
  created_at: string
  profiles: { full_name: string | null } | null
}

// ── Data fetching ────────────────────────────────────────────
async function fetchStats() {
  const db = serviceClient() as any

  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const week  = new Date(now.getTime() - 7  * 86400_000).toISOString()
  const month = new Date(now.getTime() - 30 * 86400_000).toISOString()

  const [
    totalUsers,   usersToday,  usersWeek,
    totalOrders,  ordersToday, ordersWeek,
    totalResponses, responsesToday,
    totalMessages,  messagesToday,
    totalFavs,
    totalNotifs,
    recentUsers,
    ordersByDay,
    usersByDay,
    ordersByCat,
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today),
    db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', week),

    db.from('orders').select('*', { count: 'exact', head: true }),
    db.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today),
    db.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', week),

    db.from('order_responses').select('*', { count: 'exact', head: true }),
    db.from('order_responses').select('*', { count: 'exact', head: true }).gte('created_at', today),

    db.from('messages').select('*', { count: 'exact', head: true }),
    db.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', today),

    db.from('favorites').select('*', { count: 'exact', head: true }),
    db.from('notifications').select('*', { count: 'exact', head: true }),

    // Last 10 users
    db.from('profiles').select('id,email,full_name,avatar_url,created_at,role')
      .order('created_at', { ascending: false }).limit(10),

    // Orders per day last 14 days
    db.rpc('orders_per_day', { days_back: 14 }).select('*'),

    // Users per day last 14 days
    db.rpc('users_per_day', { days_back: 14 }).select('*'),

    // Orders by category
    db.from('orders').select('category').limit(500),
  ])

  // Verification requests
  const { data: verifyRequests } = await db
    .from('freelancer_profiles')
    .select('user_id, verification_requested_at, profiles!inner(full_name)')
    .eq('verification_requested', true)
    .eq('is_verified', false)
    .order('verification_requested_at', { ascending: true })
    .limit(20)

  // Premium freelancers
  const { data: premiumFreelancers } = await db
    .from('freelancer_profiles')
    .select('user_id, is_premium, premium_until, profiles!inner(full_name)')
    .eq('is_premium', true)
    .order('premium_until', { ascending: true })
    .limit(20)

  // Pending card payments
  const { data: pendingPayments } = await db
    .from('payments')
    .select('id, user_id, amount_kzt, kaspi_order_id, created_at, profiles!inner(full_name)')
    .eq('status', 'pending_card')
    .order('created_at', { ascending: true })
    .limit(30)

  // Count orders by category manually
  const catMap: Record<string, number> = {}
  for (const row of (ordersByCat.data ?? [])) {
    catMap[row.category] = (catMap[row.category] ?? 0) + 1
  }
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({ category, count }))

  return {
    users:     { total: totalUsers.count ?? 0,     today: usersToday.count ?? 0,     week: usersWeek.count ?? 0     },
    orders:    { total: totalOrders.count ?? 0,    today: ordersToday.count ?? 0,    week: ordersWeek.count ?? 0    },
    responses: { total: totalResponses.count ?? 0, today: responsesToday.count ?? 0 },
    messages:  { total: totalMessages.count ?? 0,  today: messagesToday.count ?? 0  },
    favorites: totalFavs.count ?? 0,
    notifications: totalNotifs.count ?? 0,
    recentUsers: (recentUsers.data ?? []) as UserRow[],
    ordersByDay:  (ordersByDay.data  ?? []) as DayRow[],
    usersByDay:   (usersByDay.data   ?? []) as DayRow[],
    topCategories,
    verifyRequests:    (verifyRequests    ?? []) as VerifyRow[],
    premiumFreelancers:(premiumFreelancers ?? []) as PremiumRow[],
    pendingPayments:   (pendingPayments    ?? []) as PendingPaymentRow[],
  }
}

// ── Components ──────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: number | string; sub?: string
  icon: React.ElementType; color: string; trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <div className="rounded-2xl border border-subtle bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-400', '-500/10')}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {trend === 'up'   && <ArrowUpRight   className="h-3 w-3 text-green-400" />}
          {trend === 'down' && <ArrowDownRight  className="h-3 w-3 text-red-400"   />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  )
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-6 text-right">{value}</span>
    </div>
  )
}

function SparkBars({ data, color }: { data: DayRow[]; color: string }) {
  const max = Math.max(...data.map(d => Number(d.count)), 1)
  return (
    <div className="flex items-end gap-0.5 h-10">
      {data.map((d, i) => {
        const h = Math.max(2, Math.round((Number(d.count) / max) * 40))
        return (
          <div
            key={i}
            title={`${d.day}: ${d.count}`}
            className={`flex-1 rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
            style={{ height: `${h}px` }}
          />
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default async function AdminPage() {
  const user = await getSessionUser()

  // Auth gate — JWT claim (is_admin) OR fallback to ADMIN_EMAIL env var
  if (!isAdmin(user)) {
    redirect('/auth/login')
  }

  const stats = await fetchStats()
  const vercelUrl = `https://vercel.com/alizhan/freelance-hub/analytics`

  const CATEGORY_LABELS: Record<string, string> = {
    development: 'Development', design: 'Design', marketing: 'Marketing',
    copywriting: 'Copywriting', video: 'Video', photo: 'Photo',
    translation: 'Translation', business: 'Business', other: 'Other',
  }

  return (
    <div className="page-shell page-shell--wide space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Admin</span>
          </div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live data from Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/pitch"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            <Crown className="h-4 w-4 text-primary" />
            Investor Pitch
          </Link>
          <Link
            href="/admin/ai-meeting"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            AI Strategy
          </Link>
          <Link
            href="/admin/war-room"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            War Room
          </Link>
          <Link
            href="/admin/board-room"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            Board Room
          </Link>
          <Link
            href="/admin/2fa"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-green-400" />
            2FA
          </Link>
          <Link
            href="/admin/nexus"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium hover:bg-surface transition-colors"
            style={{ borderColor: 'rgba(113,112,255,0.4)', background: 'rgba(113,112,255,0.08)', color: '#7170ff' }}
          >
            🌐 NEXUS
          </Link>
          <Link
            href={vercelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-subtle bg-subtle text-sm font-medium hover:bg-surface transition-colors"
          >
            <Activity className="h-4 w-4 text-primary" />
            Vercel Analytics
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Company reports */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🏢</span>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Company Report</h2>
        </div>
        <CompanyReport />
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Users" value={stats.users.total}
          sub={`+${stats.users.today} today · +${stats.users.week} this week`}
          icon={Users} color="text-blue-400" trend="up"
        />
        <StatCard
          label="Orders" value={stats.orders.total}
          sub={`+${stats.orders.today} today · +${stats.orders.week} this week`}
          icon={Briefcase} color="text-primary" trend={stats.orders.today > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Applications" value={stats.responses.total}
          sub={`+${stats.responses.today} today`}
          icon={TrendingUp} color="text-green-400" trend={stats.responses.today > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          label="Messages" value={stats.messages.total}
          sub={`+${stats.messages.today} today`}
          icon={MessageSquare} color="text-amber-400" trend={stats.messages.today > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Favorites"       value={stats.favorites}     icon={Heart}   color="text-red-400" />
        <StatCard label="Notifications"   value={stats.notifications} icon={Bell}    color="text-purple-400" />
        <StatCard label="Active (7d)"     value={stats.users.week}    icon={Activity} color="text-cyan-400" />
        <StatCard
          label="Application rate"
          value={stats.orders.total > 0
            ? `${Math.round((stats.responses.total / stats.orders.total) * 10) / 10}x`
            : '—'
          }
          icon={BarChart3} color="text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Charts */}
        <div className="lg:col-span-2 space-y-4">

          {/* Users chart */}
          <div className="rounded-2xl border border-subtle bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">New users</h2>
              <span className="text-xs text-muted-foreground">14 days</span>
            </div>
            {stats.usersByDay.length > 0 ? (
              <>
                <SparkBars data={stats.usersByDay} color="bg-blue-400" />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground/60">
                    {stats.usersByDay[0]?.day ?? ''}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {stats.usersByDay.at(-1)?.day ?? ''}
                  </span>
                </div>
              </>
            ) : (
              <NoDataChart label="users" />
            )}
          </div>

          {/* Orders chart */}
          <div className="rounded-2xl border border-subtle bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">New orders</h2>
              <span className="text-xs text-muted-foreground">14 days</span>
            </div>
            {stats.ordersByDay.length > 0 ? (
              <>
                <SparkBars data={stats.ordersByDay} color="bg-primary" />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground/60">
                    {stats.ordersByDay[0]?.day ?? ''}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    {stats.ordersByDay.at(-1)?.day ?? ''}
                  </span>
                </div>
              </>
            ) : (
              <NoDataChart label="orders" />
            )}
          </div>

          {/* Top categories */}
          {stats.topCategories.length > 0 && (
            <div className="rounded-2xl border border-subtle bg-card p-5">
              <h2 className="text-sm font-semibold mb-4">Top categories</h2>
              <div className="space-y-3">
                {stats.topCategories.map(({ category, count }) => {
                  const maxCount = stats.topCategories[0].count
                  return (
                    <div key={category} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 truncate">
                        {CATEGORY_LABELS[category] ?? category}
                      </span>
                      <MiniBar value={count} max={maxCount} color="bg-primary" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="rounded-2xl border border-subtle bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Recent signups</h2>
          </div>
          <div className="space-y-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-xs text-muted-foreground">No users yet</p>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {(u.full_name ?? u.email ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{u.full_name ?? u.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(u.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    u.role === 'freelancer'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {u.role === 'freelancer' ? 'FL' : 'CL'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Platform health */}
          <div className="mt-6 pt-5 border-t border-subtle space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Platform health</p>
            {[
              { label: 'Orders / user',       value: stats.users.total > 0 ? (stats.orders.total / stats.users.total).toFixed(1) : '0', good: true },
              { label: 'Applications / order', value: stats.orders.total > 0 ? (stats.responses.total / stats.orders.total).toFixed(1) : '0', good: true },
              { label: 'Messages / day',       value: stats.messages.today.toString(), good: stats.messages.today > 0 },
            ].map(({ label, value, good }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`text-xs font-bold ${good ? 'text-green-400' : 'text-muted-foreground'}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Verification queue ── */}
      <div className="rounded-2xl border border-subtle bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Verification requests</h2>
          {stats.verifyRequests.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
              {stats.verifyRequests.length}
            </span>
          )}
        </div>
        {stats.verifyRequests.length === 0 ? (
          <p className="text-xs text-muted-foreground">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {stats.verifyRequests.map((row) => (
              <div key={row.user_id} className="flex items-center gap-3 flex-wrap">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {(row.profiles?.full_name ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{row.profiles?.full_name ?? row.user_id}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(row.verification_requested_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <AdminManageButtons userId={row.user_id} mode="verify" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Premium management ── */}
      <div className="rounded-2xl border border-subtle bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Premium freelancers</h2>
          {stats.premiumFreelancers.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {stats.premiumFreelancers.length}
            </span>
          )}
        </div>
        {stats.premiumFreelancers.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active Premium members</p>
        ) : (
          <div className="space-y-3">
            {stats.premiumFreelancers.map((row) => (
              <div key={row.user_id} className="flex items-center gap-3 flex-wrap">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                  {(row.profiles?.full_name ?? '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{row.profiles?.full_name ?? row.user_id}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {row.premium_until
                      ? `until ${new Date(row.premium_until).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
                      : 'lifetime'}
                  </p>
                </div>
                <AdminManageButtons userId={row.user_id} mode="premium" isActive />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending card payments ── */}
      <div className="rounded-2xl border border-amber-500/20 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold">Pending card payments</h2>
          {stats.pendingPayments.length > 0 && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold">
              {stats.pendingPayments.length}
            </span>
          )}
        </div>
        {stats.pendingPayments.length === 0 ? (
          <p className="text-xs text-muted-foreground">No pending payments</p>
        ) : (
          <div className="space-y-3">
            {stats.pendingPayments.map((row) => {
              const planId = String(row.kaspi_order_id ?? '').replace('card_', '')
              const planLabel = planId === 'quarterly' ? '3 months' : planId === 'annual' ? 'Annual' : 'Monthly'
              return (
                <div key={row.id} className="flex items-center gap-3 flex-wrap">
                  <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-400">
                    {(row.profiles?.full_name ?? '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {row.profiles?.full_name ?? row.user_id}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                      <span className="text-amber-400 font-semibold">₸{row.amount_kzt.toLocaleString('ru')}</span>
                      <span>·</span>
                      <span>{planLabel}</span>
                      <span>·</span>
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(row.created_at).toLocaleDateString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <PaymentApproveButton paymentId={row.id} userId={row.user_id} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Vercel Analytics promo card */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-5">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold mb-0.5">Vercel Analytics connected</p>
          <p className="text-sm text-muted-foreground">
            Traffic, sources, pages, countries, devices — all automatic. Data will appear after the first visits.
          </p>
        </div>
        <Link
          href={vercelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

    </div>
  )
}

function NoDataChart({ label }: { label: string }) {
  return (
    <div className="h-10 flex items-center justify-center">
      <span className="text-xs text-muted-foreground">No data for {label}</span>
    </div>
  )
}
