#!/usr/bin/env node
// One-shot key generator for the instance's VC issuer.
// Run: `node scripts/generate-issuer-key.mjs`
// Paste the output into your Vercel env.

import { webcrypto } from 'node:crypto'
import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha2.js'

ed.hashes.sha512 = sha512

const priv = webcrypto.getRandomValues(new Uint8Array(32))
const pub  = ed.getPublicKey(priv)

const toHex = (b) => Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('')

console.log('')
console.log('=== FreelanceHub issuer key (ed25519) ===')
console.log('Generated at:', new Date().toISOString())
console.log('')
console.log('Add these to your env (Vercel → Settings → Environment Variables):')
console.log('')
console.log(`ISSUER_ED25519_PRIVATE_KEY=${toHex(priv)}`)
console.log(`ISSUER_ED25519_PUBLIC_KEY=${toHex(pub)}`)
console.log('')
console.log('IMPORTANT:')
console.log('  - Keep the PRIVATE key secret (never commit, never log, never expose client-side)')
console.log('  - Rotating it invalidates every VC this instance has issued')
console.log('  - The PUBLIC key is served at /.well-known/did.json and used by verifiers')
console.log('')
