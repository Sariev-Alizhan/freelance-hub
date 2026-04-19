import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'
import { applyRateLimit, isValidUUID } from '@/lib/security'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

// POST /api/orders/notify
// Called fire-and-forget after a new order is created.
// Finds freelancers with matching category + Telegram connected, sends DMs.
export async function POST(req: Request) {
  try {
    // Auth + low rate limit — this fan-outs Telegram DMs to up to 100 users.
    const rl = applyRateLimit(req, 'orders:notify', { limit: 5, windowMs: 60_000 })
    if (rl) return rl

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId } = await req.json()
    if (!isValidUUID(orderId)) return Response.json({ error: 'Invalid orderId' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any

    // Fetch the new order — must belong to the caller.
    const { data: order } = await db
      .from('orders')
      .select('id, client_id, title, category, budget_min, budget_max, deadline, skills')
      .eq('id', orderId)
      .single()

    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
    if (order.client_id !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: rows } = await db
      .from('profiles')
      .select('telegram_chat_id, freelancer_profiles!inner(category)')
      .not('telegram_chat_id', 'is', null)
      .eq('freelancer_profiles.category', order.category)
      .limit(100)

    if (!rows || rows.length === 0) return Response.json({ sent: 0 })

    const budget = order.budget_max > 0
      ? `${Number(order.budget_min).toLocaleString('ru-RU')} – ${Number(order.budget_max).toLocaleString('ru-RU')} ₸`
      : 'Negotiable'

    const text =
      `🔔 <b>New order in your category!</b>\n\n` +
      `📋 <b>${order.title}</b>\n` +
      `💰 Budget: ${budget}\n` +
      `⏰ Deadline: ${order.deadline}\n\n` +
      `<a href="${SITE_URL}/orders/${order.id}">View & apply →</a>`

    let sent = 0
    for (const row of rows) {
      if (row.telegram_chat_id) {
        sendTelegramMessage(row.telegram_chat_id, text).catch(() => {})
        sent++
      }
    }

    return Response.json({ sent })
  } catch (e) {
    console.error('[orders/notify]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
