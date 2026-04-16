import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import Script from 'next/script'
import NexusClient from './NexusClient'

export const metadata: Metadata = {
  title: 'NEXUS Mission Control — FreelanceHub',
  robots: { index: false, follow: false },
}

async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function NexusPage() {
  const user = await getSessionUser()
  const adminEmail = process.env.ADMIN_EMAIL
  if (!user || (adminEmail && user.email !== adminEmail)) {
    redirect('/auth/login')
  }

  return (
    <>
      {/* Telegram Mini App SDK — required for web_app button integration */}
      <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
      <NexusClient lang="ru" />
    </>
  )
}
