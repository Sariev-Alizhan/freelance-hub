import Link from 'next/link'
import { CheckCircle, Sparkles, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * Right-sidebar card showing profile completion %. Renders a skeleton
 * while the profile is loading, otherwise a progress bar + checklist +
 * "Complete profile" / "AI Resume Builder" CTA pair.
 */
export default function CompletionCard({ loading, items, pct }: {
  loading: boolean
  items: { label: string; done: boolean }[]
  pct: number
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-subtle bg-card p-5 space-y-3">
        <div className="flex justify-between"><Skeleton className="h-4 w-36" /><Skeleton className="h-4 w-10" /></div>
        <Skeleton className="h-2 rounded-full" />
        {[0,1,2,3,4].map(i => <div key={i} className="flex items-center gap-2"><Skeleton className="h-3.5 w-3.5 rounded-full" /><Skeleton className="h-3 w-28" /></div>)}
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-subtle bg-card p-5">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold">Profile completion</span>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-green-400' : 'text-primary'}`}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface overflow-hidden mb-4">
        <div className={`h-full rounded-full transition-all duration-700 ${pct === 100 ? 'bg-green-400' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
      </div>
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-2 text-xs py-1">
          <CheckCircle className={`h-3.5 w-3.5 flex-shrink-0 ${item.done ? 'text-green-400' : 'text-muted-foreground'}`} />
          <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
        </div>
      ))}
      {pct < 100 ? (
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
  )
}
