import { SkeletonProfileHeader, SkeletonStats } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SkeletonProfileHeader />
      <SkeletonStats />
    </div>
  )
}
