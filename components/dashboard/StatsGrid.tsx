import { Briefcase, Clock, DollarSign, Star } from 'lucide-react'
import type { FreelancerProfile } from './types'

export default function StatsGrid({ fp }: { fp: FreelancerProfile | null }) {
  const stats = [
    { label: 'Earned',      value: '0 ₸',                                   icon: DollarSign, color: 'text-green-400'  },
    { label: 'Orders',      value: String(fp?.completed_orders ?? 0),       icon: Briefcase,  color: 'text-blue-400'   },
    { label: 'Rating',      value: fp?.rating ? String(fp.rating) : '—',    icon: Star,       color: 'text-amber-400'  },
    { label: 'In progress', value: '0',                                     icon: Clock,      color: 'text-purple-400' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {stats.map((stat) => {
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
  )
}
