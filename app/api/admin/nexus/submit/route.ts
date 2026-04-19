import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import { isAdmin } from '@/lib/auth/isAdmin'

export const dynamic = 'force-dynamic'

interface NexusItem {
  id:         string
  title:      string
  desc:       string
  dept:       string
  priority:   string
  category:   string
  effort:     string
  promptHint: string
  version:    string
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  // Auth check
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin(user)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { items: NexusItem[] }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad JSON' }, { status: 400 }) }

  const { items } = body
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'No items' }, { status: 400 })
  }

  // 1. Build a structured prompt for Claude
  const criticals = items.filter(i => i.priority === 'critical')
  const highs     = items.filter(i => i.priority === 'high')
  const others    = items.filter(i => i.priority !== 'critical' && i.priority !== 'high')

  const batch = [...criticals, ...highs, ...others]

  const prompt = `You are Claude Code working on the FreelanceHub platform (Next.js 16+ App Router + Supabase + Tailwind).

The CEO (Alizhan) has approved the following ${batch.length} update(s) from the NEXUS AI department system.
Implement them sequentially, starting with the highest priority items.

${batch.map((item, i) => `
--- UPDATE ${i + 1} ---
ID: ${item.id}
Title: ${item.title}
Department: ${item.dept}
Priority: ${item.priority.toUpperCase()}
Category: ${item.category}
Effort: ${item.effort}
Target version: ${item.version}

Description:
${item.desc}

Implementation hint:
${item.promptHint}
`).join('\n')}

For each update:
1. Read relevant files before making changes
2. Implement cleanly, following existing code patterns
3. No backwards-compatibility shims or unused code
4. Type-safe TypeScript throughout
5. Test that the logic is sound before moving to the next item

Begin implementation now.`

  // 2. Send Telegram notification to admin — two messages:
  //    a) summary card with list of items
  //    b) full prompt as a separate message (copy-paste into Claude Code)
  try {
    const tgToken    = process.env.TELEGRAM_BOT_TOKEN
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID
    if (tgToken && adminChatId) {
      const tgSend = (body: object) =>
        fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

      const batchVersion = batch[0]?.version || 'v?.?.?'
      const itemList = batch.map((i, n) =>
        `${n+1}. [${i.priority.toUpperCase()}] ${i.title}\n   <i>${i.dept}</i>`
      ).join('\n\n')

      // Message 1: Summary card
      await tgSend({
        chat_id: adminChatId,
        parse_mode: 'HTML',
        text:
          `⚡ <b>NEXUS — Батч отправлен в разработку</b>\n` +
          `📦 Версия: <code>${batchVersion}</code> · ${batch.length} обновлений\n\n` +
          `${itemList}\n\n` +
          `🤖 Скопируй промпт из следующего сообщения и вставь в <b>Claude Code CLI</b>`,
        reply_markup: {
          inline_keyboard: [[
            { text: '⚡ Открыть NEXUS', web_app: { url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.freelance-hub.kz'}/admin/nexus` } },
          ]],
        },
      })

      // Message 2: Full prompt (chunk if > 4096 chars)
      const MAX = 4000
      const chunks: string[] = []
      let remaining = prompt
      while (remaining.length > 0) {
        chunks.push(remaining.slice(0, MAX))
        remaining = remaining.slice(MAX)
      }

      for (let ci = 0; ci < chunks.length; ci++) {
        await tgSend({
          chat_id:    adminChatId,
          parse_mode: 'HTML',
          text:
            (chunks.length > 1 ? `📋 <b>Промпт для Claude Code</b> (часть ${ci+1}/${chunks.length}):\n\n` : `📋 <b>Промпт для Claude Code — вставь сюда:</b>\n\n`) +
            `<code>${chunks[ci].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`,
        })
      }
    }
  } catch { /* Telegram optional */ }

  // 3. Log to Supabase nexus_updates table (create if not exists)
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (db as any).from('nexus_updates').insert(
      batch.map(item => ({
        proposal_id: item.id,
        title:       item.title,
        dept:        item.dept,
        priority:    item.priority,
        category:    item.category,
        version:     item.version,
        prompt_hint: item.promptHint,
        submitted_by: user!.id,
        status:      'queued',
      }))
    )
  } catch { /* Table may not exist yet, non-fatal */ }

  // 4. Use Claude to generate an implementation summary (quick analysis)
  let summary = 'Batch queued successfully.'
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `In 3 bullet points, summarize what changes will be made to the FreelanceHub codebase based on these approved items:\n${batch.map(i => `- [${i.priority}] ${i.title}: ${i.promptHint}`).join('\n')}\n\nBe specific about files and components affected. Keep it brief.`,
      }],
    })
    summary = (msg.content[0] as { text: string }).text
  } catch { /* non-fatal */ }

  return NextResponse.json({
    ok:      true,
    count:   batch.length,
    prompt,          // Full prompt — used by NexusClient "Copy for Claude" button
    summary,
  })
}
