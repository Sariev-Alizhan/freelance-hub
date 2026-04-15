import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'
import { applyRateLimit, sanitizeText, isValidUUID } from '@/lib/security'

const STAR = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']

// POST /api/orders/[id]/review
// Bidirectional: client reviews freelancer, freelancer reviews client.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = applyRateLimit(req, 'review:post', { limit: 10, windowMs: 60_000 })
    if (rl) return rl

    const { id: orderId } = await params
    if (!isValidUUID(orderId)) return Response.json({ error: 'Invalid order ID' }, { status: 400 })

    const body = await req.json()
    const { rating } = body
    const text = sanitizeText(body?.text, 2000)

    if (!rating || rating < 1 || rating > 5) return Response.json({ error: 'Invalid rating' }, { status: 400 })
    if (!text.trim() || text.trim().length < 10) return Response.json({ error: 'Review too short (min 10 chars)' }, { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any

    // Fetch order
    const { data: order } = await admin
      .from('orders')
      .select('id, client_id, status, title')
      .eq('id', orderId)
      .single()

    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
    if (order.status !== 'completed') return Response.json({ error: 'Order not completed' }, { status: 400 })

    // Determine reviewer role and reviewee
    const isClient = order.client_id === user.id
    let revieweeId: string
    let role: 'client' | 'freelancer'

    if (isClient) {
      // Client reviewing freelancer — find accepted freelancer
      const { data: accepted } = await admin
        .from('order_responses')
        .select('freelancer_id')
        .eq('order_id', orderId)
        .eq('status', 'accepted')
        .maybeSingle()

      if (!accepted) return Response.json({ error: 'No accepted freelancer' }, { status: 400 })
      revieweeId = accepted.freelancer_id
      role = 'client'
    } else {
      // Freelancer reviewing client
      const { data: myResp } = await admin
        .from('order_responses')
        .select('id')
        .eq('order_id', orderId)
        .eq('freelancer_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle()

      if (!myResp) return Response.json({ error: 'Forbidden' }, { status: 403 })
      revieweeId = order.client_id
      role = 'freelancer'
    }

    // Insert review
    const { data: review, error } = await admin
      .from('order_reviews')
      .insert({ order_id: orderId, reviewer_id: user.id, reviewee_id: revieweeId, role, rating, text: text.trim().slice(0, 2000) })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return Response.json({ error: 'Already reviewed' }, { status: 409 })
      throw error
    }

    // Notify reviewee
    const { data: reviewer } = await admin.from('profiles').select('full_name').eq('id', user.id).single()
    const reviewerName = reviewer?.full_name || 'Someone'

    await admin.from('notifications').insert({
      user_id: revieweeId,
      type:    'review',
      title:   `New review ${STAR[rating]}`,
      body:    `${reviewerName}: "${text.trim().slice(0, 80)}${text.trim().length > 80 ? '…' : ''}"`,
      link:    `/orders/${orderId}`,
    })

    // Telegram notification (best-effort)
    const { data: telegramProfile } = await admin
      .from('profiles')
      .select('telegram_chat_id')
      .eq('id', revieweeId)
      .single()

    if (telegramProfile?.telegram_chat_id) {
      sendTelegramMessage(
        telegramProfile.telegram_chat_id,
        `${STAR[rating]} <b>New review!</b>\n\n${reviewerName} reviewed your work on "${order.title}":\n\n"${text.trim()}"`,
      ).catch(() => {})
    }

    return Response.json({ success: true, review })
  } catch (e) {
    console.error('[order/review]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}

// GET /api/orders/[id]/review — check if current user has already reviewed
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ reviewed: false })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data } = await admin
      .from('order_reviews')
      .select('id, rating, text, role')
      .eq('order_id', orderId)
      .eq('reviewer_id', user.id)
      .maybeSingle()

    // Also fetch the other side's review (for current user as reviewee)
    const { data: receivedReview } = await admin
      .from('order_reviews')
      .select('rating, text, role, reviewer_id, profiles!reviewer_id(full_name, avatar_url)')
      .eq('order_id', orderId)
      .eq('reviewee_id', user.id)
      .maybeSingle()

    return Response.json({ reviewed: !!data, myReview: data, receivedReview })
  } catch (e) {
    console.error('[order/review GET]', e)
    return Response.json({ reviewed: false })
  }
}
