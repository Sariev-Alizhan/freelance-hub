// POST /api/escrow/confirm
// Read on-chain state and reconcile with the DB. Idempotent — safe to retry.
// Body: { order_id, tx_hash } — tx_hash is the fund/release/refund transaction.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { readEscrow } from '@/lib/escrow-chain'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

interface OrderRow {
  id: string
  client_id: string
  chain_escrow_id: string | null
  chain_freelancer_addr: string | null
}

const KIND_REQUIRES_STATUS: Record<'fund' | 'release' | 'refund', 'Funded' | 'Released' | 'Refunded'> = {
  fund:    'Funded',
  release: 'Released',
  refund:  'Refunded',
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { order_id?: string; tx_hash?: string; kind?: 'fund' | 'release' | 'refund' }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { order_id, tx_hash, kind } = body
  if (!order_id || !tx_hash || !kind) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(tx_hash)) {
    return NextResponse.json({ error: 'Bad tx hash' }, { status: 400 })
  }
  if (!['fund', 'release', 'refund'].includes(kind)) {
    return NextResponse.json({ error: 'Bad kind' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: order } = await db
    .from('orders')
    .select('id, client_id, chain_escrow_id, chain_freelancer_addr')
    .eq('id', order_id)
    .maybeSingle() as { data: OrderRow | null }

  if (!order || !order.chain_escrow_id) {
    return NextResponse.json({ error: 'Not an on-chain order' }, { status: 404 })
  }

  // Only the client or the assigned freelancer may sync escrow state.
  // (Freelancer check requires mapping user → wallet; client check is direct.)
  const isClient = order.client_id === user.id
  if (!isClient) {
    const { data: resp } = await db
      .from('order_responses')
      .select('freelancer_id')
      .eq('order_id', order.id)
      .eq('status', 'accepted')
      .maybeSingle() as { data: { freelancer_id: string } | null }
    if (!resp || resp.freelancer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const onChain = await readEscrow(order.id)
  if (!onChain) return NextResponse.json({ error: 'Escrow read failed' }, { status: 502 })

  // CRITICAL: the DB escrow_status must reflect on-chain truth, not user input.
  // If the caller says "release" but the chain still shows "Funded", refuse.
  if (onChain.status !== KIND_REQUIRES_STATUS[kind]) {
    return NextResponse.json(
      { error: `On-chain status is ${onChain.status}, cannot mark as ${kind}` },
      { status: 409 },
    )
  }

  const update: Record<string, unknown> = {
    chain_client_address: onChain.client,
  }

  if (kind === 'fund') {
    update.chain_fund_tx    = tx_hash
    update.escrow_status    = 'funded'
    update.funded_at        = new Date().toISOString()
  } else if (kind === 'release') {
    update.chain_release_tx = tx_hash
    update.escrow_status    = 'released'
    update.released_at      = new Date().toISOString()
  } else if (kind === 'refund') {
    update.chain_refund_tx  = tx_hash
    update.escrow_status    = 'refunded'
  }

  await admin().from('orders').update(update).eq('id', order.id)

  return NextResponse.json({
    ok:     true,
    status: onChain.status,
    amount: onChain.amount.toString(),
  })
}
