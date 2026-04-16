import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'

function sanitizeInput(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return ''
  // Strip potential prompt injection: newlines used to escape context
  return val.replace(/[<>]/g, '').trim().slice(0, maxLen)
}

const SYSTEM = `You are a legal assistant specializing in freelance service agreements for the global market.
Generate a complete, professional services contract.

Contract structure:
1. Header (city, date)
2. Parties
3. Scope of work
4. Client rights and obligations
5. Freelancer rights and obligations
6. Timeline
7. Payment terms
8. Intellectual property rights
9. Confidentiality
10. Liability
11. Force majeure
12. Dispute resolution
13. General provisions
14. Signatures

Requirements:
- Professional legal language
- Protects both parties equally
- Clear, unambiguous terms
- Suitable for international freelance agreements
- Use the specific data from the request
- Write date as: [City], __________, 202__
- Leave blank fields for manual completion: ____________
Respond with the contract text only — no explanations before or after.`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const rl = rateLimit(`ai:contract:${user.id}`, 5, 60_000)
  if (!rl.success) {
    return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
  }

  const body = await request.json()

  const clientName     = sanitizeInput(body.clientName, 100) || 'Client'
  const freelancerName = sanitizeInput(body.freelancerName, 100) || 'Freelancer'
  const workDescription= sanitizeInput(body.workDescription, 1500)
  const deadline       = sanitizeInput(body.deadline, 100)
  const paymentOrder   = sanitizeInput(body.paymentOrder, 300)
  const ipRights       = sanitizeInput(body.ipRights, 300)
  const city           = sanitizeInput(body.city, 50) || 'Almaty'
  const amount         = Number(body.amount) || 0

  if (!workDescription || workDescription.length < 10) {
    return Response.json({ error: 'Work description too short' }, { status: 400 })
  }

  const userPrompt = `Generate a contract with the following parameters:
City: ${city}
Client: ${clientName}
Freelancer: ${freelancerName}
Scope of work: ${workDescription}
Timeline: ${deadline}
Amount: ${amount.toLocaleString()} KZT
Payment terms: ${paymentOrder}
IP rights: ${ipRights}`

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-6',
    maxOutputTokens: 3000,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return result.toTextStreamResponse()
}
