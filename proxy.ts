import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rateLimit'

// Pages that require a logged-in session
const AUTH_PROTECTED = [
  '/dashboard',
  '/profile',
  '/onboarding',
  '/contracts',
  '/messages',
  '/ai-assistant',
  '/ai-resume',
  '/ai-search',
  '/premium',
]

// Pages that logged-in users should not see
const GUEST_ONLY = ['/auth/login', '/auth/register']

// Known scanner / attack tool user-agent fragments
const BAD_UA = [
  'sqlmap', 'nikto', 'masscan', 'nmap', 'dirsearch', 'gobuster',
  'wfuzz', 'burpsuite', 'zgrab', 'nuclei', 'hydra', 'libwww-perl',
]

// API paths that get tighter rate limits (30 req/min per IP)
const SENSITIVE_API_PREFIXES = ['/api/admin/', '/api/ai/', '/api/payments/']

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip           = getIp(request)
  const ua           = (request.headers.get('user-agent') || '').toLowerCase()

  // ── 1. Block known scanner user-agents ──────────────────────────────────
  if (BAD_UA.some(frag => ua.includes(frag))) {
    console.warn(JSON.stringify({ level: 'SECURITY', event: 'bad_ua', ip, ua: ua.slice(0, 100), path: pathname }))
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── 2. Block path traversal attempts ─────────────────────────────────────
  if (pathname.includes('..') || pathname.includes('%2e%2e') || pathname.includes('%252e')) {
    console.warn(JSON.stringify({ level: 'SECURITY', event: 'path_traversal', ip, path: pathname }))
    return new NextResponse('Forbidden', { status: 403 })
  }

  // ── 3. Reject oversized request bodies early ─────────────────────────────
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 65_536) {
    return new NextResponse(
      JSON.stringify({ error: 'Request body too large' }),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // ── 4. Sensitive API: 30 req/min per IP ──────────────────────────────────
  if (SENSITIVE_API_PREFIXES.some(p => pathname.startsWith(p))) {
    const rl = rateLimit(`sensitive:${ip}`, 30, 60_000)
    if (!rl.success) {
      console.warn(JSON.stringify({ level: 'SECURITY', event: 'sensitive_rate_limit', ip, path: pathname }))
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) } }
      )
    }
  }

  // ── 5. Global API rate limit: 120 req/min per IP ─────────────────────────
  if (pathname.startsWith('/api/')) {
    const rl = rateLimit(`global:${ip}`, 120, 60_000)
    if (!rl.success) {
      console.warn(JSON.stringify({ level: 'SECURITY', event: 'global_rate_limit', ip, path: pathname }))
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) } }
      )
    }
  }

  // ── 6. Auth session refresh (required for Server Components) ─────────────
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session token — required for Server Components to read auth state
  const { data: { user } } = await supabase.auth.getUser()

  // ── 7. Auth-protected routes: redirect to login if unauthenticated ────────
  const isProtected = AUTH_PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ── 8. Authenticated user visiting login/register → send to dashboard ─────
  const isGuestOnly = GUEST_ONLY.some(p => pathname.startsWith(p))
  if (isGuestOnly && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.searchParams.delete('next')
    return NextResponse.redirect(url)
  }

  // ── 9. Add security headers to all responses ──────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
