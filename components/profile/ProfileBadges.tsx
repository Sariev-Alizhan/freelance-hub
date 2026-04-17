import {
  CheckCircle, Crown, Sparkles, Zap, Trophy, Package,
} from 'lucide-react'

export interface ProfileBadgesProps {
  isVerified?:     boolean
  isPremium?:      boolean
  rating?:         number
  reviewsCount?:   number
  completedOrders?:number
  responseTime?:   string
  availability?:   string
  isFreelancer:    boolean
}

interface Badge {
  icon: React.ElementType
  label: string
  color: string
  tint: string
}

export default function ProfileBadges(p: ProfileBadgesProps) {
  const badges: Badge[] = []

  if (p.isVerified) {
    badges.push({ icon: CheckCircle, label: 'Verified', color: '#5e6ad2', tint: 'rgba(94,106,210,0.1)' })
  }
  if (p.isPremium) {
    badges.push({ icon: Crown, label: 'Premium', color: '#fbbf24', tint: 'rgba(251,191,36,0.12)' })
  }
  if (p.isFreelancer && (p.rating ?? 0) >= 4.8 && (p.reviewsCount ?? 0) >= 10) {
    badges.push({ icon: Trophy, label: 'Top Rated', color: '#f59e0b', tint: 'rgba(245,158,11,0.12)' })
  }
  if (p.isFreelancer && (p.completedOrders ?? 0) >= 10) {
    badges.push({ icon: Package, label: `${p.completedOrders}+ orders`, color: '#27a644', tint: 'rgba(39,166,68,0.1)' })
  }
  if (p.isFreelancer && /min|час|hour/i.test(p.responseTime ?? '')) {
    badges.push({ icon: Zap, label: 'Fast reply', color: '#a855f7', tint: 'rgba(168,85,247,0.1)' })
  }
  if (p.isFreelancer && p.availability === 'open') {
    badges.push({ icon: Sparkles, label: 'Open to work', color: '#27a644', tint: 'rgba(39,166,68,0.1)' })
  }

  if (badges.length === 0) return null

  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto',
      scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
      paddingBottom: 2,
    }}>
      {badges.map(b => {
        const Icon = b.icon
        return (
          <div key={b.label} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 99,
            background: b.tint, color: b.color,
            border: `1px solid ${b.color}30`,
            fontSize: 12, fontWeight: 590, whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            <Icon style={{ width: 14, height: 14 }} />
            {b.label}
          </div>
        )
      })}
    </div>
  )
}
