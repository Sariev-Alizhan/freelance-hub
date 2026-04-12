import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
      profiles!inner (full_name, username, avatar_url),
      freelancer_profiles (title, level, rating, completed_orders)
    `)
    .eq('order_id', id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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

  const newStatus = action === 'accept' ? 'accepted' : 'rejected'

  const { error } = await db
    .from('order_responses')
    .update({ status: newStatus })
    .eq('id', responseId)
    .eq('order_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If accepting a response, update order status to in_progress
  if (action === 'accept') {
    await db.from('orders')
      .update({ status: 'in_progress' })
      .eq('id', id)
  }

  return NextResponse.json({ ok: true })
}
