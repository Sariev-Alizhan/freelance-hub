'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, MessageSquare, LogIn } from 'lucide-react'
import LeaveReviewModal from '@/components/shared/LeaveReviewModal'
import RatingStars from '@/components/shared/RatingStars'

interface DBReview {
  id: string
  reviewer_name: string
  reviewer_avatar: string | null
  rating: number
  text: string
  created_at: string
}

interface MockReview {
  id: string
  authorName: string
  authorAvatar: string
  rating: number
  text: string
  date: string
  orderTitle: string
}

interface Props {
  freelancerId: string
  freelancerName: string
  mockReviews?: MockReview[]
  isLoggedIn: boolean
}

function ReviewCard({ name, avatar, rating, text, date }: {
  name: string; avatar?: string | null; rating: number; text: string; date: string
}) {
  return (
    <div className="pb-4 border-b border-subtle last:border-0 last:pb-0">
      <div className="flex items-center gap-3 mb-2">
        {avatar ? (
          <Image src={avatar} alt={name} width={36} height={36} className="rounded-full shrink-0" unoptimized />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-sm font-bold">
            {name[0]}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <RatingStars rating={rating} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  )
}

export default function ReviewsSection({ freelancerId, freelancerName, mockReviews = [], isLoggedIn }: Props) {
  const [dbReviews, setDbReviews]     = useState<DBReview[]>([])
  const [loading, setLoading]         = useState(true)
  const [showModal, setShowModal]     = useState(false)

  useEffect(() => {
    fetch(`/api/reviews/${freelancerId}`)
      .then((r) => r.json())
      .then(({ reviews }) => setDbReviews(reviews ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [freelancerId])

  function handleNewReview(review: DBReview) {
    setDbReviews((prev) => [review, ...prev])
  }

  const totalCount = dbReviews.length + mockReviews.length
  const avgRating = totalCount > 0
    ? (
        (dbReviews.reduce((s, r) => s + r.rating, 0) +
          mockReviews.reduce((s, r) => s + r.rating, 0)) /
        totalCount
      ).toFixed(1)
    : null

  return (
    <div className="rounded-2xl border border-subtle bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">
          Reviews {totalCount > 0 && <span className="text-muted-foreground font-normal">({totalCount})</span>}
          {avgRating && (
            <span className="ml-2 text-amber-400 text-sm font-bold">★ {avgRating}</span>
          )}
        </h2>
        {isLoggedIn ? (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 transition-colors"
          >
            <Star className="h-3.5 w-3.5" />
            Leave a review
          </button>
        ) : (
          <a
            href="/auth/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-subtle text-muted-foreground text-xs font-medium hover:bg-subtle transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            Sign in to leave a review
          </a>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-9 w-9 rounded-full bg-subtle shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-subtle rounded" />
                <div className="h-3 w-full bg-subtle rounded" />
                <div className="h-3 w-2/3 bg-subtle rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground">Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dbReviews.map((r) => (
            <ReviewCard key={r.id} name={r.reviewer_name} avatar={r.reviewer_avatar} rating={r.rating} text={r.text} date={r.created_at} />
          ))}
          {mockReviews.map((r) => (
            <ReviewCard key={r.id} name={r.authorName} avatar={r.authorAvatar} rating={r.rating} text={r.text} date={r.date} />
          ))}
        </div>
      )}

      {showModal && (
        <LeaveReviewModal
          freelancerId={freelancerId}
          freelancerName={freelancerName}
          onClose={() => setShowModal(false)}
          onSuccess={handleNewReview}
        />
      )}
    </div>
  )
}
