'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

let initialized = false

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!KEY || initialized) return
    posthog.init(KEY, {
      api_host: HOST,
      person_profiles: 'identified_only',
      capture_pageview: false,
      capture_pageleave: true,
      session_recording: { maskAllInputs: true },
      autocapture: true,
      loaded: () => { initialized = true },
    })
    initialized = true
  }, [])

  useEffect(() => {
    if (!KEY || !initialized) return
    const url = window.location.origin + pathname + (searchParams?.toString() ? `?${searchParams}` : '')
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return <>{children}</>
}

export { posthog }
