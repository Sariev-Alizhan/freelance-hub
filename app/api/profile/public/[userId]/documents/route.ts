import { createAdminClient } from '@/lib/supabase/admin'
import { isValidUUID } from '@/lib/security'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  if (!isValidUUID(userId)) return Response.json({ documents: [] })

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any
    const { data } = await admin
      .from('profile_documents')
      .select('id, name, url, file_type, file_size, doc_type, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return Response.json({ documents: data ?? [] })
  } catch {
    return Response.json({ documents: [] })
  }
}
