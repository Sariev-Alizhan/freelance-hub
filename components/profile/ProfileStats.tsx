import Link from 'next/link'

export interface ProfileStatsProps {
  username:        string
  followersCount:  number
  followingCount:  number
  completedOrders?: number
  rating?:         number
  reviewsCount?:   number
  viewsWeek?:      number
  isFreelancer:    boolean
}

interface Stat {
  value: string | number
  label: string
  href?: string
}

export default function ProfileStats(p: ProfileStatsProps) {
  const stats: Stat[] = [
    { value: p.followersCount, label: 'followers', href: `/u/${p.username}/followers` },
    { value: p.followingCount, label: 'following', href: `/u/${p.username}/following` },
  ]
  if (p.isFreelancer) {
    stats.push({ value: p.completedOrders ?? 0, label: 'orders' })
    stats.push({
      value: (p.reviewsCount ?? 0) > 0 ? (p.rating?.toFixed(1) ?? '—') : '—',
      label: 'rating',
    })
  }
  if (typeof p.viewsWeek === 'number' && p.viewsWeek > 0) {
    stats.push({ value: p.viewsWeek, label: 'views / 7d' })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      background: 'var(--fh-surface)',
      border: '1px solid var(--fh-border-2)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {stats.map((s, i) => {
        const body = (
          <div style={{
            padding: '14px 8px', textAlign: 'center',
            borderLeft: i === 0 ? 'none' : '1px solid var(--fh-sep)',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fh-t4)', marginTop: 2, textTransform: 'lowercase' }}>
              {s.label}
            </div>
          </div>
        )
        return s.href
          ? <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>{body}</Link>
          : <div key={s.label}>{body}</div>
      })}
    </div>
  )
}
