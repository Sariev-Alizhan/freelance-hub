'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SplashScreen from '@/components/layout/SplashScreen'

const SPLASH_MS = 1200

function WelcomeInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const raw = params.get('next') ?? '/feed'
    const next = /^\/[a-zA-Z0-9/_\-?=&#]*$/.test(raw) ? raw : '/feed'
    const t = setTimeout(() => router.replace(next), SPLASH_MS)
    return () => clearTimeout(t)
  }, [params, router])

  return <SplashScreen />
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<SplashScreen />}>
      <WelcomeInner />
    </Suspense>
  )
}
