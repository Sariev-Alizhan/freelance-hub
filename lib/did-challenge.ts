// Stateless DID-binding challenges. Server issues an HMAC-signed token tied
// to the authenticated user; client echoes it back in the signature payload.
// No DB row needed — signature + TTL are enough.

import 'server-only'
import crypto from 'node:crypto'

const TTL_MS = 5 * 60 * 1000 // 5 minutes

function getSecret(): string {
  const s = process.env.SUPABASE_JWT_SECRET || process.env.ISSUER_ED25519_PRIVATE_KEY
  if (!s) throw new Error('no HMAC secret available')
  return s
}

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export interface ChallengeToken {
  userId: string
  nonce: string
  exp:    number
}

export function issueChallenge(userId: string): string {
  const body: ChallengeToken = {
    userId,
    nonce: crypto.randomBytes(16).toString('hex'),
    exp:   Date.now() + TTL_MS,
  }
  const payload = base64url(Buffer.from(JSON.stringify(body)))
  const sig = base64url(crypto.createHmac('sha256', getSecret()).update(payload).digest())
  return `${payload}.${sig}`
}

export function verifyChallenge(token: string, userId: string): ChallengeToken | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, sig] = parts

  const expected = base64url(crypto.createHmac('sha256', getSecret()).update(payload).digest())
  if (expected.length !== sig.length) return null

  // Constant-time compare.
  const eb = Buffer.from(expected)
  const sb = Buffer.from(sig)
  if (eb.length !== sb.length || !crypto.timingSafeEqual(eb, sb)) return null

  let body: ChallengeToken
  try {
    body = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
  } catch { return null }

  if (body.userId !== userId) return null
  if (Date.now() > body.exp) return null
  return body
}

export function challengeMessage(nonce: string, host: string): string {
  // What the wallet actually signs. Include host to prevent cross-instance replay.
  return `Sign in to ${host}\n\nThis is a one-time identity binding.\n\nNonce: ${nonce}`
}
