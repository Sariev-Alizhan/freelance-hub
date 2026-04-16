'use client'
import { useState, useEffect } from 'react'
import { UserPlus, UserCheck, UserX, Clock } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useToastHelpers } from '@/lib/context/ToastContext'

interface FriendStatus {
  status: 'none' | 'pending' | 'accepted' | 'declined'
  id?: string
  isMine?: boolean
}

export default function FriendButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useUser()
  const { success, error: err } = useToastHelpers()
  const [fs,      setFs]      = useState<FriendStatus>({ status: 'none' })
  const [loading, setLoading] = useState(true)
  const [busy,    setBusy]    = useState(false)

  useEffect(() => {
    if (!user || user.id === targetUserId) { setLoading(false); return }
    fetch(`/api/friends?user_id=${targetUserId}`)
      .then(r => r.json())
      .then(d => { setFs(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, targetUserId])

  if (!user || user.id === targetUserId || loading) return null

  async function sendRequest() {
    setBusy(true)
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addressee: targetUserId }),
    })
    const data = await res.json()
    if (data.id) { setFs({ status: 'pending', id: data.id, isMine: true }); success('Friend request sent!') }
    else err('Could not send request')
    setBusy(false)
  }

  async function accept() {
    if (!fs.id) return
    setBusy(true)
    await fetch('/api/friends', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fs.id, status: 'accepted' }),
    })
    setFs(p => ({ ...p, status: 'accepted' }))
    success('You are now friends!')
    setBusy(false)
  }

  async function remove() {
    setBusy(true)
    await fetch(`/api/friends?user_id=${targetUserId}`, { method: 'DELETE' })
    setFs({ status: 'none' })
    success('Removed')
    setBusy(false)
  }

  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 510,
    cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.6 : 1, border: 'none',
    transition: 'opacity 0.15s', width: '100%',
  }

  if (fs.status === 'none') return (
    <button onClick={sendRequest} disabled={busy}
      style={{ ...base, background: 'rgba(113,112,255,0.1)', color: '#7170ff', border: '1px solid rgba(113,112,255,0.25)' }}>
      <UserPlus className="h-4 w-4" /> Add friend
    </button>
  )

  if (fs.status === 'pending' && fs.isMine) return (
    <button onClick={remove} disabled={busy}
      style={{ ...base, background: 'var(--fh-surface-2)', color: 'var(--fh-t3)', border: '1px solid var(--fh-border)' }}>
      <Clock className="h-4 w-4" /> Request sent · Cancel
    </button>
  )

  if (fs.status === 'pending' && !fs.isMine) return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={accept} disabled={busy}
        style={{ ...base, background: '#5e6ad2', color: '#fff', flex: 1 }}>
        <UserCheck className="h-4 w-4" /> Accept
      </button>
      <button onClick={remove} disabled={busy}
        style={{ ...base, background: 'var(--fh-surface-2)', color: 'var(--fh-t3)', border: '1px solid var(--fh-border)', width: 'auto', padding: '10px 14px' }}>
        <UserX className="h-4 w-4" />
      </button>
    </div>
  )

  if (fs.status === 'accepted') return (
    <button onClick={remove} disabled={busy}
      style={{ ...base, background: 'rgba(39,166,68,0.08)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
      <UserCheck className="h-4 w-4" /> Friends · Remove
    </button>
  )

  return null
}
