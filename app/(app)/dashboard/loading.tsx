import { SkeletonProfileHeader, SkeletonStats } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="page-shell page-shell--wide space-y-8">
      <SkeletonProfileHeader />
      <SkeletonStats />
    </div>
  )
}
