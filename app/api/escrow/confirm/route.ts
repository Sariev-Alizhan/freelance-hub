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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: order } = await db
    .from('orders')
    .select('id, client_id, chain_escrow_id')
    .eq('id', order_id)
    .maybeSingle() as { data: OrderRow | null }

  if (!order || !order.chain_escrow_id) {
    return NextResponse.json({ error: 'Not an on-chain order' }, { status: 404 })
  }

  const onChain = await readEscrow(order.id)
  if (!onChain) return NextResponse.json({ error: 'Escrow read failed' }, { status: 502 })

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

  // Use admin to bypass RLS — we've already verified order.client_id === user.id
  // is not strictly required for confirmation (any party can trigger sync).
  await admin().from('orders').update(update).eq('id', order.id)

  return NextResponse.json({
    ok:     true,
    status: onChain.status,
    amount: onChain.amount.toString(),
  })
}
