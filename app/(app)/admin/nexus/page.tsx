import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Script from 'next/script'
import { getSessionUser } from '@/lib/auth/getSessionUser'
import NexusClient from './NexusClient'

export const metadata: Metadata = {
  title: 'NEXUS Mission Control — FreelanceHub',
  robots: { index: false, follow: false },
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
