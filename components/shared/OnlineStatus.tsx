import { cn } from '@/lib/utils'

interface Props {
  isOnline: boolean
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export default function OnlineStatus({ isOnline, showLabel = true, size = 'sm' }: Props) {
  const dotSize = size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5'
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn(dotSize, 'rounded-full', isOnline ? 'bg-green-500 pulse-green' : 'bg-muted-foreground')} />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}
