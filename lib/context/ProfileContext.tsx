'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

interface ProfileSnapshot {
  avatar_url:  string | null
  full_name:   string | null
  username:    string | null
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
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, full_name, username, is_freelancer')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data as ProfileSnapshot)
  }, [user?.id])

  // Re-fetch whenever auth user changes (login / logout / navigation)
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <ProfileContext.Provider value={{ profile, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
