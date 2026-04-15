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
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return Response.json({ error: 'Invalid rating' }, { status: 400 })
  }
  if (text.trim().length > 2000) {
    return Response.json({ error: 'Review text too long (max 2000 chars)' }, { status: 400 })
  }
  if (typeof freelancerId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(freelancerId)) {
    return Response.json({ error: 'Invalid freelancerId' }, { status: 400 })
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

  // Recalculate rating and reviews_count on freelancer_profiles
  try {
    const adminForRating = createAdminClient()
    const adminRatingDb = adminForRating as any
    const { data: allReviews } = await adminRatingDb
      .from('freelancer_reviews')
      .select('rating')
      .eq('freelancer_id', freelancerId)

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / allReviews.length
      await adminRatingDb
        .from('freelancer_profiles')
        .update({
          rating: Math.round(avg * 10) / 10,
          reviews_count: allReviews.length,
        })
        .eq('user_id', freelancerId)
    }
  } catch (e) {
    console.error('[reviews] rating recalc error:', e)
  }

  // Notify freelancer + send email (best-effort)
  try {
    const admin = createAdminClient()
    const adminDb = admin as any

    // In-app notification
    await adminDb.from('notifications').insert({
      user_id: freelancerId,
      type:    'order_completed',
      title:   `New review from ${reviewer_name}`,
      body:    `${'★'.repeat(rating)} "${text.trim().slice(0, 60)}${text.trim().length > 60 ? '…' : ''}"`,
      link:    `/u/${freelancerId}`,
    })

    // Email
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
    console.error('[reviews] notify error:', e)
  }

  return Response.json({ review: data })
}
