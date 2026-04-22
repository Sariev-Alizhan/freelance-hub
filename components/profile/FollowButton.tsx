'use client'
import { useState, useEffect } from 'react'
import { UserPlus, UserCheck, Heart } from 'lucide-react'
import { useUser } from '@/lib/hooks/useUser'
import { useToastHelpers } from '@/lib/context/ToastContext'

interface FollowState {
  iFollow:   boolean
  followsMe: boolean
  friends:   boolean
}

/** One-way follow with auto "Friends" label when mutual. */
export default function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useUser()
  const { success, error: err } = useToastHelpers()
  const [state,   setState]   = useState<FollowState>({ iFollow: false, followsMe: false, friends: false })
  const [loading, setLoading] = useState(true)
  const [busy,    setBusy]    = useState(false)

  useEffect(() => {
    if (!user || user.id === targetUserId) { setLoading(false); return }
    fetch(`/api/follows?user_id=${targetUserId}`)
      .then(r => r.json())
      .then(d => {
        setState({ iFollow: !!d.iFollow, followsMe: !!d.followsMe, friends: !!d.friends })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, targetUserId])

  if (!user || user.id === targetUserId || loading) return null

  async function follow() {
    setBusy(true)
    const prev = state
    setState(s => ({ ...s, iFollow: true, friends: s.followsMe }))
    const res = await fetch('/api/follows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: targetUserId }),
    })
    if (!res.ok) { setState(prev); err('Could not follow') }
    else success(prev.followsMe ? 'You are now friends!' : 'Following')
    setBusy(false)
  }

  async function unfollow() {
    setBusy(true)
    const prev = state
    setState(s => ({ ...s, iFollow: false, friends: false }))
    const res = await fetch(`/api/follows?user_id=${targetUserId}`, { method: 'DELETE' })
    if (!res.ok) { setState(prev); err('Could not unfollow') }
    else success('Unfollowed')
    setBusy(false)
  }

  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '10px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 510,
    cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.6 : 1, border: 'none',
    transition: 'opacity 0.15s, background 0.15s', width: '100%',
  }

  if (!state.iFollow) return (
    <button onClick={follow} disabled={busy}
      style={{ ...base, background: '#27a644', color: '#fff' }}>
      <UserPlus className="h-4 w-4" />
      {state.followsMe ? 'Follow back' : 'Follow'}
    </button>
  )

  if (state.friends) return (
    <button onClick={unfollow} disabled={busy}
      style={{ ...base, background: 'rgba(39,166,68,0.08)', color: '#27a644', border: '1px solid rgba(39,166,68,0.2)' }}>
      <Heart className="h-4 w-4" /> Friends
    </button>
  )

  return (
    <button onClick={unfollow} disabled={busy}
      style={{ ...base, background: 'var(--fh-surface-2)', color: 'var(--fh-t2)', border: '1px solid var(--fh-border)' }}>
      <UserCheck className="h-4 w-4" /> Following
    </button>
  )
}
