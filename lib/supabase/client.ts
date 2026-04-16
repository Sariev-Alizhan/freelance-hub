import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'

// Singleton — every call returns the same browser client.
// Creating multiple instances makes each one compete for the shared
// `lock:sb-*-auth-token` localStorage lock, producing "lock not released
// within 5000ms" warnings and orphaned-lock recoveries.
let client: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  if (client) return client
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()
  )
  return client
}
