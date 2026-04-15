import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyFreelancerAccepted, notifyFreelancerRejected } from '@/lib/telegram'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  // Only the order owner can see responses
  const { data: order } = await db
    .from('orders')
    .select('client_id')
    .eq('id', id)
    .single()

  if (!order || order.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await db
    .from('order_responses')
    .select(`
      id, message, proposed_price, status, created_at,
      profiles!inner (id, full_name, username, avatar_url),
      freelancer_profiles (title, level, rating, completed_orders)
    `)
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 })

  return NextResponse.json({ responses: data ?? [] })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { responseId, action } = await req.json()
  if (!responseId || !['accept', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: order } = await db
    .from('orders')
    .select('client_id')
    .eq('id', id)
    .single()

  if (!order || order.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent accepting when order already has an accepted response
  if (action === 'accept') {
    const { data: alreadyAccepted } = await db
      .from('order_responses')
      .select('id')
      .eq('order_id', id)
      .eq('status', 'accepted')
      .maybeSingle()

    if (alreadyAccepted) {
      return NextResponse.json({ error: 'An application has already been accepted for this order' }, { status: 409 })
    }
  }

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'

  const { error } = await db
    .from('order_responses')
    .update({ status: newStatus })
    .eq('id', responseId)
    .eq('order_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify the accepted/rejected freelancer + auto-reject all other pending on accept
  try {
    const { data: resp } = await db
      .from('order_responses')
      .select('freelancer_id')
      .eq('id', responseId)
      .single()

    const { data: orderInfo } = await db
      .from('orders')
      .select('title')
      .eq('id', id)
      .single()

    const admin = createAdminClient()
    const adminDb = admin as any

    if (resp?.freelancer_id && orderInfo?.title) {
      await adminDb.from('notifications').insert({
        user_id: resp.freelancer_id,
        type:    action === 'accept' ? 'order_accepted' : 'order_rejected',
        title:   action === 'accept' ? 'Application accepted!' : 'Application declined',
        body:    action === 'accept'
          ? `Your application for "${orderInfo.title}" was accepted. Get in touch with the client.`
          : `Your application for "${orderInfo.title}" was not selected this time.`,
        link:    `/orders/${id}`,
      })

      // Telegram notification to the freelancer
      const { data: freelancerTg } = await adminDb
        .from('profiles')
        .select('telegram_chat_id')
        .eq('id', resp.freelancer_id)
        .single()
      if (freelancerTg?.telegram_chat_id) {
        const notify = action === 'accept' ? notifyFreelancerAccepted : notifyFreelancerRejected
        notify({ chatId: freelancerTg.telegram_chat_id, orderTitle: orderInfo.title, orderId: id }).catch(() => {})
      }
    }

    // On accept: update order to in_progress + auto-reject all other pending responses
    if (action === 'accept' && orderInfo?.title) {
      await db.from('orders').update({ status: 'in_progress' }).eq('id', id)

      // Fetch other pending responses for bulk-reject
      const { data: others } = await db
        .from('order_responses')
        .select('id, freelancer_id')
        .eq('order_id', id)
        .eq('status', 'pending')
        .neq('id', responseId)

      if (others && others.length > 0) {
        const otherIds = others.map((r: { id: string }) => r.id)

        // Mark them all rejected
        await db
          .from('order_responses')
          .update({ status: 'rejected' })
          .in('id', otherIds)

        // Send rejection notifications (fire and forget, best-effort)
        const notifs = others.map((r: { id: string; freelancer_id: string }) => ({
          user_id: r.freelancer_id,
          type:    'order_rejected',
          title:   'Application declined',
          body:    `Your application for "${orderInfo.title}" was not selected this time.`,
          link:    `/orders/${id}`,
        }))
        adminDb.from('notifications').insert(notifs).then(() => {}).catch(() => {})
      }
    }
  } catch (e) {
    console.error('[responses/patch] notify error:', e)
    // Still update order status on accept even if notifications fail
    if (action === 'accept') {
      await db.from('orders').update({ status: 'in_progress' }).eq('id', id).catch(() => {})
    }
  }

  return NextResponse.json({ ok: true })
}
