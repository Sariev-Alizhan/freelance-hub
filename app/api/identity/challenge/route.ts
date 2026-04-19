import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { issueChallenge, challengeMessage } from '@/lib/did-challenge'
import { INSTANCE_HOST } from '@/lib/federation'

export const runtime = 'nodejs'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const token = issueChallenge(user.id)
  // Extract the nonce so the client can display / sign it without parsing.
  const body = JSON.parse(Buffer.from(token.split('.')[0], 'base64').toString('utf8'))

  return NextResponse.json({
    token,
    nonce:   body.nonce,
    message: challengeMessage(body.nonce, INSTANCE_HOST),
  })
}
