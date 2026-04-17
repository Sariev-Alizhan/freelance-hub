import { createClient } from '@/lib/supabase/server'

/**
 * Server-only helper: returns the currently logged-in Supabase user (or null).
 * Uses the typed cookie-aware server client from lib/supabase/server.ts.
 */
export async function getSessionUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
