import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  rating: number
  size?: 'sm' | 'md'
  showNumber?: boolean
  count?: number
}

export default function RatingStars({ rating, size = 'sm', showNumber = true, count }: Props) {
  const starSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(starSize, i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')}
          />
        ))}
      </div>
      {showNumber && (
        <span className={cn('font-semibold', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({count})
        </span>
      )}
    </div>
  )
}
