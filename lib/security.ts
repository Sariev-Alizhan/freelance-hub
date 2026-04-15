/**
 * Centralized security utilities for FreelanceHub
 * Covers: input sanitization, UUID validation, rate-limit helpers, CSRF checking
 */

import { rateLimit, getClientIp } from './rateLimit'

// ── Input sanitization ────────────────────────────────────────────────────────

const HTML_TAG_RE      = /<[^>]*>/g
const SCRIPT_RE        = /javascript\s*:/gi
const EVENT_ATTR_RE    = /\bon\w+\s*=/gi
const SQL_INJECT_RE    = /('|--|;|\/\*|\*\/|xp_|exec\s|drop\s|insert\s+into|select\s.*from|union\s+select)/gi
const NULL_BYTE_RE     = /\0/g

/**
 * Strip dangerous characters from user-supplied strings.
 * Does NOT encode for HTML output — do that at render time.
 */
export function sanitize(input: unknown, maxLen = 10_000): string {
  if (input === null || input === undefined) return ''
  const str = String(input).slice(0, maxLen)
  return str
    .replace(NULL_BYTE_RE, '')
    .replace(HTML_TAG_RE, '')
    .replace(SCRIPT_RE, '')
    .replace(EVENT_ATTR_RE, '')
    .trim()
}

/** Sanitize but keep newlines (for multi-line text areas) */
export function sanitizeText(input: unknown, maxLen = 5_000): string {
  if (input === null || input === undefined) return ''
  const str = String(input).slice(0, maxLen)
  return str
    .replace(NULL_BYTE_RE, '')
    .replace(HTML_TAG_RE, '')
    .replace(SCRIPT_RE, '')
    .replace(EVENT_ATTR_RE, '')
}

/** Detect SQL injection attempts (log them, don't crash) */
export function hasSQLInjection(input: string): boolean {
  return SQL_INJECT_RE.test(input)
}

// ── UUID validation ───────────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_RE.test(id)
}

/** Return 400 Response if UUID is invalid */
export function requireUUID(id: unknown): Response | null {
  if (!isValidUUID(id)) {
    return Response.json({ error: 'Invalid ID' }, { status: 400 })
  }
  return null
}

// ── Rate-limit helpers ────────────────────────────────────────────────────────

interface RLOptions {
  /** Requests allowed per window (default 30) */
  limit?: number
  /** Window size in ms (default 60 000 = 1 min) */
  windowMs?: number
}

/**
 * Apply rate limiting. Returns a 429 Response on breach, or null if OK.
 * Usage: const err = applyRateLimit(req, `ai:${user.id}`); if (err) return err;
 */
export function applyRateLimit(
  req: Request,
  prefix: string,
  opts: RLOptions = {}
): Response | null {
  const { limit = 30, windowMs = 60_000 } = opts
  const ip  = getClientIp(req)
  const key = `${prefix}:${ip}`
  const rl  = rateLimit(key, limit, windowMs)
  if (!rl.success) {
    return Response.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After':          String(rl.retryAfter),
          'X-RateLimit-Limit':    String(limit),
          'X-RateLimit-Remaining': '0',
        },
      }
    )
  }
  return null
}

// ── Body parsing with size guard ──────────────────────────────────────────────

/** Parse request JSON; return null if body exceeds maxBytes or is malformed */
export async function safeJson<T = unknown>(
  req: Request,
  maxBytes = 32_768 // 32 KB default
): Promise<T | null> {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxBytes) return null
  try {
    // Clone so the original body isn't consumed
    const text = await req.text()
    if (text.length > maxBytes) return null
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

// ── CSRF-like origin check (for state-changing routes) ────────────────────────

/**
 * For API routes that mutate state, ensure the request originates from our
 * own domain (not a foreign website using a logged-in user's cookies).
 * Returns a 403 Response if suspicious, null if OK.
 *
 * Works for same-site SameSite=Lax cookies as a belt-and-suspenders measure.
 */
export function checkOrigin(req: Request): Response | null {
  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''

  // Server-to-server calls (no origin header) → allow
  if (!origin && !referer) return null

  // Development → always allow
  const host = req.headers.get('host') || ''
  if (host.includes('localhost') || host.includes('127.0.0.1')) return null

  const allowed = [
    siteUrl,
    'https://freelance-hub.kz',
    'https://www.freelance-hub.kz',
  ].filter(Boolean)

  const check = origin || referer || ''
  const ok = allowed.some(u => check.startsWith(u))
  if (!ok) {
    console.warn(`[security] suspicious origin: ${check} on ${host}`)
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

// ── Suspicious UA detection ───────────────────────────────────────────────────

const BAD_UA_FRAGMENTS = [
  'sqlmap', 'nikto', 'masscan', 'nmap', 'dirsearch', 'gobuster',
  'wfuzz', 'burpsuite', 'zgrab', 'nuclei', 'hydra', 'curl/7.1',
  'python-requests/2.1', 'python-requests/2.2', 'libwww-perl',
  'scrapy', 'wget/', 'go-http-client/1.1',
]

export function isSuspiciousUA(req: Request): boolean {
  const ua = (req.headers.get('user-agent') || '').toLowerCase()
  return BAD_UA_FRAGMENTS.some(frag => ua.includes(frag))
}

// ── Security event logger ─────────────────────────────────────────────────────

type SecurityEvent =
  | 'rate_limit'
  | 'sql_injection'
  | 'bad_origin'
  | 'bad_ua'
  | 'unauthorized'
  | 'invalid_input'

export function logSecurityEvent(
  event: SecurityEvent,
  details: Record<string, unknown>,
  req?: Request
) {
  const ip = req ? getClientIp(req) : 'unknown'
  const ua = req ? (req.headers.get('user-agent') || '') : ''
  // Structured log — picked up by Vercel Log Drain / any log aggregator
  console.warn(
    JSON.stringify({
      level:     'SECURITY',
      event,
      ip,
      ua:        ua.slice(0, 120),
      timestamp: new Date().toISOString(),
      ...details,
    })
  )
}
