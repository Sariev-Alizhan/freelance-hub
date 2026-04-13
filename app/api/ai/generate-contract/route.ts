import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

  const {
    clientName,
    freelancerName,
    workDescription,
    deadline,
    amount,
    paymentOrder,
    ipRights,
    city = 'Almaty',
  } = await request.json()

  if (!process.env.ANTHROPIC_API_KEY) {
    const mock = getMockContract({ clientName, freelancerName, workDescription, deadline, amount, paymentOrder, ipRights, city })
    return new Response(mock, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const userPrompt = `Generate a contract with the following parameters:
City: ${city}
Client: ${clientName || 'John Smith'}
Freelancer: ${freelancerName || 'Jane Doe'}
Scope of work: ${workDescription}
Timeline: ${deadline}
Amount: $${Number(amount).toLocaleString()}
Payment terms: ${paymentOrder}
IP rights: ${ipRights}`

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    system: SYSTEM,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

function getMockContract(p: {
  clientName: string; freelancerName: string; workDescription: string
  deadline: string; amount: string; paymentOrder: string; ipRights: string; city: string
}) {
  return `FREELANCE SERVICES AGREEMENT No. ___

${p.city}, __________, 202__

PARTIES

Client: ${p.clientName || 'John Smith'}, hereinafter referred to as the "Client",
and
Freelancer: ${p.freelancerName || 'Jane Doe'}, hereinafter referred to as the "Freelancer",
collectively referred to as the "Parties", have entered into this Agreement as follows:

1. SCOPE OF WORK

1.1. The Freelancer agrees to perform the following services:
${p.workDescription}

1.2. The deliverables shall be provided to the Client in the agreed format.

2. TIMELINE

2.1. Completion deadline: ${p.deadline}.
2.2. The deadline may be extended by written agreement of both Parties.

3. PAYMENT

3.1. The Freelancer's fee is $${Number(p.amount).toLocaleString()} (${p.amount} US dollars).
3.2. Payment terms: ${p.paymentOrder}.
3.3. Payment shall be made to the Freelancer's details specified in Section 8.

4. INTELLECTUAL PROPERTY

4.1. ${p.ipRights}.

5. CONFIDENTIALITY

5.1. Both Parties agree not to disclose any information obtained in the course of this Agreement to third parties.

6. LIABILITY

6.1. For late payment, the Client shall pay a penalty of 0.1% of the amount for each day of delay.
6.2. For late delivery, the Freelancer shall pay a penalty of 0.1% of the amount for each day of delay.

7. DISPUTE RESOLUTION

7.1. Disputes shall be resolved through negotiation. If no agreement is reached — through the courts at the Defendant's location.

8. SIGNATURES

Client:                            Freelancer:
Name: ___________________          Name: ___________________
Phone: __________________          Phone: __________________
Email: __________________          Email: __________________
Signature: ______________          Signature: ______________
Date: ___________________          Date: ___________________`
}
