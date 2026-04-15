import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, emailNewResponse } from '@/lib/email'
import { notifyClientNewResponse } from '@/lib/telegram'
import { applyRateLimit, sanitizeText, isValidUUID } from '@/lib/security'

export async function POST(request: Request) {
  const rl = applyRateLimit(request, 'respond', { limit: 10, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const orderId       = body?.orderId
  const rawMessage    = body?.message
  const proposedPrice = body?.proposedPrice

  if (!orderId || !isValidUUID(orderId)) {
    return Response.json({ error: 'Invalid order ID' }, { status: 400 })
  }

  const message = sanitizeText(rawMessage, 3000)
  if (!message.trim()) {
    return Response.json({ error: 'Message is required' }, { status: 400 })
  }
  if (message.length > 3000) {
    return Response.json({ error: 'Message too long (max 3000 chars)' }, { status: 400 })
  }
  const parsedPrice = proposedPrice != null ? parseInt(proposedPrice) : null
  if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 100_000_000)) {
    return Response.json({ error: 'Invalid proposed price' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // ── Fetch order to validate ownership + status ─────────────────────────────
  const { data: order } = await db
    .from('orders')
    .select('client_id, status')
    .eq('id', orderId)
    .single()

  if (!order) {
    return Response.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.client_id === user.id) {
    return Response.json({ error: 'You cannot apply to your own order' }, { status: 403 })
  }
  if (order.status !== 'open') {
    return Response.json({ error: 'This order is no longer accepting applications' }, { status: 409 })
  }

  // ── Duplicate check ─────────────────────────────────────────────────────────
  const { data: existing } = await db
    .from('order_responses')
    .select('id, status')
    .eq('order_id', orderId)
    .eq('freelancer_id', user.id)
    .maybeSingle()

  if (existing) {
    const msg = existing.status === 'accepted'
      ? 'Your application was already accepted'
      : existing.status === 'rejected'
      ? 'Your application was not selected for this order'
      : 'You have already applied to this order'
    return Response.json({ error: msg }, { status: 409 })
  }

  // ── Response limit check (5/month for free users) ──────────────────────────
  const { data: fp } = await db
    .from('freelancer_profiles')
    .select('is_premium, premium_until')
    .eq('user_id', user.id)
    .single()

  const isPremium = fp?.is_premium && (!fp.premium_until || new Date(fp.premium_until) > new Date())

  if (!isPremium) {
    const { data: limitCount } = await db.rpc('responses_this_month', { uid: user.id })
    if ((limitCount ?? 0) >= 5) {
      return Response.json(
        { error: 'Достигнут лимит откликов (5 в месяц). Перейдите на Premium для безлимитных откликов.' },
        { status: 429 }
      )
    }
  }

  // Insert the response
  const { data: responseData, error: insertError } = await db
    .from('order_responses')
    .insert({
      order_id: orderId,
      freelancer_id: user.id,
      message: message.trim(),
      proposed_price: proposedPrice ? parseInt(proposedPrice) : null,
    })
    .select()
    .single()

  if (insertError) {
    return Response.json({ error: insertError.message }, { status: 400 })
  }

  // Increment responses_count on the order
  await db.rpc('increment_responses_count', { order_id: orderId })

  // Fetch order title + client_id for email notification
  const { data: orderInfo } = await db
    .from('orders')
    .select('title, client_id')
    .eq('id', orderId)
    .single()

  // Get freelancer name from profile
  const { data: freelancerProfile } = await db
    .from('profiles')
    .select('full_name, username')
    .eq('id', user.id)
    .single()

  const freelancerName =
    freelancerProfile?.full_name ||
    freelancerProfile?.username ||
    user.email?.split('@')[0] ||
    'Фрилансер'

  // Notify order owner + send email (best-effort)
  if (orderInfo?.client_id) {
    try {
      const admin = createAdminClient()
      const adminDb = admin as any

      // In-app notification
      await adminDb.from('notifications').insert({
        user_id:    orderInfo.client_id,
        type:       'new_response',
        title:      `New application: ${orderInfo.title}`,
        body:       `${freelancerName} applied to your order`,
        link:       `/orders/${orderId}`,
      })

      // Email
      const { data: clientAuthUser } = await admin.auth.admin.getUserById(orderInfo.client_id)
      const clientEmail = clientAuthUser?.user?.email
      if (clientEmail && orderInfo.title) {
        await sendEmail(
          clientEmail,
          `Новый отклик на заказ: ${orderInfo.title}`,
          emailNewResponse({ orderTitle: orderInfo.title, freelancerName, orderId })
        )
      }

      // Telegram
      const { data: clientTg } = await adminDb
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', orderInfo.client_id)
        .single()
      if (clientTg?.telegram_chat_id && orderInfo.title) {
        notifyClientNewResponse({
          chatId:        clientTg.telegram_chat_id,
          orderTitle:    orderInfo.title,
          orderId,
          freelancerName,
        }).catch(() => {})
      }

      // Web Push
      const pushSecret = process.env.PUSH_INTERNAL_SECRET
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      if (pushSecret) {
        fetch(`${siteUrl}/api/push/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: pushSecret,
            userId: orderInfo.client_id,
            title: `New application: ${orderInfo.title}`,
            body: `${freelancerName} applied to your order`,
            link: `/orders/${orderId}`,
          }),
        }).catch(() => {})
      }
    } catch (e) {
      console.error('[respond] notify error:', e)
    }
  }

  return Response.json({ response: responseData })
}
