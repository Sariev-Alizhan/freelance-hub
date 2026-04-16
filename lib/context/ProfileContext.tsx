'use client'
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/lib/hooks/useUser'

interface ProfileSnapshot {
  avatar_url:    string | null
  full_name:     string | null
  username:      string | null
  role:          'client' | 'freelancer'
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
      .select('avatar_url, full_name, username, role')
      .eq('id', user.id)
      .single()
    if (data) {
      const d = data as { avatar_url: string | null; full_name: string | null; username: string | null; role: 'client' | 'freelancer' }
      setProfile({ ...d, is_freelancer: d.role === 'freelancer' })
    }
  }, [user?.id])

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
