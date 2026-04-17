import Link from 'next/link'
import { Crown, Eye, Zap } from 'lucide-react'
import type { DashboardAnalytics } from './types'

/**
 * Freelancer-only analytics panel: view counts, a 30-day sparkline of
 * profile views, and a monthly response quota bar with a premium upsell
 * when the user is on the free plan.
 */
export default function AnalyticsTab({ analytics }: {
  analytics: DashboardAnalytics | null
}) {
  if (!analytics) return <div className="py-16 text-center text-muted-foreground text-sm">Loading analytics…</div>

  const data = analytics.viewsByDay ?? []
  const max = Math.max(...data.map(d => d.count), 1)
  const W = 300; const H = 60; const gap = data.length > 1 ? W / (data.length - 1) : W
  const pts = data.map((d, i) => `${i * gap},${H - (d.count / max) * H}`)
  const area = data.length > 1
    ? `M${pts.join(' L')} L${(data.length - 1) * gap},${H} L0,${H} Z`
    : ''

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Views (7d)',  value: analytics.views7,              icon: Eye },
          { label: 'Views (30d)', value: analytics.views30,             icon: Eye },
          { label: 'Responses',   value: analytics.responsesThisMonth,  icon: Zap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-border-2)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        ))}
      </div>

      {data.length > 1 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-border-2)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Profile views — last {data.length} days</span>
            <span className="text-xs font-semibold" style={{ color: 'var(--fh-primary)' }}>
              {data.reduce((s, d) => s + d.count, 0)} total
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '60px', overflow: 'visible' }}>
            <defs>
              <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--fh-primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--fh-primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {area && <path d={area} fill="url(#sparkGrad2)" />}
            <polyline points={pts.join(' ')} fill="none" stroke="var(--fh-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((d, i) => d.count > 0 && (
              <circle key={i} cx={i * gap} cy={H - (d.count / max) * H} r="3" fill="var(--fh-primary)" />
            ))}
          </svg>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground opacity-50">{data[0]?.day?.slice(5)}</span>
            <span className="text-xs text-muted-foreground opacity-50">{data[data.length - 1]?.day?.slice(5)}</span>
          </div>
        </div>
      )}

      {analytics.responseLimit !== null && (
        <div className="rounded-xl p-4" style={{ background: 'var(--fh-skill-bg)', border: '1px solid var(--fh-border-2)' }}>
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Monthly response limit</span>
            <span className="font-semibold">{analytics.responsesThisMonth} / {analytics.responseLimit}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--fh-border-2)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (analytics.responsesThisMonth / analytics.responseLimit) * 100)}%`,
                background: analytics.responsesThisMonth >= analytics.responseLimit ? '#ef4444' : 'var(--fh-primary)',
              }}
            />
          </div>
          {!analytics.isPremium && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Premium removes the limit.</p>
              <Link href="/premium" className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: 'var(--fh-primary-muted)', color: 'var(--fh-primary)', border: '1px solid var(--fh-primary)' }}>
                <Crown className="h-3 w-3 inline mr-1" />Upgrade
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
