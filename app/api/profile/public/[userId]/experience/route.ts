import { createAdminClient } from '@/lib/supabase/admin'
import { isValidUUID } from '@/lib/security'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  if (!isValidUUID(userId)) return Response.json({ experience: [] })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data } = await admin
      .from('work_experience')
      .select('id, company, position, description, start_date, end_date, is_current, location')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })

    return Response.json({ experience: data ?? [] })
  } catch {
    return Response.json({ experience: [] })
  }
}
