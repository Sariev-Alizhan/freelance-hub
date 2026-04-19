// Per-user RSA keypair for ActivityPub HTTP Signatures.
// Generated on-demand the first time an actor is fetched. Cached in the
// profile row. Private key is write-once; never exposed beyond service_role.
import { generateKeyPairSync, createPublicKey } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export function generateRsaKeypair(): { publicKeyPem: string; privateKeyPem: string } {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  return {
    publicKeyPem:  publicKey.export({  type: 'spki',  format: 'pem' }).toString(),
    privateKeyPem: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
  }
}

export function publicPemFromPrivate(privatePem: string): string {
  return createPublicKey(privatePem).export({ type: 'spki', format: 'pem' }).toString()
}

// Returns {publicKeyPem} for the actor, generating+persisting on first call.
export async function getOrCreateActorKey(userId: string): Promise<{ publicKeyPem: string }> {
  const db = admin()

  const { data: existing } = await db
    .from('profiles')
    .select('public_key_pem, private_key_pem')
    .eq('id', userId)
    .maybeSingle<{ public_key_pem: string | null; private_key_pem: string | null }>()

  if (existing?.public_key_pem && existing.private_key_pem) {
    return { publicKeyPem: existing.public_key_pem }
  }

  const kp = generateRsaKeypair()
  await db
    .from('profiles')
    .update({ public_key_pem: kp.publicKeyPem, private_key_pem: kp.privateKeyPem })
    .eq('id', userId)

  return { publicKeyPem: kp.publicKeyPem }
}
