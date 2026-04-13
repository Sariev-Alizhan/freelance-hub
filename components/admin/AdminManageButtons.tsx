'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, Crown, ShieldOff } from 'lucide-react'

interface Props {
  userId: string
  mode: 'verify' | 'premium'
  isActive?: boolean
}

export default function AdminManageButtons({ userId, mode, isActive }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function act(action: string) {
    setLoading(true)
    try {
      await fetch('/api/admin/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId }),
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return <span className="text-xs text-green-400">Готово</span>
  }

  if (mode === 'verify') {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => act('verify')}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{ background: 'rgba(39,166,68,0.1)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}
        >
          <CheckCircle className="h-3 w-3" /> Подтвердить
        </button>
        <button
          onClick={() => act('reject_verification')}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <XCircle className="h-3 w-3" /> Отклонить
        </button>
      </div>
    )
  }

  // premium mode
  return (
    <div className="flex items-center gap-1.5">
      {!isActive ? (
        <button
          onClick={() => act('grant_premium')}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{ background: 'rgba(94,106,210,0.1)', color: '#5e6ad2', border: '1px solid rgba(94,106,210,0.2)' }}
        >
          <Crown className="h-3 w-3" /> Выдать Premium
        </button>
      ) : (
        <button
          onClick={() => act('revoke_premium')}
          disabled={loading}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
        >
          <ShieldOff className="h-3 w-3" /> Отозвать
        </button>
      )}
    </div>
  )
}
