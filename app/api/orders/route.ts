import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { applyRateLimit, sanitize, sanitizeText, logSecurityEvent } from '@/lib/security'

export const dynamic = 'force-dynamic'

const VALID_CATEGORIES = ['dev', 'ux-ui', 'smm', 'targeting', 'copywriting', 'video', 'tg-bots', 'ai-ml', 'nocode', '3d-art']
const VALID_BUDGET_TYPES = ['fixed', 'hourly']

export async function POST(req: NextRequest) {
  // Rate limit: 10 orders per hour per user
  const rl = applyRateLimit(req, 'orders:create', { limit: 10, windowMs: 60 * 60_000 })
  if (rl) return rl

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Validate required fields
  const title       = sanitize(body.title,       200)
  const description = sanitizeText(body.description, 10_000)
  const category    = String(body.category || '').trim()
  const budgetMin   = Math.max(0, parseInt(String(body.budgetMin  || '0')) || 0)
  const budgetMax   = Math.max(0, parseInt(String(body.budgetMax  || '0')) || 0)
  const budgetType  = String(body.budgetType || 'fixed').trim()
  const deadline    = sanitize(body.deadline, 100)
  const isUrgent    = body.isUrgent === true
  const rawSkills   = Array.isArray(body.skills) ? body.skills : []
  const skills      = rawSkills.slice(0, 20).map((s: unknown) => sanitize(s, 50)).filter(Boolean)

  if (title.length < 5)                          return NextResponse.json({ error: 'Title too short (min 5 chars)' }, { status: 400 })
  if (description.length < 20)                   return NextResponse.json({ error: 'Description too short (min 20 chars)' }, { status: 400 })
  if (!VALID_CATEGORIES.includes(category))      return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  if (!VALID_BUDGET_TYPES.includes(budgetType))  return NextResponse.json({ error: 'Invalid budget type' }, { status: 400 })
  if (budgetMin > 100_000_000)                   return NextResponse.json({ error: 'Budget too large' }, { status: 400 })
  if (deadline.length < 2)                       return NextResponse.json({ error: 'Deadline is required' }, { status: 400 })

  const admin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data, error } = await admin.from('orders').insert({
    client_id:   user.id,
    title,
    description,
    category,
    budget_min:  budgetMin,
    budget_max:  budgetMax,
    budget_type: budgetType,
    deadline,
    skills,
    is_urgent:   isUrgent,
    status:      'open',
  }).select('id').single()

  if (error) {
    logSecurityEvent('invalid_input', { path: '/api/orders', error: error.message }, req)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id }, { status: 201 })
}
