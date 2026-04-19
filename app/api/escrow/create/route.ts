// POST /api/escrow/create
// Opt an order into on-chain escrow. Returns the escrow id (bytes32),
// contract address, USDC token address, and amount in 6-decimal units.
// The client then sends two transactions from their wallet:
//   1. USDC.approve(escrow, amount)
//   2. Escrow.fund(id, freelancer, amount)
// After the fund tx is mined, the client calls /api/escrow/confirm.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getEscrowContract, orderIdToEscrowId, usdcToUnits, USDC_ADDRESS,
} from '@/lib/escrow-chain'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface OrderRow {
  id: string
  client_id: string
  status: string
  escrow_kind: string | null
  chain_escrow_id: string | null
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { address: contract, chainId } = getEscrowContract()
  if (!contract) {
    return NextResponse.json({ error: 'Escrow contract not configured' }, { status: 503 })
  }

  let body: { order_id?: string; freelancer_address?: string; amount_usdc?: number }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { order_id, freelancer_address, amount_usdc } = body
  if (!order_id || !freelancer_address || !amount_usdc) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!/^0x[0-9a-fA-F]{40}$/.test(freelancer_address)) {
    return NextResponse.json({ error: 'Bad freelancer address' }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any

  const { data: order } = await db
    .from('orders')
    .select('id, client_id, status, escrow_kind, chain_escrow_id')
    .eq('id', order_id)
    .maybeSingle() as { data: OrderRow | null }

  if (!order)                     return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.client_id !== user.id)return NextResponse.json({ error: 'Forbidden' },       { status: 403 })
  if (order.chain_escrow_id)      return NextResponse.json({ error: 'Already opted into on-chain escrow' }, { status: 409 })

  const escrowId   = orderIdToEscrowId(order.id)
  const amountUnits = usdcToUnits(amount_usdc).toString()

  await db.from('orders').update({
    escrow_kind:          'onchain',
    chain_id:             chainId,
    chain_escrow_id:      escrowId,
    chain_freelancer_addr: freelancer_address,
    chain_amount_usdc:    amount_usdc,
  }).eq('id', order.id)

  return NextResponse.json({
    escrow_id:   escrowId,
    contract,
    chain_id:    chainId,
    usdc_token:  USDC_ADDRESS[chainId],
    amount_units: amountUnits,
    amount_usdc,
    freelancer:  freelancer_address,
  })
}
