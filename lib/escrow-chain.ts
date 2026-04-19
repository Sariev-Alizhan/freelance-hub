// On-chain escrow helpers — reading state, building calldata, deriving IDs.
// Uses viem for chain reads; the UI handles actual tx signing via wallet.
import { createPublicClient, http, keccak256, toHex } from 'viem'
import { base, baseSepolia } from 'viem/chains'

export const USDC_ADDRESS = {
  8453:   '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base mainnet
  84532:  '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
} as const

export type EscrowChainId = keyof typeof USDC_ADDRESS

export const USDC_DECIMALS = 6

export function getEscrowContract(): { address: `0x${string}` | null; chainId: EscrowChainId } {
  const chainId = (parseInt(process.env.NEXT_PUBLIC_ESCROW_CHAIN ?? '0', 10) as EscrowChainId) || 8453
  const address = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT ?? null) as `0x${string}` | null
  return { address, chainId }
}

// Turn an order UUID into the bytes32 id the contract expects.
// keccak256 keeps ids collision-resistant even if UUID dashes / case changes.
export function orderIdToEscrowId(orderId: string): `0x${string}` {
  return keccak256(toHex(`escrow:${orderId.toLowerCase()}`))
}

// Convert a USDC amount in whole tokens to 6-decimal units.
export function usdcToUnits(amount: number): bigint {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('invalid amount')
  return BigInt(Math.round(amount * 10 ** USDC_DECIMALS))
}

export const ESCROW_ABI = [
  { type: 'function', name: 'escrows', stateMutability: 'view',
    inputs: [{ name: 'id', type: 'bytes32' }],
    outputs: [
      { name: 'client',     type: 'address' },
      { name: 'freelancer', type: 'address' },
      { name: 'amount',     type: 'uint96' },
      { name: 'status',     type: 'uint8' },
    ],
  },
  { type: 'function', name: 'fund',       stateMutability: 'nonpayable',
    inputs: [
      { name: 'id',         type: 'bytes32' },
      { name: 'freelancer', type: 'address' },
      { name: 'amount',     type: 'uint96' },
    ], outputs: [] },
  { type: 'function', name: 'release',    stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'refund',     stateMutability: 'nonpayable',
    inputs: [{ name: 'id', type: 'bytes32' }], outputs: [] },
  { type: 'function', name: 'arbitrate',  stateMutability: 'nonpayable',
    inputs: [
      { name: 'id',            type: 'bytes32' },
      { name: 'toFreelancer',  type: 'bool' },
    ], outputs: [] },
] as const

export type EscrowStatus = 'None' | 'Funded' | 'Released' | 'Refunded'
export const STATUS_LABEL: Record<number, EscrowStatus> = {
  0: 'None', 1: 'Funded', 2: 'Released', 3: 'Refunded',
}

export function getPublicClient(chainId: EscrowChainId) {
  return createPublicClient({
    chain: chainId === 8453 ? base : baseSepolia,
    transport: http(),
  })
}

export async function readEscrow(orderId: string) {
  const { address, chainId } = getEscrowContract()
  if (!address) return null

  const id = orderIdToEscrowId(orderId)
  const client = getPublicClient(chainId)

  const [escrowClient, freelancer, amount, statusNum] = await client.readContract({
    address,
    abi: ESCROW_ABI,
    functionName: 'escrows',
    args: [id],
  }) as readonly [`0x${string}`, `0x${string}`, bigint, number]

  return {
    escrowId:    id,
    client:      escrowClient,
    freelancer,
    amount,     // in 6-decimal units
    status:      STATUS_LABEL[statusNum] ?? 'None',
    chainId,
    contract:    address,
  }
}
