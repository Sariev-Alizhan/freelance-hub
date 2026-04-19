// Server-side VC issuer. Signs W3C Verifiable Credentials with this instance's
// ed25519 key. The issuer DID is did:web:<instance>, resolved via the instance's
// /.well-known/did.json endpoint.

import 'server-only'
import { EdDSASigner } from 'did-jwt'
import { createVerifiableCredentialJwt, type Issuer } from 'did-jwt-vc'
import { INSTANCE_HOST } from './federation'

export const ISSUER_DID = `did:web:${INSTANCE_HOST}`

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().replace(/^0x/, '')
  if (clean.length % 2) throw new Error('invalid hex')
  const out = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = parseInt(clean.slice(i, i + 2), 16)
  }
  return out
}

function loadPrivateKey(): Uint8Array {
  const hex = process.env.ISSUER_ED25519_PRIVATE_KEY
  if (!hex) throw new Error('ISSUER_ED25519_PRIVATE_KEY is not set')
  const bytes = hexToBytes(hex)
  if (bytes.length !== 32) throw new Error('ISSUER_ED25519_PRIVATE_KEY must be 32 bytes hex')
  return bytes
}

let _issuer: Issuer | null = null
function getIssuer(): Issuer {
  if (_issuer) return _issuer
  _issuer = {
    did: ISSUER_DID,
    signer: EdDSASigner(loadPrivateKey()),
    alg: 'EdDSA',
  }
  return _issuer
}

export type VcType = 'identity' | 'skill' | 'company' | 'kyc'

const VC_TYPE_NAME: Record<VcType, string> = {
  identity: 'IdentityCredential',
  skill:    'SkillCredential',
  company:  'CompanyCredential',
  kyc:      'KycCredential',
}

export interface SignVcInput {
  type: VcType
  subjectDid: string
  claim: Record<string, unknown>
  expiresInSeconds?: number
}

export async function signVc({
  type, subjectDid, claim, expiresInSeconds,
}: SignVcInput): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const payload: Parameters<typeof createVerifiableCredentialJwt>[0] = {
    sub: subjectDid,
    nbf: now,
    ...(expiresInSeconds ? { exp: now + expiresInSeconds } : {}),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', VC_TYPE_NAME[type]],
      credentialSubject: { id: subjectDid, ...claim },
    },
  }
  return createVerifiableCredentialJwt(payload, getIssuer())
}
