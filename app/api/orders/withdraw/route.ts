import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/orders/withdraw
 * Body: { responseId: string }
 * Withdraws a pending application. Only the freelancer who submitted it can withdraw it.
 */
export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { responseId } = await request.json()
  if (!responseId) return Response.json({ error: 'Missing responseId' }, { status: 400 })

  const db = supabase as any

  // Only allow withdrawing pending responses
  const { data: existing } = await db
    .from('order_responses')
    .select('id, freelancer_id, status, order_id')
    .eq('id', responseId)
    .single()

  if (!existing) return Response.json({ error: 'Not found' }, { status: 404 })
  if (existing.freelancer_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 })
  if (existing.status !== 'pending') return Response.json({ error: 'Only pending applications can be withdrawn' }, { status: 400 })

  const { error } = await db
    .from('order_responses')
    .delete()
    .eq('id', responseId)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Decrement responses_count (best-effort)
  try {
    const { data: ord } = await db
      .from('orders')
      .select('responses_count')
      .eq('id', existing.order_id)
      .single()
    if (ord && ord.responses_count > 0) {
      await db.from('orders')
        .update({ responses_count: ord.responses_count - 1 })
        .eq('id', existing.order_id)
    }
  } catch { /* ignore */ }

  return Response.json({ ok: true })
}
