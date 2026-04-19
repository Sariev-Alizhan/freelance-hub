// HTTP Signatures (draft-cavage-12) — what Mastodon, Pleroma, Misskey speak.
// We both verify inbound (inbox auth) and sign outbound (Accept, Create delivery).
import { createSign, createVerify, createHash } from 'node:crypto'

// ─── Digest ────────────────────────────────────────────────────────────────
export function bodyDigestSha256(body: string): string {
  return 'SHA-256=' + createHash('sha256').update(body, 'utf8').digest('base64')
}

// ─── Signature header parsing ──────────────────────────────────────────────
function parseSignatureHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /(\w+)="([^"]*)"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(header)) !== null) out[m[1]] = m[2]
  return out
}

// ─── Canonical signing string ──────────────────────────────────────────────
function buildSigningString(
  method: string,
  url: URL,
  headers: Record<string, string>,
  signedHeaders: string[],
): string {
  return signedHeaders.map(name => {
    const lower = name.toLowerCase()
    if (lower === '(request-target)') {
      return `(request-target): ${method.toLowerCase()} ${url.pathname}${url.search}`
    }
    return `${lower}: ${headers[lower] ?? ''}`
  }).join('\n')
}

// ─── Verify inbound ────────────────────────────────────────────────────────
export interface VerifyResult {
  ok: boolean
  actorKeyId?: string
  actorUrl?: string
  reason?: string
}

export async function verifyHttpSignature(params: {
  method: string
  url: URL
  headers: Record<string, string>
  body: string
  fetchPublicKeyPem: (keyId: string) => Promise<string | null>
}): Promise<VerifyResult> {
  const { method, url, headers, body, fetchPublicKeyPem } = params

  const sigHeader = headers['signature']
  if (!sigHeader) return { ok: false, reason: 'missing signature header' }

  const parts = parseSignatureHeader(sigHeader)
  const keyId     = parts.keyId
  const algorithm = (parts.algorithm || 'rsa-sha256').toLowerCase()
  const signedHeaderNames = (parts.headers || 'date').split(/\s+/)
  const signatureB64 = parts.signature

  if (!keyId || !signatureB64) return { ok: false, reason: 'malformed signature' }
  if (!algorithm.includes('rsa') && !algorithm.includes('hs2019')) {
    return { ok: false, reason: `unsupported algorithm: ${algorithm}` }
  }

  // Digest must match the body if signed over.
  if (signedHeaderNames.includes('digest') && headers['digest']) {
    const expected = bodyDigestSha256(body)
    if (headers['digest'] !== expected) {
      return { ok: false, reason: 'digest mismatch' }
    }
  }

  // Reject stale requests (±1 hour).
  const dateHeader = headers['date']
  if (dateHeader) {
    const t = Date.parse(dateHeader)
    if (Number.isFinite(t) && Math.abs(Date.now() - t) > 60 * 60 * 1000) {
      return { ok: false, reason: 'stale date' }
    }
  }

  const signingString = buildSigningString(method, url, headers, signedHeaderNames)

  const publicKeyPem = await fetchPublicKeyPem(keyId)
  if (!publicKeyPem) return { ok: false, reason: 'failed to fetch public key' }

  const verifier = createVerify('RSA-SHA256')
  verifier.update(signingString, 'utf8')
  const ok = verifier.verify(publicKeyPem, signatureB64, 'base64')

  if (!ok) {
    // TODO: remove this diagnostic after Phase 3 is verified
    return {
      ok: false,
      reason: `signature verification failed | signingString=${JSON.stringify(signingString)} | keyId=${keyId}`,
    }
  }

  return { ok: true, actorKeyId: keyId, actorUrl: keyId.split('#')[0] }
}

// ─── Sign outbound ─────────────────────────────────────────────────────────
export function signRequest(params: {
  method: string
  url: URL
  body: string
  keyId: string
  privateKeyPem: string
}): Record<string, string> {
  const { method, url, body, keyId, privateKeyPem } = params
  const now    = new Date().toUTCString()
  const digest = bodyDigestSha256(body)

  const baseHeaders: Record<string, string> = {
    'host':         url.host,
    'date':         now,
    'digest':       digest,
    'content-type': 'application/activity+json',
  }

  const signedHeaderNames = ['(request-target)', 'host', 'date', 'digest']
  const signingString = buildSigningString(method, url, baseHeaders, signedHeaderNames)

  const signer = createSign('RSA-SHA256')
  signer.update(signingString, 'utf8')
  const signature = signer.sign(privateKeyPem, 'base64')

  const signatureHeader =
    `keyId="${keyId}",` +
    `algorithm="rsa-sha256",` +
    `headers="${signedHeaderNames.join(' ')}",` +
    `signature="${signature}"`

  return { ...baseHeaders, signature: signatureHeader }
}
