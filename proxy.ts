import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimitAsync } from '@/lib/rateLimit'

const SUPABASE_URL  = (process.env.NEXT_PUBLIC_SUPABASE_URL  || '').trim()
const SUPABASE_HOST = SUPABASE_URL.replace(/^https?:\/\//, '')

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://va.vercel-scripts.com`,
    `style-src 'self' 'unsafe-inline'`,
    `font-src 'self' data:`,
    `img-src 'self' data: blob: https://api.dicebear.com https://picsum.photos https://images.unsplash.com ${SUPABASE_URL} https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://pbs.twimg.com https://cdn.discordapp.com`,
    `connect-src 'self' ${SUPABASE_URL} wss://${SUPABASE_HOST} https://api.anthropic.com https://openrouter.ai https://api.telegram.org https://fcm.googleapis.com https://hn.algolia.com https://open.er-api.com https://vitals.vercel-insights.com https://va.vercel-scripts.com`,
    `media-src 'self' ${SUPABASE_URL}`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ')
}

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

  // Generate per-request nonce for CSP (only for HTML pages, not API/assets)
  const isHtmlRequest = !pathname.startsWith('/api/') && !pathname.startsWith('/_next/')
  const nonce = isHtmlRequest ? Buffer.from(crypto.randomUUID()).toString('base64') : ''

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
    const rl = await rateLimitAsync(`sensitive:${ip}`, 30, 60_000)
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
    const rl = await rateLimitAsync(`global:${ip}`, 120, 60_000)
    if (!rl.success) {
      console.warn(JSON.stringify({ level: 'SECURITY', event: 'global_rate_limit', ip, path: pathname }))
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rl.retryAfter) } }
      )
    }
  }

  // ── 6. Auth session refresh (required for Server Components) ─────────────
  // Inject x-nonce into request headers so Server Components can read it
  const requestHeaders = new Headers(request.headers)
  if (nonce) requestHeaders.set('x-nonce', nonce)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

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

  // ── 10. Inject nonce-based CSP (overrides next.config.ts static CSP) ──────
  if (nonce) {
    response.headers.set('Content-Security-Policy', buildCsp(nonce))
  }

  return response
}

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
