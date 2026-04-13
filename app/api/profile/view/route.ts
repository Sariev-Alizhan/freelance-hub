import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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
  try {
    const { freelancerId } = await request.json()
    if (!freelancerId) return Response.json({ ok: false }, { status: 400 })

    // Get viewer (may be anon)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Don't count the freelancer viewing their own profile
    if (user && user.id === freelancerId) {
      return Response.json({ ok: true, skipped: true })
    }

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
