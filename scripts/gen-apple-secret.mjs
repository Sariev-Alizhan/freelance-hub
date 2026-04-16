/**
 * Generate Apple client_secret JWT for Supabase
 * Run: node scripts/gen-apple-secret.mjs
 */
import { SignJWT, importPKCS8 } from 'jose'

// ── Paste your .p8 key content here ──────────────────────────────────────────
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
PASTE_YOUR_P8_KEY_CONTENT_HERE
-----END PRIVATE KEY-----`
// ─────────────────────────────────────────────────────────────────────────────

const TEAM_ID    = '85MH8SWD4T'
const KEY_ID     = '2U8DWVS4D6'
const CLIENT_ID  = 'kz.freelancehub.web'   // Services ID identifier

const now = Math.floor(Date.now() / 1000)
const exp = now + 15552000  // 180 days

const key = await importPKCS8(PRIVATE_KEY, 'ES256')

const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: 'ES256', kid: KEY_ID })
  .setIssuer(TEAM_ID)
  .setIssuedAt(now)
  .setSubject(CLIENT_ID)
  .setAudience('https://appleid.apple.com')
  .setExpirationTime(exp)
  .sign(key)

console.log('\n✅ Apple client_secret JWT:\n')
console.log(jwt)
console.log('\nExpires:', new Date(exp * 1000).toISOString())
console.log('\nCopy the JWT above → Supabase Dashboard → Auth → Providers → Apple → Client Secret\n')
