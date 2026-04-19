'use client'
import { useState } from 'react'
import { encodeFunctionData, parseAbi } from 'viem'
import { Loader2, Check, AlertCircle, Wallet } from 'lucide-react'

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

interface Props {
  orderId:           string
  freelancerAddress: string
  amountUsdc:        number
  onFunded?:        (txHash: string) => void
}

type Phase = 'idle' | 'connecting' | 'creating' | 'approving' | 'funding' | 'confirming' | 'done' | 'error'

const USDC_ABI = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
])
const ESCROW_ABI = parseAbi([
  'function fund(bytes32 id, address freelancer, uint96 amount)',
])

export default function FundEscrow({ orderId, freelancerAddress, amountUsdc, onFunded }: Props) {
  const [phase, setPhase]   = useState<Phase>('idle')
  const [error, setError]   = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')

  async function run() {
    setError(''); setTxHash('')
    try {
      const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum
      if (!eth) throw new Error('No wallet detected. Install MetaMask, Rabby, or Coinbase Wallet.')

      setPhase('connecting')
      const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
      const from = accounts[0]
      if (!from) throw new Error('No account returned')

      setPhase('creating')
      const createRes = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id:           orderId,
          freelancer_address: freelancerAddress,
          amount_usdc:        amountUsdc,
        }),
      })
      const created = await createRes.json()
      if (!createRes.ok) throw new Error(created.error ?? 'Create failed')

      const { escrow_id, contract, usdc_token, amount_units, chain_id } = created
      const amountBig = BigInt(amount_units)

      const chainIdHex = '0x' + Number(chain_id).toString(16)
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainIdHex }],
        })
      } catch { /* user may already be on correct chain */ }

      setPhase('approving')
      const approveData = encodeFunctionData({
        abi: USDC_ABI, functionName: 'approve',
        args: [contract as `0x${string}`, amountBig],
      })
      const approveTx = await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: usdc_token, data: approveData }],
      }) as string
      await waitForTx(eth, approveTx)

      setPhase('funding')
      const fundData = encodeFunctionData({
        abi: ESCROW_ABI, functionName: 'fund',
        args: [escrow_id as `0x${string}`, freelancerAddress as `0x${string}`, amountBig],
      })
      const fundTx = await eth.request({
        method: 'eth_sendTransaction',
        params: [{ from, to: contract, data: fundData }],
      }) as string
      await waitForTx(eth, fundTx)
      setTxHash(fundTx)

      setPhase('confirming')
      const confirmRes = await fetch('/api/escrow/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, tx_hash: fundTx, kind: 'fund' }),
      })
      if (!confirmRes.ok) throw new Error('DB reconciliation failed — funds are secured on-chain though')

      setPhase('done')
      onFunded?.(fundTx)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setPhase('error')
    }
  }

  const busy = phase !== 'idle' && phase !== 'done' && phase !== 'error'

  return (
    <div style={{
      padding: 16, borderRadius: 12,
      background: 'var(--fh-surface)', border: '1px solid var(--fh-border)',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.5 }}>
        Fund escrow with <b style={{ color: 'var(--fh-t1)' }}>{amountUsdc} USDC</b> on Base.
        Funds stay in the smart contract until you release them to the freelancer.
      </div>

      <button
        onClick={run}
        disabled={busy || phase === 'done'}
        style={{
          padding: '10px 16px', borderRadius: 8, border: 'none',
          background: phase === 'done' ? '#34d399' : '#5e6ad2',
          color: '#fff', fontSize: 13, fontWeight: 590,
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.7 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        {busy && <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />}
        {phase === 'done'       && <Check        style={{ width: 14, height: 14 }} />}
        {phase === 'error'      && <AlertCircle  style={{ width: 14, height: 14 }} />}
        {phase === 'idle'       && <Wallet       style={{ width: 14, height: 14 }} />}
        {label(phase)}
      </button>

      {error   && <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>}
      {txHash  && <div style={{ fontSize: 11, color: 'var(--fh-t4)', wordBreak: 'break-all', fontFamily: 'monospace' }}>tx: {txHash}</div>}
    </div>
  )
}

function label(phase: Phase): string {
  switch (phase) {
    case 'idle':       return 'Fund with USDC'
    case 'connecting': return 'Connecting wallet…'
    case 'creating':   return 'Preparing escrow…'
    case 'approving':  return 'Approving USDC spend…'
    case 'funding':    return 'Sending funds…'
    case 'confirming': return 'Syncing with server…'
    case 'done':       return 'Funded'
    case 'error':      return 'Retry'
  }
}

async function waitForTx(provider: Eip1193Provider, hash: string): Promise<void> {
  for (let i = 0; i < 60; i++) {
    const receipt = await provider.request({
      method: 'eth_getTransactionReceipt',
      params: [hash],
    }) as { status?: string } | null
    if (receipt?.status === '0x1') return
    if (receipt?.status === '0x0') throw new Error('Transaction reverted')
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Transaction confirmation timed out')
}
