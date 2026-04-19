// DID / Verifiable Credential utilities.
// Lightweight, no deps: enough for did:key and did:ethr parsing.
// Full JWT signing lives server-side and gets added in Phase 1.

export type DidMethod = 'key' | 'ethr' | 'web'

export interface ParsedDid {
  method: DidMethod
  identifier: string   // the method-specific id (address, multibase key, hostname)
  raw: string
}

export function parseDid(did: string): ParsedDid | null {
  const m = /^did:(key|ethr|web):(.+)$/i.exec(did.trim())
  if (!m) return null
  return { method: m[1].toLowerCase() as DidMethod, identifier: m[2], raw: did }
}

export function isEthereumDid(did: string): boolean {
  return /^did:ethr:(0x[a-fA-F0-9]{40}|[a-z0-9-]+:0x[a-fA-F0-9]{40})$/i.test(did)
}

// Ethereum wallet address → did:ethr on Base (chain id 8453).
// Chain-prefixed form so the DID resolves unambiguously to the right network.
export function addressToDid(address: string): string {
  const clean = address.toLowerCase().trim()
  if (!/^0x[a-f0-9]{40}$/.test(clean)) throw new Error('invalid address')
  return `did:ethr:base:${clean}`
}

// W3C Verifiable Credential shape — the claim object stored in verifications.claim.
// The signed JWT in verifications.credential_jwt is the authoritative version.
export interface VerifiableCredentialClaim {
  '@context': string[]
  type: string[]
  issuer: string                       // issuer DID
  issuanceDate: string                 // ISO
  expirationDate?: string              // ISO
  credentialSubject: {
    id: string                         // subject DID
    [key: string]: unknown
  }
}
