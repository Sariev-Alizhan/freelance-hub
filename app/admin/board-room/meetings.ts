// ════════════════════════════════════════════════════════════════════════════
// BOARD ROOM — Executive Meeting Records
// Every major company decision is logged here.
// Format: proposals by dept → debate → Deputy Director decision → President review
// ════════════════════════════════════════════════════════════════════════════

export type Decision = 'approved' | 'rejected' | 'in_review' | 'implementing'
export type Priority  = 'critical' | 'high' | 'medium'

export interface DeptProposal {
  dept:    string
  emoji:   string
  color:   string
  points:  string[]           // bullet points from this dept
  verdict: 'for' | 'against' | 'neutral'
}

export interface Meeting {
  id:          string
  number:      number
  date:        string          // ISO
  title:       string
  subtitle:    string
  category:    string
  priority:    Priority
  decision:    Decision
  participants: string[]
  agenda:      string          // what was discussed
  proposals:   DeptProposal[]
  deputyVerdict: string        // deputy director final word
  presidentNote?: string       // optional CEO note
  actionItems:  string[]       // what happens next
  revenueEstimate?: string     // projected revenue if implemented
}

export const MEETINGS: Meeting[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // MEETING #3 — RP Game Development Module
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:       'mtg-003',
    number:   3,
    date:     '2026-04-15',
    title:    'RP Game Development Module',
    subtitle: 'Dedicated AI-powered vertical for GTA RP, mobile RP, and game server developers',
    category: 'New Product Vertical',
    priority: 'high',
    decision: 'approved',
    participants: ['CEO', 'CTO', 'AI Lead', 'Product', 'Marketing', 'Design', 'Finance'],
    agenda: `
      CEO Alizhan proposed adding a dedicated module for RP game server developers.
      Market context: GrandMobile (1M+ players), BlackRussia (800K+ players), Arizona RP (SA:MP, 2M+ players),
      FiveM (3M+ concurrent players globally). CIS is the #1 market for RP games worldwide.
      These developers need: PAWN/Lua/C# coders, server admins, web panel developers, designers, community managers.
      Proposal: create /rp-dev vertical with AI trained on RP game development context.
    `.trim(),
    proposals: [
      {
        dept: 'CTO / Engineering',
        emoji: '⚙️',
        color: '#7170ff',
        verdict: 'for',
        points: [
          'RP tech stack is well-defined: SA:MP/CRMP = PAWN + MySQL; FiveM = Lua + C# + JS; RageMP = JS/TS; Mobile (GrandMobile/BlackRussia) = Unity C# + PHP/Node.js backend',
          'We can fine-tune Claude with PAWN syntax, SA:MP include libraries (a_samp, a_actor, streamer), common RP system patterns (faction systems, economy, property)',
          'FiveM resource development (Lua + cfx.re API) + ESX/QBCore framework knowledge = huge demand among 15K+ active FiveM server developers',
          'Dedicated /api/rp-ai/chat route with system prompt pre-loaded with RP context: PAWN stdlib, SA:MP native functions, MySQL schema patterns for RP servers',
          'GitHub integration: connect repo → AI reads existing PAWN/Lua scripts → suggests optimizations + bug fixes',
          'Estimated dev time: 2 weeks for MVP (AI chat + freelancer vertical + job board filtered by RP skills)',
        ],
      },
      {
        dept: 'Product',
        emoji: '📦',
        color: '#06b6d4',
        verdict: 'for',
        points: [
          'Market size: 50,000+ active RP server developers in CIS alone. FiveM has 100,000+ server owners globally. Each needs: scripters, designers, translators, admins',
          'Pain point: RP developers can\'t find PAWN developers on Upwork or Fiverr. They use VK groups and Telegram chats — zero structured marketplace. We fill this gap.',
          'Product proposal: /rp-dev page with category filter pre-set to RP skills (PAWN, Lua, FiveM, RageMP, Unity C#, SA:MP). AI assistant pre-trained on RP context.',
          'Subscription module: "RP Dev Pro" — $29/month: AI co-pilot, unlimited code generation, dedicated RP job board, server status monitoring integration',
          'Unique feature: AI reads your server\'s .pwn files → auto-generates documentation + finds bugs + suggests optimizations. No other platform offers this.',
          'NPS prediction: RP community is extremely loyal. If we solve their problem, they promote us within their community (Discord servers, Telegram chats, YouTube)',
        ],
      },
      {
        dept: 'Marketing',
        emoji: '📣',
        color: '#27a644',
        verdict: 'for',
        points: [
          'RP game community is hyper-concentrated: YouTube channels (GrandMobile Official: 800K subs), VK groups (Arizona RP: 1.5M members), Telegram chats (FiveM RU: 50K+ members)',
          'Strategy: post in @grandmobilegame, @blackrussiarp, @arizonarp_official, FiveM Discord. One relevant post = 10K views from exactly our target audience',
          'Influencer partnerships: top SA:MP/FiveM tutorial YouTubers (30K-200K subs). "FreelanceHub найдёт тебе PAWN-скриптера за 1 час" = perfect pitch',
          'SEO opportunity: "нанять PAWN разработчика", "FiveM scripter hire", "SA:MP developer freelance" — zero competition on these keywords',
          'Content marketing: "Как построить свой RP сервер с нуля" — Habr article + YouTube tutorial = organic traffic from the exact niche',
          'Estimated CAC: <$5 per user (niche community, word-of-mouth driven)',
        ],
      },
      {
        dept: 'Finance',
        emoji: '💰',
        color: '#22c55e',
        verdict: 'for',
        points: [
          'Revenue model: 8% escrow fee on all RP-related orders. Average RP project = $500-$5000 (full server script). Average fee per deal = $40-$400.',
          '"RP Dev Pro" subscription: $29/month × 1,000 subscribers = $29K MRR in Year 1. Conservative estimate.',
          'Market comparison: RP developers currently pay $200-$500/month for custom script development. Our platform reduces this by 60% through competition.',
          'Adjacent monetization: server hosting referrals (Hetzner/DigitalOcean affiliate), game asset marketplace commission, server template sales (70/30 split)',
          'Scenario: 500 active RP projects/month × $1,500 avg value × 8% = $60,000/month GMV contribution. Achievable in 6 months.',
        ],
      },
      {
        dept: 'Design',
        emoji: '🎨',
        color: '#f59e0b',
        verdict: 'for',
        points: [
          'Visual identity: dark gaming aesthetic — deep purple/dark background, neon green accents. Feels like GTA night city loading screen. Different from main platform.',
          '/rp-dev landing page: hero with animated server status widget, sample PAWN code snippet with syntax highlighting, "Find your scripter in 60 min" CTA',
          'AI chat interface for RP module: code editor-style — Monaco editor embed, syntax highlighting for PAWN/Lua/JS, diff view for suggestions',
          'Mobile design: RP community is mobile-heavy (Telegram, VK). Bottom sheet for AI chat. Collapsible code blocks.',
        ],
      },
    ],
    deputyVerdict: `APPROVED. RP game development is an underserved niche with a passionate, concentrated CIS community. We have a unique advantage: our AI can be specialized for PAWN/Lua/FiveM scripting where Upwork and Fiverr offer nothing. Sprint 1: build /rp-dev page + AI chat endpoint with RP context. Sprint 2: RP Pro subscription tier. Target: 200 RP developers registered within 30 days of launch.`,
    presidentNote: `Отличный рынок. Я сам видел как разработчики RP серверов ищут программистов в Telegram по часу — это наша аудитория. Делаем.`,
    actionItems: [
      'CTO: create /api/ai/rp-assistant route with RP-trained system prompt (PAWN, Lua, FiveM context)',
      'Product: create /rp-dev public page with filtered job board + AI co-pilot widget',
      'Design: dark gaming theme for /rp-dev, Monaco code editor integration for AI chat',
      'Marketing: post in top 10 RP Telegram channels day of launch',
      'Finance: create "RP Dev Pro" subscription tier at $29/month in Stripe/LemonSqueezy',
    ],
    revenueEstimate: '$60,000/month GMV contribution within 6 months',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MEETING #2 — Subscription Modules System
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:       'mtg-002',
    number:   2,
    date:     '2026-04-15',
    title:    'Industry Subscription Modules',
    subtitle: 'Vertical SaaS modules sold on top of the base marketplace — each priced separately',
    category: 'Monetization',
    priority: 'critical',
    decision: 'approved',
    participants: ['CEO', 'Product', 'Finance', 'Marketing', 'CTO'],
    agenda: `
      How do we monetize beyond the 8% escrow fee?
      Product proposed industry-specific AI modules sold as monthly subscriptions.
      Each module = AI trained on specific domain + specialized job board + niche tools.
      Discussion: which verticals to target, pricing, how to bundle vs. unbundle.
    `.trim(),
    proposals: [
      {
        dept: 'Product',
        emoji: '📦',
        color: '#06b6d4',
        verdict: 'for',
        points: [
          'MODULE 1 — RP Game Dev ($29/mo): PAWN/Lua/FiveM AI, script analysis, RP-specific job board. See Meeting #3.',
          'MODULE 2 — Legal & Contracts ($19/mo): AI lawyer trained on KZ/RU/EU law. Generates contracts, checks NDAs, explains terms. Freelancers protected on every deal.',
          'MODULE 3 — Design AI ($24/mo): Stable Diffusion + DALL-E for generating mockups, social media assets, portfolio previews. Integrated Figma-style preview.',
          'MODULE 4 — SMM & Marketing ($19/mo): AI content calendar generator, caption writer (RU/EN/KK), competitor analysis tool, hashtag suggester for CIS platforms.',
          'MODULE 5 — E-commerce Dev ($29/mo): AI specialized in Shopify, WooCommerce, 1C-Bitrix (huge in CIS). Generates product descriptions, store configurations.',
          'MODULE 6 — Mobile Dev ($39/mo): AI for Flutter/React Native. Code generation, app architecture, Play Store/App Store optimization tips.',
          'MODULE 7 — Blockchain & Web3 ($49/mo): Solidity contract templates, security audit AI, NFT project builder. For crypto-native CIS developers.',
          'BUNDLE — "Pro Studio" ($89/mo, all modules): Power users, agencies, studios. 3× better value than buying individually.',
        ],
      },
      {
        dept: 'Finance',
        emoji: '💰',
        color: '#22c55e',
        verdict: 'for',
        points: [
          'LTV model: avg module user stays 8 months. $29/mo × 8 = $232 LTV per user. At 1,000 subscribers = $232K total LTV.',
          'Pricing strategy: anchor on $89 bundle, make individual modules feel cheap. Conversion: 40% of module users upgrade to bundle.',
          'Cross-sell: every module page shows "Also available in Pro Studio". Upsell during AI chat: "Upgrade to Legal Module for contract generation".',
          'Churn mitigation: monthly usage reports emailed to subscribers. "You saved 4 hours this month using Contract AI" = retention.',
          'Year 1 projection: 500 module subscribers avg $35/month = $17,500 MRR. Modest but recurring and scalable.',
          'Revenue stack: 8% escrow GMV + Premium subscriptions + Module subscriptions + Featured ads + Certification sales = diversified revenue',
        ],
      },
      {
        dept: 'CTO / Engineering',
        emoji: '⚙️',
        color: '#7170ff',
        verdict: 'for',
        points: [
          'Technical approach: each module = a system prompt + optional tool set. No separate infrastructure needed. Build on existing AI chat API.',
          'Gating: check user subscription in /api/ai/[module]/chat middleware. Return 402 if no active module subscription.',
          'Database: add modules_subscriptions table (user_id, module_slug, expires_at). Check via RLS.',
          'Time to ship first module (Legal): 3 days. System prompt + UI tab + subscription check + LemonSqueezy product. Reuse existing patterns.',
          'Monaco editor: integrate for code-related modules (RP Dev, Mobile Dev, Blockchain). Already proven in War Room plan.',
        ],
      },
      {
        dept: 'Marketing',
        emoji: '📣',
        color: '#27a644',
        verdict: 'for',
        points: [
          'Launch strategy: release one module per week. Each launch = separate Product Hunt post + Telegram post + LinkedIn article. 7 weeks of content.',
          'Trial: 7-day free trial on each module. No CC required. 35% of trial users convert to paid (industry benchmark).',
          'Partnership: partner with relevant communities per module. RP module → RP Discord. Legal module → freelancer rights Telegram groups. SMM module → SMM managers VK groups.',
        ],
      },
    ],
    deputyVerdict: `APPROVED. Subscription modules are our path to MRR (Monthly Recurring Revenue) — the most valuable revenue type for valuation. We launch Legal Module first (lowest dev cost, highest perceived value for freelancers). Then RP Dev Module (unique niche, zero competition). Then SMM Module. Each launch is a separate marketing event. Target: $20K MRR from modules by Q3 2026.`,
    actionItems: [
      'Product: create /modules landing page showing all available modules with pricing',
      'Finance: create LemonSqueezy products for each module',
      'CTO: build module subscription check middleware + modules_subscriptions DB table',
      'Design: module card UI with activation/upgrade flow',
      'Marketing: module launch calendar — 1 per week starting Week 2 post-launch',
    ],
    revenueEstimate: '$20,000 MRR from module subscriptions by Q3 2026',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // MEETING #1 — Market Expansion: What Else Can We Add?
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:       'mtg-001',
    number:   1,
    date:     '2026-04-15',
    title:    'New Market Verticals Brainstorm',
    subtitle: 'All departments scan every market for untapped opportunities on our platform',
    category: 'Strategy',
    priority: 'high',
    decision: 'in_review',
    participants: ['CEO', 'All Departments', 'AI Models'],
    agenda: `
      Full company brainstorm: what other verticals, markets, and product lines can we add to FreelanceHub?
      Goal: identify the top 10 opportunities we haven't built yet.
      Each department brings 3 ideas. AI models (Claude + Llama) also contribute.
      Output: prioritized list with revenue estimates.
    `.trim(),
    proposals: [
      {
        dept: 'Product',
        emoji: '📦',
        color: '#06b6d4',
        verdict: 'for',
        points: [
          'AI TALENT AGENCY: Platform becomes talent agent. AI matches client to freelancer AND negotiates terms on behalf of freelancer. Freelancer sets min price, AI maximizes deal value. Revenue: 3% agent fee on top of 8% platform fee.',
          'CORPORATE TRAINING MARKETPLACE: companies hire freelancers to train their employees. HR buys "5 hours of Python training" as a subscription. B2B SaaS on top of marketplace.',
          'HACKATHON PLATFORM: companies post hackathon challenges, developers compete, winner gets contract + cash prize. We take 15% of prize pool. Kaspi Bank could sponsor.',
          'MICRO-TASK MARKETPLACE: tasks priced at $5-$50. Logo feedback, code review, proofreading, data labeling. Volume play — 1000 micro-tasks/day at $0.5 fee = $500/day.',
        ],
      },
      {
        dept: 'Marketing',
        emoji: '📣',
        color: '#27a644',
        verdict: 'for',
        points: [
          'CREATOR ECONOMY HUB: YouTubers, TikTokers, Telegram channel owners hire video editors, thumbnail designers, script writers. CIS creator economy is $2B+ and growing.',
          'EDUCATION TECH VERTICAL: tutors + students. AI-matched tutor finder. Hourly sessions with built-in video call (Jitsi embed). $15-$100/hour sessions = high GMV.',
          'LOCAL SERVICES: plumber, electrician, courier — offline services booked online. Uber-for-services model. Kazakhstan has no dominant player in this space.',
          'B2G (Business to Government): government agencies post tenders on platform. Already done in Saudi Arabia (Fiverr Enterprise). KZ government is digitalizing.',
        ],
      },
      {
        dept: 'CTO / Engineering',
        emoji: '⚙️',
        color: '#7170ff',
        verdict: 'for',
        points: [
          'AI AGENT MARKETPLACE: AI agents (GPT bots, automation scripts) listed and sold like freelancers. Agent accepts job, completes it, earns money. Fully autonomous.',
          'CODE REVIEW AS A SERVICE: developer posts PR → AI + human reviewer gives feedback within 2 hours → $20-$100 per review. GitHub webhook integration.',
          'SERVER & INFRASTRUCTURE MARKETPLACE: sysadmins sell managed hosting, VPS setup, security audits. Backend infrastructure market is $50B globally.',
          'OPEN SOURCE BOUNTY BOARD: companies post bounties for OSS bug fixes. Developers fix, get paid. We take 10%. Connects corporate sponsors with OSS contributors.',
        ],
      },
      {
        dept: 'Finance',
        emoji: '💰',
        color: '#22c55e',
        verdict: 'for',
        points: [
          'INVOICE FACTORING: freelancer completes job → we pay them immediately → collect full payment from client in 30 days → we keep 2%. Solves cash flow problem.',
          'FREELANCER LOANS: data-driven micro-loans based on platform earnings history. Freelancer needs equipment — we loan $500 at 8% APR. Fully collateralized by future earnings.',
          'INSURANCE MODULE: offer freelancer income protection insurance ($5/month). Partner with KZ insurance companies. Platform takes 20% referral commission.',
          'CRYPTO PAYROLL: companies pay freelancers in USDT automatically every Friday. Zero cross-border banking fees. Huge for CIS-to-EU/UAE freelancers.',
        ],
      },
      {
        dept: 'AI Lead / Claude',
        emoji: '🤖',
        color: '#8b5cf6',
        verdict: 'for',
        points: [
          'AUTONOMOUS AI FREELANCERS: AI agents registered as platform users. They bid on jobs, complete text/code/data tasks autonomously, get rated, build reputation. First AI-native marketplace. Revenue: 100% of AI freelancer earnings go to platform.',
          'AI DUE DILIGENCE: before client hires freelancer, AI scans their entire history, external mentions, GitHub repos, verifies claims. $10 per check. Trust infrastructure.',
          'PREDICTIVE MATCHING: AI predicts which freelancer will complete a job with highest satisfaction score based on 50+ signals. Clients pay $5 for "AI-guaranteed match".',
          'CONTENT PIPELINE: clients describe project → AI generates full content brief → automatically posts to 5 platforms (Telegram, Reddit, LinkedIn, VK, Freelancers.ru) → candidates apply → AI screens and ranks applicants. End-to-end automated hiring.',
        ],
      },
    ],
    deputyVerdict: `IN REVIEW. Too many good ideas to implement at once. Prioritization matrix: (1) AI Talent Agency — highest revenue upside, build in Q2. (2) Creator Economy Hub — largest CIS TAM, launch vertical in Q2. (3) Micro-task Marketplace — volume play, Q3. (4) Education Tech — long sales cycle, Q4. (5) Invoice Factoring + Loans — requires financial licensing, 2027. All others catalogued in War Room for future sprints. Next meeting: vote on Q2 roadmap.`,
    presidentNote: `AI Freelancers идея — это наше будущее. Когда у нас будет 1000 AI-агентов как фрилансеров на платформе — это уже не конкурент Upwork, это что-то новое.`,
    actionItems: [
      'Product: prepare 1-pager on AI Talent Agency feature for next meeting',
      'Marketing: research Creator Economy Hub — top 50 CIS YouTubers/TikTokers needs',
      'CTO: architecture proposal for AI Agent freelancer accounts',
      'All: vote on Q2 priority in /vote page (democratic governance)',
    ],
    revenueEstimate: 'Combined potential: $500K+ MRR at 100K users across all verticals',
  },
]
