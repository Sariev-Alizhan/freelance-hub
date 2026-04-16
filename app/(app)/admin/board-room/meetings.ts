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

  // ══════════════════════════════════════════════════════════════════════════
  // MEETING #4 — Freemium Strategy, Goals & Calendar, Calculator, Role Switching
  // VP Report delivered to President Alizhan Sariyev
  // ══════════════════════════════════════════════════════════════════════════
  {
    id:       'mtg-004',
    number:   4,
    date:     '2026-04-16',
    title:    'Freemium Model + Goals/Calendar + Role Switching',
    subtitle: 'VP Report: 4 strategic initiatives — freemium tiers, freelancer goal system, income calculator, client↔freelancer role toggle',
    category: 'Product Strategy',
    priority: 'critical',
    decision: 'approved',
    participants: ['VP Product', 'CTO', 'Head of Design', 'CFO', 'CMO', 'Head of Growth', 'AI Lead'],
    agenda: `
      President Alizhan Sariyev commissioned this report on April 16, 2026.

      Four topics on the table:
      1. FREEMIUM MODEL — define exactly what is free forever vs. what is paid. Both freelancers and clients.
      2. GOALS & CALENDAR — premium tool for freelancers to set income goals (e.g. ₸1,000,000/week),
         get AI-calculated breakdown (X orders at Y price), track daily progress, manage schedule.
      3. INCOME CALCULATOR — interactive tool: enter goal → AI calculates orders/price needed by profile.
      4. ROLE SWITCHING — users can be both client and freelancer without re-registering. One account, two modes.

      This report consolidates positions from all departments and delivers a final VP recommendation.
    `.trim(),
    proposals: [
      {
        dept: 'Product',
        emoji: '📦',
        color: '#06b6d4',
        verdict: 'for',
        points: [
          '--- FREEMIUM TIERS ---',
          'FREE FOREVER (Freelancer): create profile, apply to 5 orders/month, receive messages, receive reviews, access public job board, basic AI search.',
          'FREE FOREVER (Client): post 2 orders/month, hire freelancers, basic messaging, leave reviews.',
          'PREMIUM (Freelancer) ₸3,900/mo: unlimited applications, Goals & Calendar, Income Calculator, AI resume builder, profile promotion, analytics, priority in search results, AI assistant unlimited.',
          'PREMIUM (Client) ₸2,900/mo: unlimited order posting, AI-match (top 3 freelancers auto-suggested), bulk hiring tools, contract templates, invoice generator.',
          'PRO STUDIO ₸7,900/mo: all premium features for both roles + all AI modules + API access.',
          'Philosophy: free tier is genuinely useful (no "crippled free"). Premium adds power tools — Goals, Calendar, AI Calculator are the core premium hooks for freelancers.',
          '--- GOALS & CALENDAR ---',
          'Goal types: Income goal (₸/week, ₸/month), Order count goal (N orders/period), Work hours goal (X hours/day), Response rate goal (reply within Y hours).',
          'Calendar view: weekly + monthly. Each day shows: scheduled tasks from active orders, self-set work blocks, reminder notifications, deadline markers from contracts.',
          'Progress ring: visual donut chart showing % toward weekly income goal. Updates daily based on completed orders.',
          'Streak system: "14-day streak — working every day". Gamification boosts daily retention. Streak badge shown on profile (social proof).',
          '--- ROLE SWITCHING ---',
          'One account, two modes: "Freelancer Mode" and "Client Mode". Toggle in header (dropdown or toggle pill).',
          'Mode determines: which dashboard shows, which nav links appear, what AI suggests, which onboarding tips show.',
          'DB: profiles table already has role column. Add dual_role boolean. When true, show role switcher UI.',
          'Edge case: users who registered as freelancer and want to post an order → one click to switch to Client Mode, post order, switch back.',
        ],
      },
      {
        dept: 'CTO / Engineering',
        emoji: '⚙️',
        color: '#7170ff',
        verdict: 'for',
        points: [
          '--- INCOME CALCULATOR ---',
          'Core formula: Goal ÷ avg_order_price = orders_needed. avg_order_price derived from user\'s profile category + historical platform data.',
          'Personalization: if user has completed orders, use their actual avg. If new, use category median (e.g. Development = ₸75,000, Design = ₸45,000, Copywriting = ₸15,000).',
          'Time factor: "To earn ₸1,000,000 in 7 days → 13.3 orders at your avg price of ₸75,000. That\'s 1.9 orders/day. Based on your current response rate, this is Achievable."',
          'Difficulty rating: Impossible / Hard / Achievable / Easy — calculated from historical completion rate in category + user\'s active order count.',
          'No external API needed — all data already in Supabase. Pure frontend math + one DB query for category median.',
          '--- GOALS DB SCHEMA ---',
          'New table: freelancer_goals (id, user_id, type, target_amount, target_currency, period_type [week/month/custom], start_date, end_date, created_at).',
          'New table: goal_progress (id, goal_id, date, amount_earned, orders_completed, hours_worked). Updated nightly via cron job or on order completion.',
          'Calendar: store work blocks in freelancer_schedule (id, user_id, date, start_time, end_time, label, color). No external calendar sync needed in v1.',
          '--- ROLE SWITCHING ---',
          'DB change: ALTER TABLE profiles ADD COLUMN dual_role boolean DEFAULT false. When user requests role switch → set dual_role = true.',
          'Route logic in proxy.ts: read user role + dual_role → inject x-user-mode cookie. Dashboard reads cookie to render correct view.',
          'Estimated dev time: Goals+Calendar = 4 days. Calculator = 1 day. Role switch = 2 days. Total: 7 days for full sprint.',
        ],
      },
      {
        dept: 'Finance / CFO',
        emoji: '💰',
        color: '#22c55e',
        verdict: 'for',
        points: [
          '--- REVENUE PROJECTION ---',
          'Premium Freelancer (₸3,900/mo): if 5% of 10,000 freelancers convert = 500 subscribers = ₸1,950,000/mo (≈$3,900/mo).',
          'Premium Client (₸2,900/mo): if 3% of 5,000 clients convert = 150 subscribers = ₸435,000/mo (≈$870/mo).',
          'Combined subscription MRR at modest 5% conversion: ₸2,385,000/mo. At 10% conversion: ₸4,770,000/mo.',
          'Goals & Calendar is the killer feature — it gives freelancers a REASON to upgrade. "This tool will help you earn ₸1M this week" is a direct ROI pitch.',
          '--- PRICING RATIONALE ---',
          '₸3,900 = 13 cups of coffee in Almaty = 0.5% of a ₸750,000 monthly income goal. ROI is obvious.',
          'Annual billing discount: pay ₸39,000/year (save 2 months). Annual subscribers have 4× lower churn.',
          'Freemium limit (5 applications/month) is the natural conversion trigger — power users hit it in week 1.',
          'Do NOT charge for basic messaging or viewing profiles — these are network effects, not premium features.',
          '--- FREEMIUM ECONOMICS ---',
          'Free users cost us ~$0.08/month in infrastructure. Premium users generate ₸3,900. CAC payback: 3-4 months. LTV:CAC ratio > 5:1 at scale.',
        ],
      },
      {
        dept: 'Marketing / CMO',
        emoji: '📣',
        color: '#27a644',
        verdict: 'for',
        points: [
          '--- POSITIONING ---',
          'Free tier message: "Work on FreelanceHub — 0% commission, no hidden fees, forever free." → mass acquisition, word of mouth.',
          'Premium message: "Hit your income goals every week. Premium gives you the tools to earn ₸1,000,000/month — not just hope for it." → ROI-based pitch.',
          '--- GOALS FEATURE AS MARKETING HOOK ---',
          'Shareable goal cards: user sets goal ₸1M/week → achieves it → platform generates a shareable image "I earned ₸1,024,500 this week on FreelanceHub 🔥" → posts to Instagram/Telegram.',
          'This is our viral loop: every goal achievement = free marketing post. Each post reaches 200-2,000 followers in our exact target demographic.',
          'Community leaderboard: "Top earners this week" — public list of highest-earning freelancers (opt-in). Creates aspiration. FOMO drives premium upgrades.',
          '--- ROLE SWITCHING AS ACQUISITION ---',
          '"Be your own client. Hire other freelancers for your projects while also taking orders." → unlocks referral from existing freelancers who also have their own projects.',
          'Many top freelancers earn ₸1M+ and outsource work — they are also clients. Role switching captures this dual behavior and increases GMV.',
          '--- LAUNCH CAMPAIGN ---',
          'Week 1: "FreelanceHub Premium: Set your income goal. We calculate how to get there." — focus on Goals feature in all ads.',
          'Week 2: User generated content push — prompt 10 premium users to post their goal achievement story on Telegram.',
          'Goal: 200 premium subscribers in first 30 days post-launch.',
        ],
      },
      {
        dept: 'Design',
        emoji: '🎨',
        color: '#f59e0b',
        verdict: 'for',
        points: [
          '--- GOALS & CALENDAR UI ---',
          'Goal creation: modal with 3 steps: (1) choose goal type (Income/Orders/Hours), (2) set amount + timeframe, (3) see instant AI calculation. Animated, satisfying.',
          'Dashboard widget: prominent "Weekly Goal" card at top of dashboard. Progress ring (SVG donut) + "₸340,000 of ₸1,000,000" + days remaining countdown.',
          'Calendar: clean week view. Color-coded blocks: blue = work time, green = completed order, red = deadline, gray = personal block. No clutter.',
          'Calculator page: single-screen interactive widget. Slider for goal amount → instant calculation update → "Start Your Goal" CTA → upgrade prompt if not premium.',
          '--- ROLE SWITCHER UI ---',
          'Header pill: "👤 Freelancer ↕ Client" toggle. Smooth animation on switch. Active mode highlighted in primary color.',
          'Dashboard morphs: role switch triggers page transition → different cards, different quick actions, different AI suggestions.',
          'Onboarding flow: "You switched to Client Mode. Here\'s how to post your first order →" — contextual guidance on first switch.',
          '--- PREMIUM UPGRADE FLOW ---',
          'Paywall: soft gate — show feature preview with blur overlay + "Upgrade to Premium" CTA. Never hard-block or show error.',
          'Calculator is partially free: basic calculation available to all. "Personalized calculation based on your profile history" → Premium only.',
        ],
      },
      {
        dept: 'AI Lead',
        emoji: '🤖',
        color: '#8b5cf6',
        verdict: 'for',
        points: [
          '--- AI INSIDE GOALS ---',
          'AI Goal Coach: when user sets a goal, AI analyzes their profile → generates a weekly action plan: "Monday: apply to 3 Design orders. Tuesday: follow up on pending applications. Thursday: optimize portfolio..."',
          'Smart nudges: push notification at 5pm if user hasn\'t applied to any orders that day. "You\'re ₸240,000 behind your weekly goal. 3 matching orders are waiting for you."',
          'Goal difficulty prediction: ML model (simple logistic regression on Supabase data) predicts probability of achieving goal based on user history + current market conditions.',
          '--- AI INSIDE CALCULATOR ---',
          'Beyond simple math: "At your current response rate of 34%, you\'ll need to apply to 39 orders to get 13 accepted. Here are 15 orders posted today that match your skills."',
          'Adaptive advice: if goal is deemed Impossible → AI suggests a realistic alternative. "₸1M in 7 days is unlikely given your history. ₸400,000 in 7 days is Achievable."',
          '--- AI ROLE SWITCH ---',
          'When user switches to Client Mode → AI context resets: different greeting, different suggestions, client-focused tips.',
          '"Welcome to Client Mode. You have ₸50,000 in your wallet. Here are 3 freelancers matching your usual project type."',
          'Cross-mode AI memory: if you frequently post Design orders in Client Mode, AI in Freelancer Mode says "Your clients often need design work similar to what you do."',
        ],
      },
    ],
    deputyVerdict: `
ВИЦЕ-ПРЕЗИДЕНТ — ФИНАЛЬНОЕ РЕШЕНИЕ (16 апреля 2026)

Уважаемый Президент Ализхан,

По результатам заседания всех департаментов докладываю:

━━━ РЕШЕНИЕ ПО 4 ИНИЦИАТИВАМ ━━━

1. FREEMIUM МОДЕЛЬ — УТВЕРЖДЕНО ✅
   Структура: Free (5 откликов/мес, 2 заказа клиент) → Premium Freelancer ₸3,900/мес → Premium Client ₸2,900/мес → Pro Studio ₸7,900/мес.
   Ключевой принцип: бесплатный уровень должен быть реально полезен — не кастрированная версия, а рабочий инструмент. Деньги берём за инструменты роста, не за базовые функции.
   Срок запуска: Q2 2026, первые 30 дней после этого заседания.

2. ЦЕЛИ + КАЛЕНДАРЬ (PREMIUM) — УТВЕРЖДЕНО ✅
   Это наш главный крючок для конверсии в Premium. "Поставь цель ₸1,000,000 — мы покажем как её достичь" — это конкретный ROI, не абстрактная ценность.
   Реализация: таблицы freelancer_goals + goal_progress + freelancer_schedule в Supabase. Dashboard виджет с кольцом прогресса. Ежедневные AI-напоминания.
   Геймификация: стрики, таблица лидеров, шарящиеся карточки достижений — это наш вирусный контент.

3. КАЛЬКУЛЯТОР ДОХОДОВ — УТВЕРЖДЕНО ✅
   Доступен всем как preview, персонализация (по истории профиля) — только Premium.
   Формула: Цель ÷ средняя стоимость заказа = нужных заказов. + оценка реалистичности по категории.
   Это конвертер: каждый кто посчитает и увидит "Achievable" — захочет Premium чтобы дойти туда.

4. ПЕРЕКЛЮЧЕНИЕ РОЛЕЙ — УТВЕРЖДЕНО ✅
   dual_role boolean в таблице profiles. Режим читается из cookie. Дашборд адаптируется.
   Это открывает новый сегмент: топовые фрилансеры (доход ₸1М+) которые сами являются клиентами — они нанимают субподрядчиков. Сейчас мы их теряем.
   Приоритет реализации: средний. Цели/Калькулятор — сначала.

━━━ ПЛАН РЕАЛИЗАЦИИ ━━━
Неделя 1: Freemium ограничения в proxy.ts + upgrade paywall UI
Неделя 2: Калькулятор (₸-калькулятор, категорийные медианы)
Неделя 3: Goals система (DB + dashboard виджет + progress ring)
Неделя 4: Календарь (week view + work blocks)
Неделя 5: Role switching (dual_role + header toggle + dashboard morph)
Неделя 6: AI coach inside Goals + push notifications

━━━ ПРОГНОЗ ВЫРУЧКИ ━━━
Консервативно (5% конверсия): ₸2,385,000/мес MRR при 15,000 пользователях.
Цель (10% конверсия): ₸4,770,000/мес — достижимо через 6 месяцев.
Goals+Calendar — это причина #1 для апгрейда. Без этой фичи конверсия < 2%. С ней — 7-10%.

Вице-президент по продукту,
FreelanceHub Executive Team
    `.trim(),
    presidentNote: `Принято. Начинаем с Калькулятора и Целей — это наш главный аргумент для Premium. Роль-свитчер делаем параллельно. Жду первый деплой через неделю.`,
    actionItems: [
      'CTO: ALTER TABLE profiles ADD COLUMN dual_role boolean; CREATE TABLE freelancer_goals; CREATE TABLE goal_progress',
      'CTO: implement freemium gates in proxy.ts — check subscription before allowing >5 applications',
      'Product: build /dashboard/goals page — goal creation modal + progress ring widget',
      'Product: build /dashboard/calculator page — income goal calculator with category medians',
      'Design: design goal creation flow, progress ring component, role switcher pill in header',
      'Finance: create Premium Freelancer + Premium Client products in payment system (₸3,900 / ₸2,900)',
      'Marketing: prepare goal achievement shareable card template for virality',
      'AI Lead: build Goal Coach prompt — weekly action plan generator based on user profile + goal',
    ],
    revenueEstimate: '₸2,385,000/мес MRR (консервативно) → ₸4,770,000/мес при 10% конверсии',
  },
]
