import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { applyRateLimit, isValidUUID } from '@/lib/security'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// POST /api/profile/view
// Body: { freelancerId: string }
// Logs a profile view. Called client-side from the freelancer profile page.
export async function POST(request: Request) {
  // Throttle per IP to stop stats inflation (60 views/min/IP is plenty for real use).
  const rl = applyRateLimit(request, 'profile-view', { limit: 60, windowMs: 60_000 })
  if (rl) return rl

  try {
    const { freelancerId } = await request.json()
    if (!isValidUUID(freelancerId)) {
      return Response.json({ ok: false, error: 'Invalid freelancerId' }, { status: 400 })
    }

    // Get viewer (may be anon)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Don't count the freelancer viewing their own profile
    if (user && user.id === freelancerId) {
      return Response.json({ ok: true, skipped: true })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = serviceClient() as any
    await db.from('profile_views').insert({
      freelancer_id: freelancerId,
      viewer_id: user?.id ?? null,
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ ok: false }, { status: 500 })
  }
}
