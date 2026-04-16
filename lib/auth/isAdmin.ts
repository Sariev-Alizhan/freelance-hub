import type { User } from '@supabase/supabase-js'

/**
 * Returns true if the user is an admin.
 * Checks Supabase JWT claim first (set by v9_admin_rbac.sql trigger),
 * then falls back to ADMIN_EMAIL env var for backwards compatibility.
 */
export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false

  // Primary: JWT claim set via DB trigger (see supabase/v9_admin_rbac.sql)
  if (user.app_metadata?.is_admin === true) return true

  // Fallback: env-var email check (works before migration is applied)
  const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (adminEmail && user.email === adminEmail) return true

  return false
}
