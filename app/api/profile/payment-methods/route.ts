import { createClient } from '@/lib/supabase/server'

const ALLOWED_TYPES = new Set([
  'usdt_trc20', 'usdt_erc20', 'btc', 'ton',
  'wise', 'revolut', 'paypal', 'payoneer',
  'iban', 'card', 'kaspi', 'halyk', 'other',
])

const MAX_METHODS    = 10
const MAX_VALUE_LEN  = 200
const MAX_NOTE_LEN   = 120

type Method = { type: string; value: string; note?: string }

function sanitize(input: unknown): Method[] | null {
  if (!Array.isArray(input)) return null
  if (input.length > MAX_METHODS) return null
  const out: Method[] = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    const type  = typeof r.type  === 'string' ? r.type.trim()  : ''
    const value = typeof r.value === 'string' ? r.value.trim() : ''
    const note  = typeof r.note  === 'string' ? r.note.trim()  : ''
    if (!ALLOWED_TYPES.has(type))         return null
    if (!value || value.length > MAX_VALUE_LEN) return null
    if (note.length > MAX_NOTE_LEN)        return null
    out.push(note ? { type, value, note } : { type, value })
  }
  return out
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }) }

  const methods = sanitize((body as { methods?: unknown })?.methods)
  if (methods === null) return Response.json({ error: 'Invalid payload' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { error } = await db
    .from('profiles')
    .update({ payment_methods: methods })
    .eq('id', user.id)

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true, methods })
}
