/**
 * POST /api/push/send
 * Internal route — отправляет Web Push уведомление пользователю.
 * Защищён PUSH_INTERNAL_SECRET (только server-side вызовы).
 *
 * Body: { secret, userId, title, body, link? }
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Lazy-init: setVapidDetails throws when keys aren't set, which would break
// `next build` page-data collection on environments that don't use push.
let vapidReady: boolean | null = null
function ensureVapid(): boolean {
  if (vapidReady !== null) return vapidReady
  const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const priv = process.env.VAPID_PRIVATE_KEY
  if (!pub || !priv) { vapidReady = false; return false }
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL ?? 'admin@freelance-hub.kz'}`,
    pub,
    priv,
  )
  vapidReady = true
  return true
}

export async function POST(req: NextRequest) {
  if (!ensureVapid()) return NextResponse.json({ error: 'Push not configured' }, { status: 503 })

  const secret = process.env.PUSH_INTERNAL_SECRET
  if (!secret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const body = await req.json()
  if (body.secret !== secret) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, title, body: msgBody, link } = body
  if (!userId || !title) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('endpoint,p256dh,auth')
    .eq('user_id', userId)

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({ title, body: msgBody, link: link ?? '/' })
  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      ).catch(async (err) => {
        // 410 Gone = subscription expired, clean up
        if (err.statusCode === 410) {
          await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        throw err
      })
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, sent, total: subs.length })
}
