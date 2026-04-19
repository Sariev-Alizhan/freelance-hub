// Outbound ActivityPub delivery: fetch remote actors, send signed activities.
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { randomUUID } from 'node:crypto'
import { request as httpsRequest } from 'node:https'
import { actorUrl, INSTANCE_ORIGIN } from '@/lib/federation'
import { signRequest } from '@/lib/http-signatures'

// Node's fetch (undici) overrides the Date header — fatal for HTTP Signatures.
// Send via raw https.request so the signed headers arrive verbatim.
function rawPost(url: URL, headers: Record<string, string>, body: string, timeoutMs: number): Promise<{ status: number }> {
  return new Promise((resolve, reject) => {
    const req = httpsRequest({
      method:   'POST',
      hostname: url.hostname,
      port:     url.port || 443,
      path:     url.pathname + url.search,
      headers:  { ...headers, 'content-length': Buffer.byteLength(body).toString() },
      timeout:  timeoutMs,
    }, res => {
      res.on('data', () => {})
      res.on('end',  () => resolve({ status: res.statusCode ?? 0 }))
    })
    req.on('error',   reject)
    req.on('timeout', () => { req.destroy(new Error('timeout')) })
    req.write(body)
    req.end()
  })
}

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface RemoteActor {
  id: string
  inbox: string
  endpoints?: { sharedInbox?: string }
  publicKey?: { id: string; owner: string; publicKeyPem: string }
}

// Fetch a remote actor's AS2 JSON. Returns null on 404 / network error.
export async function fetchRemoteActor(actorUri: string): Promise<RemoteActor | null> {
  try {
    const res = await fetch(actorUri, {
      headers: { Accept: 'application/activity+json' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    return await res.json() as RemoteActor
  } catch {
    return null
  }
}

// keyId → publicKeyPem. Mastodon's keyId is actor#main-key; strip fragment.
export async function fetchPublicKeyPem(keyId: string): Promise<string | null> {
  const actor = await fetchRemoteActor(keyId.split('#')[0])
  return actor?.publicKey?.publicKeyPem ?? null
}

// Load our user's signing credentials.
async function getSigner(userId: string): Promise<{ username: string; privateKeyPem: string } | null> {
  const { data } = await admin()
    .from('profiles')
    .select('username, private_key_pem')
    .eq('id', userId)
    .maybeSingle<{ username: string; private_key_pem: string | null }>()
  if (!data?.username || !data.private_key_pem) return null
  return { username: data.username, privateKeyPem: data.private_key_pem }
}

// POST a signed activity to a remote inbox.
export async function postActivity(params: {
  fromUserId: string
  toInboxUrl: string
  activity: Record<string, unknown>
}): Promise<{ ok: boolean; status?: number; reason?: string }> {
  const signer = await getSigner(params.fromUserId)
  if (!signer) return { ok: false, reason: 'no signing key' }

  const body = JSON.stringify(params.activity)
  const url  = new URL(params.toInboxUrl)
  const headers = signRequest({
    method:        'POST',
    url,
    body,
    keyId:         `${actorUrl(signer.username)}#main-key`,
    privateKeyPem: signer.privateKeyPem,
  })

  try {
    const res = await rawPost(
      url,
      { ...headers, accept: 'application/activity+json' },
      body,
      15_000,
    )
    return { ok: res.status >= 200 && res.status < 300, status: res.status }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'fetch failed' }
  }
}

// Build + deliver an Accept activity in response to a Follow.
export async function sendAccept(params: {
  localUserId: string
  localUsername: string
  follow: Record<string, unknown>
  toInboxUrl: string
}): Promise<void> {
  const actor = actorUrl(params.localUsername)
  const activity = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id:     `${INSTANCE_ORIGIN}/activities/${randomUUID()}`,
    type:   'Accept',
    actor,
    object: params.follow,
  }
  await postActivity({
    fromUserId: params.localUserId,
    toInboxUrl: params.toInboxUrl,
    activity,
  })
}

// Deliver a new Create(Note) to all federated followers.
export async function broadcastCreateNote(params: {
  localUserId: string
  localUsername: string
  postId: string
  content: string
  publishedAt: string
}): Promise<{ sent: number; failed: number }> {
  const { data: followers } = await admin()
    .from('federated_followers')
    .select('remote_inbox')
    .eq('local_user_id', params.localUserId)
    .eq('accepted', true)

  if (!followers?.length) return { sent: 0, failed: 0 }

  // De-dupe on sharedInbox when multiple followers are on the same server.
  const inboxes = [...new Set((followers as { remote_inbox: string }[]).map(f => f.remote_inbox))]

  const actor  = actorUrl(params.localUsername)
  const noteId = `${INSTANCE_ORIGIN}/posts/${params.postId}`
  const activity = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id:   `${noteId}#create`,
    type: 'Create',
    actor,
    published: params.publishedAt,
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: [`${actor}/followers`],
    object: {
      id:           noteId,
      type:         'Note',
      attributedTo: actor,
      content:      params.content,
      published:    params.publishedAt,
      to:           ['https://www.w3.org/ns/activitystreams#Public'],
      cc:           [`${actor}/followers`],
      url:          `${INSTANCE_ORIGIN}/feed`,
    },
  }

  const results = await Promise.allSettled(
    inboxes.map(inbox => postActivity({
      fromUserId: params.localUserId,
      toInboxUrl: inbox,
      activity,
    })),
  )

  const sent   = results.filter(r => r.status === 'fulfilled' && r.value.ok).length
  const failed = results.length - sent
  return { sent, failed }
}
