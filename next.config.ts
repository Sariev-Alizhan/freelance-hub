import type { NextConfig } from 'next'

// Derive Supabase host from env var so switching to a custom domain
// (e.g. api.freelance-hub.kz) requires only updating NEXT_PUBLIC_SUPABASE_URL.
const SUPABASE_URL  = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkvmxtwpgvubwtcalzjm.supabase.co').trim()
const SUPABASE_HOST = SUPABASE_URL.replace(/^https?:\/\//, '')

/**
 * Content Security Policy
 * - default-src 'self' blocks everything not explicitly allowed
 * - script-src: Next.js inline scripts need 'unsafe-inline' in dev; in prod we'd use nonces
 * - connect-src: Supabase, Anthropic AI, Telegram, push services
 * - img-src: allows data URIs + known image CDNs
 */
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://telegram.org`,  // unsafe-eval needed by Next.js dev HMR
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

const SECURITY_HEADERS = [
  // Note: CSP is now set per-request with a nonce by proxy.ts (overrides this)
  // This static fallback is kept for API routes and static assets not handled by proxy
  { key: 'Content-Security-Policy', value: CSP },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // Legacy XSS filter (belt-and-suspenders)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Only send origin in Referer header for cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=(), payment=()' },
  // Force HTTPS for 2 years (only effective in production)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Prevent cross-origin data leaks
  { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' }, // allow CDN images
]

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // `standalone` bundles a minimal node_modules under .next/standalone so the
  // Docker image can run with `node server.js` — no package manager needed.
  // Vercel ignores this flag and builds normally.
  output: 'standalone',
  // Strip all console.log calls in production builds (keep error + warn for monitoring)
  compiler: process.env.NODE_ENV === 'production'
    ? { removeConsole: { exclude: ['error', 'warn'] } }
    : {},
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: SUPABASE_HOST },
      // OAuth providers — Google, GitHub, Twitter, Discord avatars
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'cdn.discordapp.com' },
    ],
  },
  async headers() {
    return [
      {
        // Security headers on every response
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
      {
        // HTML pages — never cache in browser
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ]
  },
}

export default nextConfig
