'use client'
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react'
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

// SINGLE shared auth subscription for the whole app.
//
// Previously useUser() ran a fresh getUser() + onAuthStateChange in every
// component that consumed it. On a profile page that's ~13 client components
// (Header, BottomNav, LeftSidebar, NotificationBell, ProfilePosts,
// FollowButton, etc.) — each acquiring the @supabase/gotrue-js auth lock
// concurrently. That triggered "Lock not released within 5000ms" warnings,
// stolen-lock errors, and on flaky timing a React #310 "rendered different
// hooks" crash via the Profile error boundary.
//
// AuthProvider hoists the subscription to the root layout; consumers now read
// from context — no more parallel lock contention.
interface AuthState { user: User | null; loading: boolean }
const AuthContext = createContext<AuthState>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initialised = useRef(false)

  useEffect(() => {
    // StrictMode in dev double-mounts effects; guard so we don't double-subscribe.
    if (initialised.current) return
    initialised.current = true

    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(prev => sameIdentity(prev, user) ? prev : user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null
      setUser(prev => sameIdentity(prev, next) ? prev : next)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  return useContext(AuthContext)
}
