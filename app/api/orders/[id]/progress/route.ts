import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['not_started', 'in_progress', 'review', 'done']

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { progress_status } = await req.json()

    if (!VALID_STATUSES.includes(progress_status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createAdminClient() as any

    // Fetch order to check ownership
    const { data: order } = await db
      .from('orders')
      .select('client_id, status')
      .eq('id', id)
      .single()

    if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
    if (order.status !== 'in_progress') {
      return Response.json({ error: 'Order is not in progress' }, { status: 400 })
    }

    const isOwner = order.client_id === user.id

    if (!isOwner) {
      // Must be the accepted freelancer
      const { data: accepted } = await db
        .from('order_responses')
        .select('id')
        .eq('order_id', id)
        .eq('freelancer_id', user.id)
        .eq('status', 'accepted')
        .maybeSingle()

      if (!accepted) return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update progress
    await db.from('orders').update({ progress_status }).eq('id', id)

    // Notify the other party
    const LABELS: Record<string, string> = {
      not_started: 'Not started',
      in_progress: 'In progress',
      review:      'Review',
      done:        'Done',
    }

    // Find who to notify: client notifies freelancer and vice-versa
    const notifyUserId = isOwner
      ? (await db
          .from('order_responses')
          .select('freelancer_id')
          .eq('order_id', id)
          .eq('status', 'accepted')
          .maybeSingle()
        ).data?.freelancer_id
      : order.client_id

    if (notifyUserId) {
      await db.from('notifications').insert({
        user_id: notifyUserId,
        type:    'progress',
        title:   `Progress updated: ${LABELS[progress_status]}`,
        body:    `The order progress was moved to "${LABELS[progress_status]}".`,
        link:    `/orders/${id}`,
      })
    }

    return Response.json({ success: true, progress_status })
  } catch (e) {
    console.error('[orders/progress]', e)
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
