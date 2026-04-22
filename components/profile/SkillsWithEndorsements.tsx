'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Check } from 'lucide-react'

/** Renders skills as pills with a +N endorsement counter.
 *  Logged-in viewers (not the owner) can click to endorse. */
export default function SkillsWithEndorsements({
  skills, targetUserId, isOwnProfile,
}: {
  skills: string[]; targetUserId: string; isOwnProfile: boolean
}) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [mine,   setMine]   = useState<Record<string, boolean>>({})
  const [busy,   setBusy]   = useState<string | null>(null)

  const load = useCallback(() => {
    fetch(`/api/endorsements?user_id=${targetUserId}`)
      .then(r => r.json())
      .then(d => {
        if (d?.ok) {
          setCounts(d.counts ?? {})
          setMine(d.mine ?? {})
        }
      })
      .catch(() => {})
  }, [targetUserId])

  useEffect(() => { load() }, [load])

  async function toggle(skill: string) {
    if (isOwnProfile) return
    if (busy) return
    setBusy(skill)
    const currentlyMine = !!mine[skill]

    // Optimistic
    setMine(prev => ({ ...prev, [skill]: !currentlyMine }))
    setCounts(prev => ({
      ...prev,
      [skill]: Math.max(0, (prev[skill] ?? 0) + (currentlyMine ? -1 : 1)),
    }))

    try {
      await fetch('/api/endorsements', {
        method: currentlyMine ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: targetUserId, skill }),
      })
    } catch {
      // rollback
      load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {skills.map(s => {
        const n = counts[s] ?? 0
        const endorsed = !!mine[s]
        const clickable = !isOwnProfile
        return (
          <button
            key={s}
            onClick={() => toggle(s)}
            disabled={!clickable}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 4px 5px 12px', borderRadius: 6,
              fontSize: 12, fontWeight: 510,
              background: endorsed ? 'rgba(39,166,68,0.18)' : 'rgba(39,166,68,0.08)',
              color: endorsed ? '#27a644' : '#27a644',
              border: `1px solid ${endorsed ? 'rgba(39,166,68,0.4)' : 'rgba(39,166,68,0.18)'}`,
              cursor: clickable ? 'pointer' : 'default',
              opacity: busy === s ? 0.6 : 1,
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            {s}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              padding: '1px 6px 1px 4px', borderRadius: 4,
              background: endorsed ? 'rgba(39,166,68,0.22)' : 'rgba(255,255,255,0.05)',
              fontSize: 11, fontWeight: 700, minWidth: 20,
            }}>
              {endorsed
                ? <Check style={{ width: 10, height: 10 }} />
                : <Plus style={{ width: 10, height: 10, opacity: clickable ? 0.7 : 0.3 }} />
              }
              {n}
            </span>
          </button>
        )
      })}
    </div>
  )
}
