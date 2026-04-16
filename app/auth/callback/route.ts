import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Always redirect to production, never to localhost
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz').trim()

export async function GET(request: Request & { cookies?: { getAll(): { name: string; value: string }[] } }) {
  const url    = new URL(request.url)
  const code   = url.searchParams.get('code')
  // Validate `next` to prevent open-redirect: must be a relative path starting with /
  const rawNext = url.searchParams.get('next') ?? '/dashboard'
  const next    = /^\/[a-zA-Z0-9/_\-?=&#]*$/.test(rawNext) ? rawNext : '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${SITE_URL}/auth/login?error=auth_failed`)
  }

  // ── Build the redirect response FIRST, then set cookies ON IT ────────────
  // Critical: cookies() from next/headers does NOT propagate to a new NextResponse
  // object. We must use response.cookies.set() directly so the auth tokens
  // survive the redirect to /dashboard.
  const redirectResponse = NextResponse.redirect(`${SITE_URL}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    {
      cookies: {
        getAll() {
          return request.cookies?.getAll() ?? []
        },
        setAll(cookiesToSet) {
          // Write auth cookies directly onto the redirect response
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, {
              ...options,
              // Ensure cookies are accessible from the browser for SSR refresh
              sameSite: options?.sameSite ?? 'lax',
              httpOnly: options?.httpOnly ?? true,
              secure:   process.env.NODE_ENV === 'production',
              path:     options?.path ?? '/',
            })
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
    return NextResponse.redirect(`${SITE_URL}/auth/login?error=auth_failed`)
  }

  // ── Session established — check if new user needs onboarding ─────────────
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any
    const { data: profile } = await db
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single()

    const metaAvatar = user.user_metadata?.avatar_url as string | undefined
    const metaName   = user.user_metadata?.full_name  as string | undefined

    // Sync OAuth avatar + name into profiles if not yet set
    const needsSync = (metaAvatar && !profile?.avatar_url) || (metaName && !profile?.full_name)
    if (needsSync) {
      await db.from('profiles').upsert(
        {
          id:         user.id,
          ...(metaAvatar && !profile?.avatar_url && { avatar_url: metaAvatar }),
          ...(metaName   && !profile?.full_name  && { full_name:  metaName  }),
        },
        { onConflict: 'id' }
      )
    }

    // Claim referral if ref cookie present (best-effort, non-blocking)
    const cookieStore = await cookies()
    const refCode = cookieStore.get('ref')?.value
    if (refCode) {
      fetch(`${SITE_URL}/api/referrals/claim`, {
        method:  'POST',
        headers: { Cookie: `ref=${refCode}` },
      }).catch(() => {})
    }

    // New user with no name at all → onboarding
    if (!profile?.full_name && !metaName) {
      const onboardingResponse = NextResponse.redirect(`${SITE_URL}/onboarding`)
      // Copy auth cookies to the onboarding redirect too
      redirectResponse.cookies.getAll().forEach(c => {
        onboardingResponse.cookies.set(c.name, c.value, {
          sameSite: 'lax',
          httpOnly: true,
          secure:   process.env.NODE_ENV === 'production',
          path:     '/',
        })
      })
      return onboardingResponse
    }
  }

  return redirectResponse
}
