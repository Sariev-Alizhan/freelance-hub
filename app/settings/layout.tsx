import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsMobileNav, SettingsSidebar } from './SettingsNav'

export const metadata = { title: 'Settings — FreelanceHub' }

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/settings')

  return (
    <div style={{ background: 'var(--fh-canvas)', minHeight: 'calc(100vh - 52px)' }}>
      <div
        className="mx-auto max-w-4xl px-4"
        style={{ paddingTop: '32px', paddingBottom: '72px' }}
      >
        <SettingsMobileNav />
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          <SettingsSidebar />
          <main style={{ flex: 1, minWidth: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
