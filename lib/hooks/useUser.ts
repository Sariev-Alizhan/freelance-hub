'use client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

// Preserve the existing object when only a token refreshed — keeping the same
// reference stops downstream useCallback/useEffect deps from churning on every
// TOKEN_REFRESHED, which otherwise cascades into re-render loops in hook-heavy
// pages like the messenger.
function sameIdentity(a: User | null, b: User | null) {
  if (a === b) return true
  if (!a || !b) return false
  return a.id === b.id && a.email === b.email
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(prev => sameIdentity(prev, user) ? prev : user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null
      setUser(prev => sameIdentity(prev, next) ? prev : next)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
