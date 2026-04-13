'use client'
import { useState } from 'react'
import { X, Star, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  freelancerId: string
  freelancerName: string
  onClose: () => void
  onSuccess: (review: { id: string; reviewer_name: string; reviewer_avatar: string | null; rating: number; text: string; created_at: string }) => void
}

export default function LeaveReviewModal({ freelancerId, freelancerName, onClose, onSuccess }: Props) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [done, setDone]       = useState(false)

  async function submit() {
    if (rating === 0 || !text.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId, rating, text }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Error'); return }
      setDone(true)
      onSuccess(json.review)
      setTimeout(onClose, 1800)
    } catch {
      setError('Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  const LABELS = ['', 'Poor', 'Below average', 'Okay', 'Good', 'Excellent!']

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-subtle bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="font-semibold text-lg">Review published!</p>
            <p className="text-sm text-muted-foreground">Thank you for your feedback</p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-1">Leave a review</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Share your experience working with <span className="font-medium text-foreground">{freelancerName}</span>
            </p>

            {/* Star picker */}
            <div className="mb-5">
              <div className="flex items-center gap-1 mb-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className="h-8 w-8 transition-colors"
                      fill={(hover || rating) >= n ? '#FBBF24' : 'transparent'}
                      stroke={(hover || rating) >= n ? '#FBBF24' : 'currentColor'}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground h-4">
                {LABELS[hover || rating]}
              </p>
            </div>

            {/* Text */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about the quality, deadlines, communication…"
              className="w-full min-h-[110px] resize-none px-3 py-2.5 rounded-xl bg-subtle border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors mb-4"
            />

            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

            <button
              onClick={submit}
              disabled={loading || rating === 0 || !text.trim()}
              className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish review
            </button>
          </>
        )}
      </div>
    </div>
  )
}
