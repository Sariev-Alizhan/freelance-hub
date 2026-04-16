import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1-hour ISR cache

// Module-level in-memory cache — survives across requests within the same instance
let cachedRates: Record<string, number> | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

// Fallback rates relative to RUB (April 2026 snapshot)
const FALLBACK: Record<string, number> = {
  RUB:  1,
  KZT:  5.85,
  UAH:  0.41,
  USD:  0.0109,
  EUR:  0.0101,
  GBP:  0.0086,
  USDT: 0.0109,
  CNY:  0.079,
  AED:  0.040,
  TRY:  0.375,
}

export async function GET() {
  // Serve from in-memory cache if still fresh
  if (cachedRates && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      { rates: cachedRates, updatedAt: new Date(cacheTimestamp).toUTCString(), fallback: false, cached: true },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600' } }
    )
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/RUB', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    if (data.result !== 'success') throw new Error('bad result')

    const rates: Record<string, number> = { RUB: 1 }
    for (const c of Object.keys(FALLBACK)) {
      rates[c] = c === 'USDT' ? (data.rates.USD ?? FALLBACK.USD) : (data.rates[c] ?? FALLBACK[c])
    }

    // Populate module-level cache
    cachedRates = rates
    cacheTimestamp = Date.now()

    return NextResponse.json(
      { rates, updatedAt: data.time_last_update_utc, fallback: false },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600' } }
    )
  } catch {
    // On error, serve stale in-memory cache if available
    if (cachedRates) {
      return NextResponse.json(
        { rates: cachedRates, updatedAt: new Date(cacheTimestamp).toUTCString(), fallback: false, cached: true, stale: true },
        { headers: { 'Cache-Control': 'public, max-age=300' } }
      )
    }
    return NextResponse.json(
      { rates: FALLBACK, updatedAt: null, fallback: true },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }
}
