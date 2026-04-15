import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Always redirect to production, never to localhost
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  // Validate `next` to prevent open-redirect: must be a relative path starting with /
  const rawNext = url.searchParams.get('next') ?? '/dashboard'
  const next = /^\/[a-zA-Z0-9/_-]*$/.test(rawNext) ? rawNext : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if this is a new user (no full_name set yet)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const db = supabase as any
        const { data: profile } = await db
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        // Claim referral if ref cookie present (best-effort, non-blocking)
        const cookieStore = await cookies()
        const refCode = cookieStore.get('ref')?.value
        if (refCode) {
          fetch(`${SITE_URL}/api/referrals/claim`, {
            method: 'POST',
            headers: { Cookie: `ref=${refCode}` },
          }).catch(() => {})
        }

        if (!profile?.full_name) {
          return NextResponse.redirect(`${SITE_URL}/onboarding`)
        }
      }
      return NextResponse.redirect(`${SITE_URL}${next}`)
    }
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  return NextResponse.redirect(`${SITE_URL}/auth/login?error=auth_failed`)
}
