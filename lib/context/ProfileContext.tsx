'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

interface ProfileSnapshot {
  avatar_url:    string | null
  full_name:     string | null
  username:      string | null
  role:          'client' | 'freelancer'
  active_mode:   'client' | 'freelancer' | 'auto'
  is_freelancer: boolean
}

interface ProfileContextValue {
  profile:        ProfileSnapshot | null
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue>({
  profile:        null,
  refreshProfile: async () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const userId = user?.id
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, full_name, username, role, active_mode')
      .eq('id', userId)
      .single()
    if (data) {
      const d = data as {
        avatar_url:  string | null
        full_name:   string | null
        username:    string | null
        role:        'client' | 'freelancer'
        active_mode: 'client' | 'freelancer' | 'auto' | null
      }
      const activeMode = d.active_mode ?? 'auto'
      const effectiveRole = activeMode === 'auto' ? d.role : activeMode
      setProfile({
        avatar_url:    d.avatar_url,
        full_name:     d.full_name,
        username:      d.username,
        role:          d.role,
        active_mode:   activeMode,
        is_freelancer: effectiveRole === 'freelancer',
      })
    }
  }, [userId])

  // Re-fetch whenever auth user changes (login / logout / navigation)
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const value = useMemo(
    () => ({ profile, refreshProfile: fetchProfile }),
    [profile, fetchProfile]
  )

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
