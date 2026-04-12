import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ freelancerId: string }> }
) {
  const { freelancerId } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data, error } = await db
    .from('freelancer_reviews')
    .select('id, reviewer_name, reviewer_avatar, rating, text, created_at')
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ reviews: [] })
  return Response.json({ reviews: data ?? [] })
}
