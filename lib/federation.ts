// Federation constants — single source of truth for "which instance am I?".
// Used by ActivityPub endpoints, DB defaults, and the actor-URL builder.
// Override per-deployment via NEXT_PUBLIC_INSTANCE_HOST (e.g. a self-hosted fork).

export const INSTANCE_HOST =
  process.env.NEXT_PUBLIC_INSTANCE_HOST?.trim() || 'freelance-hub.kz'

export const INSTANCE_ORIGIN = `https://${INSTANCE_HOST}`

export function actorUrl(username: string): string {
  return `${INSTANCE_ORIGIN}/users/${username}`
}

export function isLocalInstance(origin: string | null | undefined): boolean {
  if (!origin) return true
  return origin === INSTANCE_HOST
}
