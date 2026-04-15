/**
 * Simple in-memory rate limiter (sliding window).
 * Works per-process — good for single-instance / Vercel Functions.
 * For multi-instance deployments, replace the store with Upstash Redis.
 */

interface Entry { timestamps: number[] }

const store = new Map<string, Entry>()

// Clean up old entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.timestamps.length === 0 || now - entry.timestamps[entry.timestamps.length - 1] > 3_600_000) {
        store.delete(key)
      }
    }
  }, 300_000)
}

export interface RateLimitResult {
  success: boolean
  /** Remaining requests allowed in current window */
  remaining: number
  /** Seconds until the window resets */
  retryAfter: number
}

/**
 * @param key     Unique key (e.g. IP address or user ID)
 * @param limit   Max requests per window
 * @param windowMs Window size in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }

  // Remove timestamps outside the current window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0]
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
    store.set(key, entry)
    return { success: false, remaining: 0, retryAfter }
  }

  entry.timestamps.push(now)
  store.set(key, entry)

  return {
    success: true,
    remaining: limit - entry.timestamps.length,
    retryAfter: 0,
  }
}

/** Extract best-effort IP from Next.js request headers */
export function getClientIp(req: Request): string {
  const headers = new Headers((req as Request).headers)
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
