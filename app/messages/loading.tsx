import { Skeleton } from '@/components/ui/Skeleton'

export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-subtle flex flex-col flex-shrink-0">
        <div className="px-4 pt-4 pb-3 border-b border-subtle">
          <Skeleton className="h-6 w-28 mb-3" />
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
        <div className="flex-1 p-3 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        <div className="h-[57px] border-b border-subtle px-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-1 p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-64' : 'w-48'}`} />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-subtle">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
