import { SkeletonDashboardOrder } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="page-shell page-shell--wide space-y-3">
      {[0, 1, 2].map(i => <SkeletonDashboardOrder key={i} />)}
    </div>
  )
}
