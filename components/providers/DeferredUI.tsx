'use client'
import dynamic from 'next/dynamic'

// Non-critical UI deferred past first paint (browser-only, no SSR needed)
const InstallPrompt      = dynamic(() => import('@/components/shared/InstallPrompt'),      { ssr: false })
const UpdateNotification = dynamic(() => import('@/components/shared/UpdateNotification'), { ssr: false })
const OnboardingGuide    = dynamic(() => import('@/components/shared/OnboardingGuide'),    { ssr: false })
const PageProgress       = dynamic(() => import('@/components/shared/PageProgress'),       { ssr: false })

export default function DeferredUI() {
  return (
    <>
      <InstallPrompt />
      <UpdateNotification />
      <OnboardingGuide />
      <PageProgress />
    </>
  )
}
