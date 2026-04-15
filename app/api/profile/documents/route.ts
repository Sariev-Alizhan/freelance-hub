import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { applyRateLimit, sanitize, isValidUUID } from '@/lib/security'

// GET — list current user's documents
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { data } = await admin
    .from('profile_documents')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return Response.json({ documents: data ?? [] })
}

// POST — save document metadata after Supabase Storage upload
export async function POST(req: Request) {
  const rl = applyRateLimit(req, 'profile:documents', { limit: 10, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const name      = sanitize(body?.name, 200)
  const url       = sanitize(body?.url, 1000)
  const file_type = sanitize(body?.file_type, 100)
  const file_size = typeof body?.file_size === 'number' ? body.file_size : null
  const doc_type  = ['resume', 'portfolio', 'certificate', 'other'].includes(body?.doc_type)
    ? body.doc_type as string
    : 'other'

  if (!name || !url || !file_type) {
    return Response.json({ error: 'name, url, file_type required' }, { status: 400 })
  }

  // Max 10 documents per user
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { count } = await admin
    .from('profile_documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 10) {
    return Response.json({ error: 'Maximum 10 documents allowed' }, { status: 400 })
  }

  const { data, error } = await admin
    .from('profile_documents')
    .insert({ user_id: user.id, name, url, file_type, file_size, doc_type })
    .select()
    .single()

  if (error) {
    console.error('[documents POST]', error)
    return Response.json({ error: 'Failed to save' }, { status: 500 })
  }

  return Response.json({ ok: true, document: data })
}

// DELETE — remove a document
export async function DELETE(req: Request) {
  const rl = applyRateLimit(req, 'profile:documents', { limit: 10, windowMs: 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  if (!isValidUUID(id)) return Response.json({ error: 'Invalid ID' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  // Get the doc to find storage path for deletion
  const { data: doc } = await admin
    .from('profile_documents')
    .select('url, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!doc) return Response.json({ error: 'Not found' }, { status: 404 })

  // Delete from DB
  await admin.from('profile_documents').delete().eq('id', id).eq('user_id', user.id)

  return Response.json({ ok: true })
}
