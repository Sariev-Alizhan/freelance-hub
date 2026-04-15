import { NextResponse } from 'next/server'

export const revalidate = 3600 // 1-hour ISR cache

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

    return NextResponse.json(
      { rates, updatedAt: data.time_last_update_utc, fallback: false },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600' } }
    )
  } catch {
    return NextResponse.json(
      { rates: FALLBACK, updatedAt: null, fallback: true },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }
}
