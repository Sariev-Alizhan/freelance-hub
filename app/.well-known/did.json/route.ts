// did:web DID document for this instance. Verifiers resolve
// did:web:<host> by GET'ing https://<host>/.well-known/did.json
// and use the key under assertionMethod to verify VCs we sign.

import { NextResponse } from 'next/server'
import { INSTANCE_HOST } from '@/lib/federation'

export const runtime = 'nodejs'

function hexToBase64Url(hex: string): string {
  const clean = hex.trim().replace(/^0x/, '')
  const buf = Buffer.from(clean, 'hex')
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function GET() {
  const pubHex = process.env.ISSUER_ED25519_PUBLIC_KEY
  if (!pubHex) {
    return NextResponse.json({ error: 'issuer not configured' }, { status: 503 })
  }

  const did = `did:web:${INSTANCE_HOST}`
  const keyId = `${did}#key-1`

  const doc = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
    ],
    id: did,
    verificationMethod: [{
      id:         keyId,
      type:       'JsonWebKey2020',
      controller: did,
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x:   hexToBase64Url(pubHex),
        alg: 'EdDSA',
      },
    }],
    assertionMethod:      [keyId],
    authentication:       [keyId],
    capabilityInvocation: [keyId],
  }

  return NextResponse.json(doc, {
    headers: {
      'Content-Type':  'application/did+json',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  })
}
