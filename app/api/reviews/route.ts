import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail, emailNewReview } from '@/lib/email'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { freelancerId, rating, text } = await request.json()

  if (!freelancerId || !rating || !text?.trim()) {
    return Response.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return Response.json({ error: 'Invalid rating' }, { status: 400 })
  }

  const reviewer_name =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'Пользователь'
  const reviewer_avatar = user.user_metadata?.avatar_url ?? null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('freelancer_reviews')
    .insert({ freelancer_id: freelancerId, reviewer_id: user.id, reviewer_name, reviewer_avatar, rating, text: text.trim() })
    .select()
    .single()

  if (error) {
    // unique constraint → already reviewed
    if (error.code === '23505') {
      return Response.json({ error: 'Вы уже оставили отзыв этому фрилансеру' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 400 })
  }

  // Send email to freelancer (best-effort)
  try {
    const admin = createAdminClient()
    const { data: freelancerAuth } = await admin.auth.admin.getUserById(freelancerId)
    const freelancerEmail = freelancerAuth?.user?.email
    if (freelancerEmail) {
      await sendEmail(
        freelancerEmail,
        `Новый отзыв от ${reviewer_name}`,
        emailNewReview({ reviewerName: reviewer_name, rating, text: text.trim(), freelancerId })
      )
    }
  } catch (e) {
    console.error('[reviews] email error:', e)
  }

  return Response.json({ review: data })
}
