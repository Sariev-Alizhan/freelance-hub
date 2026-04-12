import { createClient } from '@supabase/supabase-js'

/** Service-role клиент — обходит RLS. Использовать только в server-only маршрутах! */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
