/**
 * POST /api/payments/card
 * User submits a card-transfer payment receipt.
 *
 * Multipart form fields:
 *   plan       – 'monthly' | 'quarterly' | 'annual'
 *   screenshot – image file (jpg/png/webp, max 10 MB)
 *
 * Server actions:
 *   1. Validate auth + input
 *   2. Upload screenshot to Supabase Storage "payment-receipts"
 *   3. Send photo to admin Telegram with user info + amount
 *   4. Insert payment record (status: 'pending_card')
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rateLimit'

const PLAN_AMOUNTS: Record<string, number> = {
  monthly:   2000,
  quarterly: 4800,
  annual:    14400,
}

const PLAN_LABELS: Record<string, string> = {
  monthly:   'Monthly (₸2 000/мес)',
  quarterly: '3 months (₸4 800 total)',
  annual:    'Annual (₸14 400 total)',
}

async function sendTelegramPhoto(
  imageBytes: ArrayBuffer,
  mimeType: string,
  caption: string,
): Promise<void> {
  const token  = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) {
    console.warn('[card-payment] Telegram not configured — skipping notify')
    return
  }

  const form = new FormData()
  form.append('chat_id', chatId)
  form.append('photo', new Blob([imageBytes], { type: mimeType }), 'receipt.jpg')
  form.append('caption', caption)
  form.append('parse_mode', 'HTML')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[card-payment] Telegram error:', err)
  }
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ── Rate limit: max 3 submissions per 24 h per user ───────────────────────
  const rl = rateLimit(`card-payment:${user.id}`, 3, 86_400_000)
  if (!rl.success) {
    return NextResponse.json(
      { error: 'Слишком много заявок. Попробуйте завтра.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  // ── Parse multipart form ──────────────────────────────────────────────────
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const plan       = String(form.get('plan') ?? '')
  const screenshot = form.get('screenshot') as File | null

  if (!PLAN_AMOUNTS[plan]) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }
  if (!screenshot) {
    return NextResponse.json({ error: 'Screenshot required' }, { status: 400 })
  }
  if (!screenshot.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 })
  }
  if (screenshot.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
  }

  const amount = PLAN_AMOUNTS[plan]
  const bytes  = await screenshot.arrayBuffer()
  // Derive extension from MIME type (ignore filename — it could be spoofed)
  const MIME_EXT: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/jpg': 'jpg',
    'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  }
  const ext = MIME_EXT[screenshot.type] ?? 'jpg'
  const ts     = Date.now()
  const storagePath = `${user.id}/${ts}.${ext}`

  // ── Upload to Supabase Storage ────────────────────────────────────────────
  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { error: uploadErr } = await admin.storage
    .from('payment-receipts')
    .upload(storagePath, bytes, { contentType: screenshot.type, upsert: false })

  if (uploadErr) {
    console.error('[card-payment] storage upload error:', uploadErr.message)
    // Don't fail — Telegram + DB record are more important
  }

  // ── Get user display name ─────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminDb = admin as any
  const { data: profile } = await adminDb
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'Unknown'

  // ── Send Telegram notification ────────────────────────────────────────────
  const caption =
    `💳 <b>Новый платёж на Premium!</b>\n\n` +
    `👤 ${displayName}\n` +
    `📧 ${user.email ?? '—'}\n` +
    `📦 Тариф: <b>${PLAN_LABELS[plan]}</b>\n` +
    `💰 Сумма: <b>₸${amount.toLocaleString('ru')}</b>\n` +
    `🆔 User ID: <code>${user.id}</code>\n\n` +
    `✅ Подтвердить: /admin → Pending Payments`

  try {
    await sendTelegramPhoto(bytes, screenshot.type, caption)
  } catch (e) {
    console.error('[card-payment] telegram send error:', e)
  }

  // ── Insert payment record ─────────────────────────────────────────────────
  const { error: dbErr } = await adminDb
    .from('payments')
    .insert({
      user_id:        user.id,
      type:           'premium',
      amount_kzt:     amount,
      status:         'pending_card',
      kaspi_order_id: `card_${plan}`,
    })

  if (dbErr) {
    console.error('[card-payment] DB insert error:', dbErr.message)
    return NextResponse.json({ error: 'Failed to save payment' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
