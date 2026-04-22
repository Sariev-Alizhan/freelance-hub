'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, TrendingUp, MessageSquare, Crown, ShieldCheck, BarChart2, Loader2 } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useRouter } from 'next/navigation'

interface AnalyticsData {
  views7:  number
  views30: number
  viewsByDay: { day: string; count: number }[]
  responsesThisMonth: number
  responseLimit: number | null
  isPremium: boolean
  premiumUntil: string | null
  isVerified: boolean
  verificationRequested: boolean
}

function Sparkline({ data }: { data: { day: string; count: number }[] }) {
  if (!data || data.length < 2) return <div style={{ height: '60px' }} />
  const values = data.map(d => d.count)
  const max = Math.max(...values, 1)
  const W = 280
  const H = 60
  const step = W / (values.length - 1)
  const pts = values.map((v, i) => `${i * step},${H - (v / max) * H}`)
  const area = `M${pts.join('L')}L${(values.length - 1) * step},${H}L0,${H}Z`
  const line = `M${pts.join('L')}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '60px', overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27a644" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#27a644" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <path d={line} fill="none" stroke="#27a644" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={i * step}
          cy={H - (v / max) * H}
          r="3"
          fill="#27a644"
          opacity={i === values.length - 1 ? 1 : 0.5}
        />
      ))}
    </svg>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = '#27a644',
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color?: string
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}14` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <span style={{ fontSize: '12px', color: 'var(--fh-t4)', fontWeight: 510 }}>{label}</span>
      </div>
      <div style={{ fontSize: '28px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '11px', color: 'var(--fh-t4)', marginTop: '6px' }}>{sub}</div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (userLoading) return
    if (!user) { router.push('/auth/login'); return }

    fetch('/api/profile/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setData(d)
      })
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [user, userLoading, router])

  const dayLabels = data?.viewsByDay?.map(d => {
    const date = new Date(d.day)
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }) ?? []

  return (
    <div className="page-shell page-shell--reading" style={{ minHeight: 'calc(100vh - 52px)' }}>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-8 transition-colors"
        style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400 }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(39,166,68,0.1)', border: '1px solid rgba(39,166,68,0.2)' }}
        >
          <BarChart2 className="h-5 w-5" style={{ color: '#27a644' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 590, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
            Analytics
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 400 }}>
            Profile visibility and response stats
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--fh-t4)' }} />
        </div>
      ) : error ? (
        <div
          className="rounded-xl p-5 text-center"
          style={{ background: 'rgba(229,72,77,0.06)', border: '1px solid rgba(229,72,77,0.2)', color: '#e5484d', fontSize: '14px' }}
        >
          {error}
        </div>
      ) : data && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={Eye}
              label="Views (7d)"
              value={data.views7.toLocaleString()}
              sub="Profile views"
              color="#27a644"
            />
            <StatCard
              icon={TrendingUp}
              label="Views (30d)"
              value={data.views30.toLocaleString()}
              sub="Last 30 days"
              color="#27a644"
            />
            <StatCard
              icon={MessageSquare}
              label="Responses"
              value={data.responsesThisMonth.toLocaleString()}
              sub={data.responseLimit ? `Limit: ${data.responseLimit}/mo` : 'Unlimited'}
              color="#f59e0b"
            />
            <StatCard
              icon={Crown}
              label="Plan"
              value={data.isPremium ? 'Premium' : 'Free'}
              sub={data.isPremium && data.premiumUntil
                ? `Until ${new Date(data.premiumUntil).toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
                : data.isPremium ? 'Active' : 'Upgrade available'
              }
              color={data.isPremium ? '#f59e0b' : 'var(--fh-t4)'}
            />
          </div>

          {/* Views chart */}
          {data.viewsByDay.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>
                  Profile views — last 14 days
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>
                  Total: {data.viewsByDay.reduce((s, d) => s + d.count, 0)}
                </span>
              </div>
              <Sparkline data={data.viewsByDay} />
              {/* X-axis labels */}
              <div className="flex justify-between mt-1">
                {dayLabels
                  .filter((_, i) => i === 0 || i === Math.floor(dayLabels.length / 2) || i === dayLabels.length - 1)
                  .map((label, i) => (
                    <span key={i} style={{ fontSize: '10px', color: 'var(--fh-t4)' }}>{label}</span>
                  ))
                }
              </div>
            </div>
          )}

          {/* Response limit banner */}
          {!data.isPremium && data.responsesThisMonth >= 3 && (
            <div
              className="rounded-xl p-4 flex items-center justify-between gap-4"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <div className="flex items-start gap-3">
                <Crown className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '2px' }}>
                    Approaching response limit
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                    You&apos;ve used {data.responsesThisMonth} of {data.responseLimit} responses this month. Upgrade to send unlimited responses.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard?upgrade=1"
                className="flex-shrink-0 px-4 py-2 rounded-lg text-white text-xs font-medium"
                style={{ background: '#f59e0b' }}
              >
                Upgrade
              </Link>
            </div>
          )}

          {/* Verification status */}
          <div
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
          >
            <ShieldCheck
              className="h-5 w-5 flex-shrink-0"
              style={{ color: data.isVerified ? '#27a644' : 'var(--fh-t4)' }}
            />
            <div>
              <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>
                {data.isVerified
                  ? 'Verified freelancer'
                  : data.verificationRequested
                  ? 'Verification pending review'
                  : 'Not verified'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                {data.isVerified
                  ? 'Your profile shows a verified badge — this increases trust and response rate.'
                  : 'Verified profiles get 3× more responses on average.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
