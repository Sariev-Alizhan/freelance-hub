/**
 * Distributed rate limiter — sliding window.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 * env vars are set. Falls back to in-memory store (single-instance) otherwise.
 *
 * To enable Redis: add the two env vars in Vercel Dashboard → Settings → Environment Variables.
 * Get them from console.upstash.com → create a Redis database → REST API.
 */
import { Redis }      from '@upstash/redis'
import { Ratelimit }  from '@upstash/ratelimit'

export interface RateLimitResult {
  success:    boolean
  remaining:  number
  retryAfter: number
}

// ── Upstash Redis (distributed) ───────────────────────────────────────────
let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// Cache Ratelimit instances so we don't create a new one per call
const limiters = new Map<string, Ratelimit>()

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`
  if (!limiters.has(cacheKey)) {
    limiters.set(cacheKey, new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${Math.floor(windowMs / 1000)} s`),
      analytics: true,
    }))
  }
  return limiters.get(cacheKey)!
}

// ── In-memory fallback ────────────────────────────────────────────────────
interface Entry { timestamps: number[] }
const store = new Map<string, Entry>()

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (!entry.timestamps.length || now - entry.timestamps.at(-1)! > 3_600_000) {
        store.delete(key)
      }
    }
  }, 300_000)
}

function memoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now   = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs)

  if (entry.timestamps.length >= limit) {
    const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000)
    store.set(key, entry)
    return { success: false, remaining: 0, retryAfter }
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return { success: true, remaining: limit - entry.timestamps.length, retryAfter: 0 }
}

// ── Public API ────────────────────────────────────────────────────────────
/**
 * Rate-limit a key.  Automatically uses Redis when configured.
 *
 * @param key     Unique string (e.g. `global:${ip}` or `sensitive:${ip}`)
 * @param limit   Max requests allowed in the window
 * @param windowMs Window length in milliseconds
 */
export async function rateLimitAsync(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (redis) {
    try {
      const limiter = getUpstashLimiter(limit, windowMs)
      const { success, remaining, reset } = await limiter.limit(key)
      const retryAfter = success ? 0 : Math.max(0, Math.ceil((reset - Date.now()) / 1000))
      return { success, remaining, retryAfter }
    } catch {
      // Redis unreachable → fall through to in-memory
    }
  }
  return memoryRateLimit(key, limit, windowMs)
}

/**
 * Synchronous rate-limit (in-memory only — use when you can't await).
 * Falls back gracefully; prefer rateLimitAsync in proxy/middleware.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  return memoryRateLimit(key, limit, windowMs)
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
