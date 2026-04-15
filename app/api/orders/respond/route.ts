import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, emailNewResponse } from '@/lib/email'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { orderId, message, proposedPrice } = await request.json()

  if (!orderId || !message?.trim()) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (typeof message !== 'string' || message.trim().length > 3000) {
    return Response.json({ error: 'Message too long (max 3000 chars)' }, { status: 400 })
  }
  const parsedPrice = proposedPrice != null ? parseInt(proposedPrice) : null
  if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0 || parsedPrice > 100_000_000)) {
    return Response.json({ error: 'Invalid proposed price' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

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

  // Fetch order + client_id for email notification
  const { data: order } = await db
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
  if (order?.client_id) {
    try {
      const admin = createAdminClient()
      const adminDb = admin as any

      // In-app notification
      await adminDb.from('notifications').insert({
        user_id:    order.client_id,
        type:       'new_response',
        title:      `New application: ${order.title}`,
        body:       `${freelancerName} applied to your order`,
        link:       `/orders/${orderId}`,
      })

      // Email
      const { data: clientAuthUser } = await admin.auth.admin.getUserById(order.client_id)
      const clientEmail = clientAuthUser?.user?.email
      if (clientEmail && order.title) {
        await sendEmail(
          clientEmail,
          `Новый отклик на заказ: ${order.title}`,
          emailNewResponse({ orderTitle: order.title, freelancerName, orderId })
        )
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
            userId: order.client_id,
            title: `New application: ${order.title}`,
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
