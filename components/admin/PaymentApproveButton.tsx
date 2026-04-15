'use client'
import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props {
  paymentId: string
  userId: string
}

export default function PaymentApproveButton({ paymentId, userId }: Props) {
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState<'approved' | 'rejected' | null>(null)

  async function act(approve: boolean) {
    setLoading(true)
    try {
      await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action:    approve ? 'approve_payment' : 'reject_payment',
          userId,
          paymentId,
        }),
      })
      setDone(approve ? 'approved' : 'rejected')
    } finally {
      setLoading(false)
    }
  }

  if (done === 'approved') return <span className="text-xs text-green-400 font-medium">Approved</span>
  if (done === 'rejected') return <span className="text-xs text-red-400 font-medium">Rejected</span>

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => act(true)}
        disabled={loading}
        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-50"
        style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}
      >
        <CheckCircle className="h-3 w-3" /> Approve
      </button>
      <button
        onClick={() => act(false)}
        disabled={loading}
        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-50"
        style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <XCircle className="h-3 w-3" /> Reject
      </button>
    </div>
  )
}
