import { NextRequest, NextResponse } from 'next/server'
import { verifyMessage } from 'viem'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyChallenge, challengeMessage } from '@/lib/did-challenge'
import { addressToDid } from '@/lib/identity'
import { signVc } from '@/lib/issuer'
import { INSTANCE_HOST } from '@/lib/federation'

export const runtime = 'nodejs'

interface VerifyBody {
  token:     string
  address:   string
  signature: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: VerifyBody
  try { body = await req.json() }
  catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

  const { token, address, signature } = body
  if (!token || !address || !signature) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 })
  }

  const challenge = verifyChallenge(token, user.id)
  if (!challenge) return NextResponse.json({ error: 'invalid or expired challenge' }, { status: 400 })

  const message = challengeMessage(challenge.nonce, INSTANCE_HOST)
  let valid = false
  try {
    valid = await verifyMessage({
      address:   address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    })
  } catch {
    return NextResponse.json({ error: 'signature verification failed' }, { status: 400 })
  }
  if (!valid) return NextResponse.json({ error: 'signature mismatch' }, { status: 400 })

  const did = addressToDid(address)

  // Admin client bypasses RLS for the profile UPDATE (user can't write `did` directly)
  // and the verifications INSERT (only service_role can issue credentials).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  // Bind DID on the profile (unique — fails if someone else already claimed this wallet).
  const { data: profile, error: profileErr } = await admin
    .from('profiles')
    .update({ did })
    .eq('id', user.id)
    .select('id, username')
    .maybeSingle()

  if (profileErr) {
    const code = profileErr.code === '23505' ? 409 : 500
    return NextResponse.json({ error: profileErr.message }, { status: code })
  }
  if (!profile) return NextResponse.json({ error: 'profile not found' }, { status: 404 })

  // Issue an IdentityCredential asserting this DID controls this profile.
  const jwt = await signVc({
    type:       'identity',
    subjectDid: did,
    claim: {
      profileId:  profile.id,
      username:   profile.username,
      proofType:  'wallet-ownership',
      boundAt:    new Date().toISOString(),
    },
    expiresInSeconds: 60 * 60 * 24 * 365, // 1 year
  })

  const { error: vcErr } = await admin.from('verifications').insert({
    subject_id:      profile.id,
    subject_did:     did,
    credential_type: 'identity',
    credential_jwt:  jwt,
    issuer_did:      `did:web:${INSTANCE_HOST}`,
    claim: {
      profileId: profile.id,
      username:  profile.username,
      proofType: 'wallet-ownership',
    },
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  })

  if (vcErr) {
    return NextResponse.json({ error: `vc insert failed: ${vcErr.message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, did })
}
