import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegramMessage } from '@/lib/telegram'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'

// POST /api/orders/notify
// Called fire-and-forget after a new order is created.
// Finds freelancers with matching category + Telegram connected, sends DMs.
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()
    if (!orderId) return Response.json({ error: 'Missing orderId' }, { status: 400 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any

    // Fetch the new order
    const { data: order } = await db
      .from('orders')
      .select('id, title, category, budget_min, budget_max, deadline, skills')
      .eq('id', orderId)
      .single()

    if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })

    // Find freelancers:
    //   - Have Telegram connected
    //   - Their freelancer_profile.category matches the order category
    // Limit 100 to avoid spamming on launch
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

    // Fire-and-forget all sends
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
