'use client'
import { useState, useEffect } from 'react'
import { Star, Send, CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  orderId: string
  orderTitle: string
  isClient: boolean
}

export default function OrderReviewPrompt({ orderId, orderTitle, isClient }: Props) {
  const [status, setStatus]     = useState<'loading' | 'pending' | 'done'>('loading')
  const [rating, setRating]     = useState(0)
  const [hover, setHover]       = useState(0)
  const [text, setText]         = useState('')
  const [submitting, setSubmit] = useState(false)
  const [myReview, setMyReview] = useState<{ rating: number; text: string } | null>(null)
  const [received, setReceived] = useState<{ rating: number; text: string; profiles: { full_name: string; avatar_url: string } } | null>(null)

  useEffect(() => {
    fetch(`/api/orders/${orderId}/review`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        setStatus(d.reviewed ? 'done' : 'pending')
        if (d.myReview) setMyReview(d.myReview)
        if (d.receivedReview) setReceived(d.receivedReview)
      })
      .catch(() => setStatus('pending'))
  }, [orderId])

  async function submit() {
    if (rating === 0 || text.trim().length < 10 || submitting) return
    setSubmit(true)
    try {
      const r = await fetch(`/api/orders/${orderId}/review`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ rating, text }),
      })
      if (r.ok) {
        const d = await r.json()
        setMyReview(d.review)
        setStatus('done')
      }
    } finally {
      setSubmit(false)
    }
  }

  if (status === 'loading') return null

  const target = isClient ? 'freelancer' : 'client'

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: status === 'done' ? 'rgba(39,166,68,0.04)' : 'rgba(113,112,255,0.04)',
        border: status === 'done' ? '1px solid rgba(39,166,68,0.15)' : '1px solid rgba(113,112,255,0.2)',
      }}
    >
      {status === 'done' ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span style={{ fontSize: '13px', fontWeight: 590, color: '#27a644' }}>Review submitted</span>
          </div>
          {myReview && (
            <div className="mb-3">
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="h-4 w-4" fill={s <= myReview.rating ? '#fbbf24' : 'none'} stroke={s <= myReview.rating ? '#fbbf24' : 'var(--fh-border-2)'} />
                ))}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6 }}>&ldquo;{myReview.text}&rdquo;</p>
            </div>
          )}
          {received && (
            <div
              className="mt-3 p-3 rounded-xl"
              style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)' }}
            >
              <p style={{ fontSize: '11px', color: 'var(--fh-t4)', marginBottom: '6px', fontWeight: 510 }}>
                REVIEW FROM {isClient ? 'FREELANCER' : 'CLIENT'}
              </p>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className="h-3.5 w-3.5" fill={s <= received.rating ? '#fbbf24' : 'none'} stroke={s <= received.rating ? '#fbbf24' : 'var(--fh-border-2)'} />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--fh-t3)', lineHeight: 1.6 }}>&ldquo;{received.text}&rdquo;</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '4px' }}>
            Rate the {target}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--fh-t4)', marginBottom: '16px', lineHeight: 1.5 }}>
            Share your experience working on &ldquo;{orderTitle}&rdquo;. Honest reviews help the community.
          </p>

          {/* Star picker */}
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className="h-7 w-7"
                  fill={(hover || rating) >= s ? '#fbbf24' : 'none'}
                  stroke={(hover || rating) >= s ? '#fbbf24' : 'var(--fh-border-2)'}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 self-center" style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}
              </span>
            )}
          </div>

          {/* Text */}
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Describe your experience with this ${target}... (min 10 characters)`}
            rows={3}
            maxLength={1000}
            className="w-full outline-none resize-none mb-3"
            style={{
              padding: '10px 14px', borderRadius: '10px', fontSize: '13px',
              background: 'var(--fh-surface)', border: '1px solid var(--fh-border-2)', color: 'var(--fh-t1)',
              lineHeight: 1.6,
            }}
          />
          <div className="flex items-center justify-between">
            <span style={{ fontSize: '11px', color: 'var(--fh-t4)' }}>{text.length}/1000</span>
            <button
              onClick={submit}
              disabled={rating === 0 || text.trim().length < 10 || submitting}
              className="flex items-center gap-1.5 transition-all disabled:opacity-40"
              style={{
                padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 590,
                background: '#5e6ad2', color: '#fff',
              }}
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Submit review
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
