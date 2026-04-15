'use client'

import { useState } from 'react'
import {
  DollarSign, Megaphone, Share2, Lightbulb, Globe,
  ChevronDown, ChevronUp, ExternalLink, Target, Star,
  TrendingUp, Users, Zap, MessageSquare, Radio,
  Briefcase, Heart, Award, BookOpen, Coffee
} from 'lucide-react'

// ════════════════════════════════════════════════════════════════════════════
// WAR ROOM — FreelanceHub Command Center
// All departments. All ideas. One page.
// ════════════════════════════════════════════════════════════════════════════

type TabId = 'funding' | 'pr' | 'social' | 'ideas' | 'design'

// ── FUNDING DATA ─────────────────────────────────────────────────────────────
const FUNDS = [
  // Kazakhstan / CIS — Tier 1 (fastest path, know the market)
  {
    name: 'QazTech Ventures',
    type: 'Government VC',
    country: '🇰🇿 Kazakhstan',
    focus: 'Digital Kazakhstan program. IT startups, B2B SaaS, marketplace',
    check: '$50K–$500K',
    stage: 'Pre-seed / Seed',
    fit: 'perfect',
    contact: 'qaztech.kz',
    action: 'Submit via Digital Kazakhstan portal. Mention 139 SEO pages, AI layer, KZT escrow.',
    notes: 'Government grant — no equity at early stage. Fastest path to first $50K.',
  },
  {
    name: 'Almaz Capital Partners',
    type: 'VC Fund',
    country: '🇰🇿🇷🇺 CIS',
    focus: 'B2B SaaS, marketplaces, EdTech. CIS expansion. 50+ portfolio companies.',
    check: '$500K–$3M',
    stage: 'Seed / Series A',
    fit: 'perfect',
    contact: 'almazcapital.com',
    action: 'Cold email via LinkedIn. Subject: "AI-native freelance marketplace — Kazakhstan, 139 indexed pages, v1.0-rc launch".',
    notes: 'Invested in Mail.ru early. Strong CIS operator network. Will open doors in Russia/Ukraine/Belarus.',
  },
  {
    name: 'Startup Wise Guys',
    type: 'Accelerator',
    country: '🇪🇪 Estonia / CIS focus',
    focus: 'B2B SaaS. Runs CIS-specific cohorts. $30K for 8% equity + mentor network.',
    check: '$30K + network',
    stage: 'Pre-seed',
    fit: 'high',
    contact: 'startupwiseguys.com',
    action: 'Apply to next CIS cohort. Highlight: KZT payments, Telegram-first, AI escrow, democratic governance.',
    notes: 'Best accelerator for CIS B2B. Alumni network across Baltic + CIS. Demo Day in Tallinn = EU investor access.',
  },
  {
    name: '500 Global (500 Startups)',
    type: 'Accelerator',
    country: '🇺🇸 Global / MENA',
    focus: 'Marketplaces, FinTech, AI. Strong MENA/CIS track record.',
    check: '$150K for 6%',
    stage: 'Pre-seed',
    fit: 'high',
    contact: '500.co/apply',
    action: 'Apply with global expansion story: CIS → Turkey → UAE → SEA. AI-native = strong thesis fit.',
    notes: 'Batch program 3 months. San Francisco or remote. Alumni: Canva, Grab, Twilio.',
  },
  {
    name: 'Hub71 (Abu Dhabi)',
    type: 'Government Program',
    country: '🇦🇪 UAE',
    focus: 'Tech startups. Free office + $500K investment package for selected startups.',
    check: 'Up to $500K',
    stage: 'Seed',
    fit: 'high',
    contact: 'hub71.com',
    action: 'Apply as "GCC-ready marketplace". Arabic language support already in pitch deck = strong signal.',
    notes: 'UAE is fastest-growing freelance market in MENA. Arabic RTL already in our pitch = show this.',
  },
  {
    name: 'Target Global',
    type: 'VC Fund',
    country: '🇩🇪 Berlin / CIS',
    focus: 'Marketplaces, FinTech, Future of Work. $800M AUM.',
    check: '$1M–$5M',
    stage: 'Seed / Series A',
    fit: 'medium',
    contact: 'target.global',
    action: 'Reach out after 1K registered users milestone. Lead with: 8% take rate × GMV at scale = $48M/year.',
    notes: 'Invested in BlaBlaCar, Rapyd, monday.com. Want traction before meeting.',
  },
  {
    name: 'Y Combinator',
    type: 'Accelerator',
    country: '🇺🇸 USA',
    focus: 'Everything. $500K for 7%. Most prestigious accelerator globally.',
    check: '$500K for 7%',
    stage: 'Pre-seed',
    fit: 'medium',
    contact: 'ycombinator.com/apply',
    action: 'Apply W2027 batch. Need: 10+ paying users, clear revenue model, technical co-founder story.',
    notes: 'Hard to get in without US traction or US-born founder. But worth trying — global network opens doors.',
  },
  {
    name: 'EBRD (European Bank for Reconstruction)',
    type: 'Development Grant',
    country: '🇪🇺 Pan-European / CIS',
    focus: 'Digital inclusion, emerging markets, FinTech. Grant programs for Kazakhstan.',
    check: '$100K–$1M grant',
    stage: 'Any',
    fit: 'high',
    contact: 'ebrd.com/work-with-us',
    action: 'Apply via Kazakhstan country office. Pitch: digital labor market inclusion, rural freelancers, KZT escrow.',
    notes: 'Non-dilutive grant. Slow process (3–6 months) but no equity given up. Stack with other funding.',
  },
  {
    name: 'Flint Capital',
    type: 'VC Fund',
    country: '🇮🇱🇺🇸 Tel Aviv / Boston',
    focus: 'SaaS, marketplaces, AI tools. CIS founders = strong preference.',
    check: '$1M–$5M',
    stage: 'Seed',
    fit: 'medium',
    contact: 'flintcap.com',
    action: 'CIS founder story + global vision + AI differentiation. Prepare 1-pager in English.',
    notes: 'Partner Andrey Gershfeld is Kazakhstan-connected. Warm intro through local tech community.',
  },
  {
    name: 'Vercel Startup Program',
    type: 'Tech Grant',
    country: '🌐 Global (online)',
    focus: 'Free Vercel Pro + $500 credits for qualifying startups.',
    check: 'Free hosting + $500',
    stage: 'Pre-seed',
    fit: 'perfect',
    contact: 'vercel.com/startups',
    action: 'Apply immediately. We already deploy on Vercel. Shows investor: low burn rate.',
    notes: 'Also: Supabase has a startup program. Apply to both — free infra = extend runway.',
  },
  {
    name: 'Supabase Startup Program',
    type: 'Tech Grant',
    country: '🌐 Global (online)',
    focus: '$300 Supabase credits for qualifying startups.',
    check: 'Free DB credits',
    stage: 'Any',
    fit: 'perfect',
    contact: 'supabase.com/blog/supabase-startups',
    action: 'Apply with GitHub + live URL. Mention: 139 SEO pages, AI features, active users.',
    notes: 'Stack: Vercel Startup + Supabase Startup + Anthropic API credits = near-zero infra cost.',
  },
  {
    name: 'Anthropic API Credits',
    type: 'Tech Grant',
    country: '🌐 Global',
    focus: '$10K–$50K API credits for AI startups building with Claude.',
    check: 'Up to $50K credits',
    stage: 'Any',
    fit: 'perfect',
    contact: 'anthropic.com/startups',
    action: 'Apply immediately. We use Claude claude-sonnet-4-6. Show AI-native marketplace vision.',
    notes: 'Reduces AI cost to near-zero for first year. Critical for scaling AI features without burn.',
  },
]

// ── PR / MEDIA DATA ───────────────────────────────────────────────────────────
const PR_CHANNELS = [
  // Free — DO FIRST (this week)
  {
    channel: 'Product Hunt',
    category: 'Launch Platform',
    audience: '500K tech early adopters globally',
    effort: 'medium',
    timing: 'Tuesday 12:01 AM PST = peak traffic',
    action: 'Schedule launch. Need: hunter, tagline, GIF demo, 5 makers, 50 upvotes in first hour. Upvote community: PH Ship → notify followers.',
    template: '"FreelanceHub — AI-native freelance marketplace for the next 1B users 🌍"',
    impact: 'critical',
  },
  {
    channel: 'Hacker News — Show HN',
    category: 'Developer Community',
    audience: 'World\'s best engineers + VCs monitor HN daily',
    effort: 'low',
    timing: 'Monday 9 AM ET for max reach',
    action: 'Post: "Show HN: I built an AI-native freelance marketplace for CIS/emerging markets". No hype, technical details, honest challenges.',
    template: '"Show HN: FreelanceHub — AI-powered freelance platform for emerging markets (Kazakhstan-first)"',
    impact: 'critical',
  },
  {
    channel: 'Habr.com',
    category: 'Russian Dev Community',
    audience: '2M Russian-speaking engineers + startup founders',
    effort: 'medium',
    timing: 'Tuesday–Thursday, 10–12 MSK',
    action: 'Write technical article: "Как мы построили AI-фриланс платформу за X месяцев". Include: stack (Next.js 16, Supabase, Claude API), business model, challenges.',
    template: '"Как мы построили первую AI-фриланс платформу для СНГ — технический разбор"',
    impact: 'high',
  },
  {
    channel: 'vc.ru',
    category: 'Russian Business Media',
    audience: '3M Russian-speaking entrepreneurs, investors, managers',
    effort: 'low',
    timing: 'Any weekday',
    action: 'Post company story + early metrics. "Мы запустили AI-маркетплейс для фрилансеров из Казахстана". Include escrow model, Telegram integration, global vision.',
    template: '"FreelanceHub — первый AI-фриланс маркетплейс из Казахстана с выходом на 1 млрд пользователей"',
    impact: 'high',
  },
  {
    channel: 'Telegram — CIS Channels',
    category: 'Direct Audience',
    audience: '10M+ CIS Telegram users in startup/freelance channels',
    effort: 'low',
    timing: '9–11 AM or 7–9 PM Almaty time',
    action: 'Post in: @startupnetwork_kz, @freelance_kz, @kazakhstandigital, @remoteказахстан, @itmiracle, @fintechkz. Short post + screenshot + link.',
    template: '"🚀 Запустили FreelanceHub — AI-помощник для фрилансеров в Казахстане. Ищет работу, советует цены, отправляет уведомления в Telegram. Попробуйте бесплатно: [link]"',
    impact: 'critical',
  },
  {
    channel: 'Reddit',
    category: 'Global Community',
    audience: '50M English-speaking professionals',
    effort: 'low',
    timing: '9 AM EST weekdays',
    action: 'Post in: r/freelance (500K), r/entrepreneur (1.5M), r/SideProject (300K), r/webdev (800K). Value-first posts, not ads.',
    template: '"Built a freelance marketplace with AI price advisor and Telegram notifications — sharing what I learned"',
    impact: 'medium',
  },
  {
    channel: 'Forbes Kazakhstan / tengrinews.kz',
    category: 'National Media',
    audience: '1M Kazakhstani business readers',
    effort: 'medium',
    timing: 'After first 100 registered users',
    action: 'Send press release to: [редакция@forbes.kz], [news@tengrinews.kz]. Angle: "Казахстанский стартап создал AI-платформу для фрилансеров с глобальными амбициями".',
    template: 'Press release with: founding story, AI features, KZT escrow, global expansion plans, first user testimonials.',
    impact: 'high',
  },
  {
    channel: 'Digital Kazakhstan Media',
    category: 'Government-Adjacent',
    audience: 'Ministers, government IT buyers, corporate HR',
    effort: 'medium',
    timing: 'Before applying for QazTech grant',
    action: 'Feature in digital-kazakstan.kz or MICIT newsletter. Angle: Digital Kazakhstan 2025 program support, local IT job creation.',
    template: '"FreelanceHub — цифровая платформа для казахстанских IT-специалистов"',
    impact: 'high',
  },
  {
    channel: 'LinkedIn',
    category: 'Professional Network',
    audience: 'Global founders, investors, CTOs, HR directors',
    effort: 'low',
    timing: 'Tuesday 8–10 AM local time, consistent weekly',
    action: 'CEO posts weekly: build-in-public updates, user stories, revenue milestones, lessons learned. 300 words + 1 screenshot. @mention investors.',
    template: '"Week 12 building FreelanceHub: X registered users, Y orders posted, Z in platform earnings. Here\'s what surprised us..."',
    impact: 'high',
  },
  {
    channel: 'Indie Hackers',
    category: 'Bootstrapper Community',
    audience: '100K+ bootstrappers, micro-SaaS founders, early adopters',
    effort: 'low',
    timing: 'Any time',
    action: 'Create product page + write story. Community loves "build-in-public" and "launched in X months". Share MRR milestones.',
    template: '"How I built a freelance marketplace in [X] months — from idea to first revenue"',
    impact: 'medium',
  },
  {
    channel: 'TechCrunch / The Verge',
    category: 'Global Tech Press',
    audience: '20M global tech readers',
    effort: 'high',
    timing: 'After Series A or major traction milestone',
    action: 'Email journalists who cover Future of Work: @techcrunch Mary Ann Azevedo. Angle: AI-native marketplace, emerging market, CIS opportunity.',
    template: 'Exclusive story: "Meet the startup bringing AI-powered freelancing to Central Asia"',
    impact: 'high',
  },
]

// ── SOCIAL MEDIA STRATEGY ─────────────────────────────────────────────────────
const SOCIAL = [
  {
    platform: 'Telegram Channel',
    handle: '@freelancehubkz',
    audience: 'CIS freelancers, clients, entrepreneurs',
    priority: 1,
    frequency: '2× per day',
    contentTypes: [
      '🔔 "Новый заказ: [категория], бюджет [X]₸ — откликнись первым!" (auto-post from API)',
      '💡 "Совет фрилансеру: как написать отклик который читают до конца"',
      '🏆 "Фрилансер недели: [имя], [N] выполненных заказов"',
      '📊 "Цифра недели: [X]% наших заказчиков возвращаются снова"',
      '🚀 "Новая функция: [название] — уже в приложении"',
    ],
    kpi: '10K subscribers in 3 months',
    tools: 'Bot auto-posts new orders. Manual posts via Telegram web.',
  },
  {
    platform: 'Instagram',
    handle: '@freelancehub.kz',
    audience: 'Young professionals, 18–35, CIS + UAE',
    priority: 2,
    frequency: '1 post/day + 3 Stories',
    contentTypes: [
      '🖼️ "Фрилансер месяца" — фото+история+доход (success stories)',
      '📱 Product screenshots — "Наш AI советует цену за [навык]: [X]₸"',
      '🎯 Reels: "Как за 30 секунд создать заказ и получить 5 откликов"',
      '📸 Behind the scenes: команда, офис, встречи',
      '📣 Stories: опросы "Какой навык самый востребованный?"',
    ],
    kpi: '5K followers in 3 months',
    tools: 'Later or Buffer for scheduling. Canva for templates.',
  },
  {
    platform: 'TikTok / Instagram Reels',
    handle: '@freelancehubkz',
    audience: 'Gen Z + Millennials, 16–28',
    priority: 2,
    frequency: '1 video/day',
    contentTypes: [
      '"Зарабатываю [X]₸ в месяц на фрилансе — вот как"',
      '"AI назвал цену за мой навык [разработка] — [X]₸/час"',
      '"Отправил отклик → получил ответ за 2 часа → заработал [X]₸"',
      '"5 ошибок в отклике которые убивают сделку"',
      '"Создал заказ на FreelanceHub за 30 секунд — вот результат"',
    ],
    kpi: '1 viral video (100K+ views) = 1000 sign-ups',
    tools: 'CapCut for editing. Trend sounds. Hook in first 2 seconds.',
  },
  {
    platform: 'LinkedIn',
    handle: 'FreelanceHub / Alizhan (CEO)',
    audience: 'B2B clients, investors, tech press, HR',
    priority: 3,
    frequency: '3 posts/week (CEO personal brand)',
    contentTypes: [
      'Build-in-public: weekly metrics + learnings',
      'Thought leadership: "Future of Work in CIS — my prediction"',
      'Product updates: new features with business context',
      'Investor-friendly: "Why freelance marketplace in Kazakhstan is a $500M opportunity"',
      'Hiring: "Looking for [role] to join our AI startup"',
    ],
    kpi: '500 followers + 2 inbound investor DMs in 90 days',
    tools: 'LinkedIn native. Post at 8 AM Tuesday/Thursday/Friday.',
  },
  {
    platform: 'YouTube',
    handle: 'FreelanceHub',
    audience: 'Freelancers wanting to learn, clients wanting to hire',
    priority: 4,
    frequency: '1 video/week',
    contentTypes: [
      '"Полный гид: как найти первого клиента на FreelanceHub за 7 дней"',
      '"Как правильно составить профиль фрилансера (разбор)"',
      '"AI-функции FreelanceHub: что умеет, как использовать"',
      '"История успеха: [Имя] зарабатывает [X]₸ в месяц удалённо"',
      '"Как заказчику найти хорошего разработчика без риска — эскроу-система"',
    ],
    kpi: '1K subscribers. SEO title optimization = organic search traffic',
    tools: 'OBS Studio for screen recording. DaVinci Resolve for editing.',
  },
  {
    platform: 'Twitter / X',
    handle: '@freelancehubkz',
    audience: 'Devs, tech founders, international audience',
    priority: 5,
    frequency: '3 tweets/day',
    contentTypes: [
      'Build-in-public threads: "1/ Building @freelancehubkz. Today: [X]"',
      'Stats: "We just hit [milestone]. Here\'s what happened 🧵"',
      'Engage with tech Twitter: reply to @levelsio, @marc_louvion, @swyx',
      'Product updates in 280 chars',
    ],
    kpi: '1K followers. 1 viral thread = 10K impressions',
    tools: 'Typefully for threads. Tweet at 9 AM EST.',
  },
]

// ── IDEAS BOARD — 1000 MEETINGS SUMMARY ───────────────────────────────────────
const IDEAS: { category: string; color: string; icon: string; items: { idea: string; priority: 'P0' | 'P1' | 'P2' | 'P3'; effort: string; why: string }[] }[] = [
  {
    category: 'Product — Core',
    color: '#7170ff',
    icon: '⚡',
    items: [
      { idea: 'AI Job Digest: daily email with top 5 matching orders per freelancer', priority: 'P0', effort: 'Low', why: 'Retention: users come back daily. Open rate 40%+ for personalized digests' },
      { idea: 'Smart Price Calculator: type skill + location + experience → instant market rate in ₸', priority: 'P0', effort: 'Low', why: 'Most-asked question by new freelancers. Drives sign-up' },
      { idea: 'Verified Portfolio: link GitHub/Behance/Dribbble → AI auto-imports projects', priority: 'P0', effort: 'Medium', why: 'Reduces profile setup time from 30min to 3min. Increases profile completion rate' },
      { idea: 'Order Templates: "Web development", "Logo design", etc. — 1-click order creation', priority: 'P0', effort: 'Low', why: 'Client pain: "I don\'t know how to write a brief". Templates = 10× faster orders' },
      { idea: 'Quick Apply: bid with 1 click using saved proposal templates', priority: 'P1', effort: 'Low', why: 'Freelancer pain: writing custom proposals takes 20min each. Quick Apply = 10× more bids' },
      { idea: 'Availability Calendar: freelancer sets busy/available dates, shown on profile', priority: 'P1', effort: 'Low', why: 'Reduces "when can you start?" back-and-forth by 80%' },
      { idea: 'Project Rooms: private workspace per order — files, chat, milestones, payments all in one', priority: 'P1', effort: 'High', why: 'Keeps all project communication on platform, not in WhatsApp. Platform stickiness' },
      { idea: 'Video Introduction: 60-second intro video on freelancer profile', priority: 'P1', effort: 'Medium', why: 'Profiles with video get 3× more views. Trust signal. Easy differentiation' },
      { idea: 'AI Brief Generator: client answers 5 questions → AI writes full project brief', priority: 'P1', effort: 'Medium', why: 'Client biggest pain: writing a good brief. AI solves it → better quality orders' },
      { idea: 'Saved Freelancers: client bookmarks freelancers to hire for next project', priority: 'P2', effort: 'Low', why: 'Repeat business from same client = 40% of marketplace revenue' },
    ],
  },
  {
    category: 'AI & Intelligence',
    color: '#06b6d4',
    icon: '🧠',
    items: [
      { idea: 'Semantic Search: "find me a React developer who also knows Supabase" → embedding match', priority: 'P0', effort: 'Medium', why: 'Current keyword search misses 70% of good matches. pgvector + embeddings = 3× relevance' },
      { idea: 'AI Fraud Detector: flag fake reviews, fake orders, account farms automatically', priority: 'P0', effort: 'Medium', why: 'Trust is the #1 thing that kills marketplaces. Detect before users see it' },
      { idea: 'Auto-Categorizer: AI reads order title → assigns category + skills automatically', priority: 'P1', effort: 'Low', why: 'Reduces friction for clients who don\'t know which category to pick' },
      { idea: 'Proposal Quality Score: AI rates freelancer\'s proposal 1–10 + suggests improvements', priority: 'P1', effort: 'Medium', why: 'Helps junior freelancers write winning proposals = higher conversion = more revenue' },
      { idea: 'AI Contract Lawyer: reads uploaded contract → flags risky clauses → explains in plain language', priority: 'P1', effort: 'Medium', why: 'Freelancers sign bad contracts out of fear. AI lawyer = trust + safety + premium feature' },
      { idea: 'Skill Gap Analysis: freelancer sees which skills are most in demand but they don\'t have', priority: 'P1', effort: 'Medium', why: 'Upsell to learning platforms (Coursera/Udemy affiliate). Career planning = retention' },
      { idea: 'AI Meeting Summarizer: paste Zoom transcript → AI creates task list + price estimate', priority: 'P2', effort: 'Low', why: 'After client call, freelancer spends 1hr writing summary. AI does it in 5 seconds' },
      { idea: 'Smart Notification Filter: AI decides which notifications to send vs. suppress', priority: 'P2', effort: 'Low', why: 'Notification fatigue kills engagement. Only send if probability of action > 40%' },
    ],
  },
  {
    category: 'Trust & Payments',
    color: '#22c55e',
    icon: '🔐',
    items: [
      { idea: 'Escrow with Milestone Releases: client deposits → released per milestone → 8% fee', priority: 'P0', effort: 'High', why: 'The #1 reason people don\'t use freelance platforms: fear of not getting paid' },
      { idea: 'Video KYC: selfie + ID scan → verified badge in 24h', priority: 'P0', effort: 'Medium', why: 'Verified badge = 4× more hires. Anti-fraud. Required for escrow payouts' },
      { idea: 'Trust Score: algorithm of reviews + verified + completed orders + response time', priority: 'P0', effort: 'Medium', why: 'Single number = instant credibility signal. Better than reading 20 reviews' },
      { idea: 'Kaspi/Halyk Bank Integration: native Kazakhstan banking for payouts', priority: 'P0', effort: 'High', why: 'Stripe doesn\'t work well in KZ. Local bank integration = frictionless money movement' },
      { idea: 'Crypto Payouts: USDT on Tron network for international freelancers', priority: 'P1', effort: 'Medium', why: 'Freelancers in UZ/TJ/KG can\'t receive USD easily. USDT = borderless payroll' },
      { idea: 'Dispute Resolution: 72h mediation window, community jury of Top-rated freelancers', priority: 'P1', effort: 'High', why: 'Marketplaces die without fair dispute resolution. Jury system = community-driven trust' },
      { idea: 'Payment Scheduling: client auto-pays on Friday every week for ongoing contracts', priority: 'P2', effort: 'Medium', why: 'Retainer contracts = predictable revenue for freelancers + for platform' },
    ],
  },
  {
    category: 'Community & Retention',
    color: '#f59e0b',
    icon: '👥',
    items: [
      { idea: 'Public Activity Feed: "Aizhan completed a logo project for 80,000₸" → FOMO', priority: 'P1', effort: 'Low', why: 'Social proof feed = viral loop. Every visible success inspires 5 more sign-ups' },
      { idea: 'Freelancer Rankings: weekly leaderboard by earnings, reviews, response speed', priority: 'P1', effort: 'Low', why: 'Gamification = retention. Top-10 freelancers promote their rank organically' },
      { idea: 'Knowledge Hub: "How to price your design work in 2026" — SEO articles by top freelancers', priority: 'P1', effort: 'Medium', why: 'SEO long-tail. Community-generated content. Freelancers promote articles they authored' },
      { idea: 'Referral 2.0: both referrer AND referee get premium for 1 month when order completed', priority: 'P1', effort: 'Low', why: 'Double-sided incentive = 3× referral conversion vs. single-sided' },
      { idea: 'Client Club: clients with 5+ completed orders get "Trusted Client" badge', priority: 'P2', effort: 'Low', why: 'Freelancers prioritize trusted clients. Creates retention on client side' },
      { idea: 'Mentor Program: senior freelancers offer 30-min free consulting to juniors', priority: 'P2', effort: 'Low', why: 'Community building. Senior = recognition. Junior = value. Platform = warm fuzzies' },
      { idea: 'Hackathons: monthly AI project sprint — winning project gets featured + hired', priority: 'P2', effort: 'Medium', why: 'PR event + community + client acquisition (companies sponsor prizes)' },
      { idea: 'Regional Communities: /community/almaty, /community/tashkent — local offline meetups', priority: 'P3', effort: 'Low', why: 'Offline trust events → online platform usage. WeWork Almaty = venue partner' },
    ],
  },
  {
    category: 'B2B & Enterprise',
    color: '#e879f9',
    icon: '🏢',
    items: [
      { idea: 'Company Accounts: post orders as "Kaspi Bank" not anonymous. Team seat management', priority: 'P1', effort: 'High', why: 'Companies hire 10× more than individuals. B2B = 80% of marketplace GMV at scale' },
      { idea: 'API Access: companies get API to post orders programmatically (ATS integration)', priority: 'P1', effort: 'Medium', why: 'HR software integration = automatic deal flow. Becomes embedded in hiring workflow' },
      { idea: 'White-Label: banks and universities offer "FreelanceHub powered" platform to their users', priority: 'P2', effort: 'High', why: 'Kaspi Bank students + Nazarbayev University = 500K users without marketing spend' },
      { idea: 'Agency Accounts: freelancer creates agency with team, shared orders, sub-freelancers', priority: 'P2', effort: 'High', why: 'Agencies handle large orders individuals can\'t. Higher GMV per transaction' },
      { idea: 'Procurement Integration: SAP/1C plugin for corporate Kazakhstan companies', priority: 'P3', effort: 'High', why: 'KazMunayGaz, Air Astana, Kaspi need verified procurement process. This unlocks enterprise' },
    ],
  },
  {
    category: 'Monetization',
    color: '#ef4444',
    icon: '💰',
    items: [
      { idea: 'Featured Order: promoted placement at top of category for 24h = 5,000₸', priority: 'P0', effort: 'Done', why: 'Already built. Start upselling actively. Target: 10% of orders use boost' },
      { idea: 'Priority Applications: paid fast-track — your bid shown first to client = 3,000₸', priority: 'P0', effort: 'Low', why: 'Freelancers pay to be seen first. Impulse purchase. 30% conversion on active bidders' },
      { idea: 'Background Verification: criminal check + work history = 10,000₸ one-time + "Vetted" badge', priority: 'P1', effort: 'Medium', why: 'High-value clients ONLY hire verified. Commands 40% premium rate for freelancer' },
      { idea: 'AI Credits System: 100 free credits/month, pay for more. Each AI feature costs credits', priority: 'P1', effort: 'Medium', why: 'Freemium AI = viral acquisition + monetization. Power users pay, casual users free' },
      { idea: 'Premium Teams: $49/mo for agencies — unlimited orders, team features, analytics', priority: 'P1', effort: 'Medium', why: 'B2B recurring revenue. SaaS on top of marketplace = higher LTV' },
      { idea: 'Skills Certification: AI-proctored test → "Certified React Developer" badge = 5,000₸', priority: 'P2', effort: 'High', why: 'Credential marketplace. Employers trust certified candidates. Recurring certification' },
      { idea: '$FLH Token: governance + fee reduction + staking rewards', priority: 'P3', effort: 'Very High', why: 'Decentralization vision. Long-term: token holders are platform co-owners' },
    ],
  },
  {
    category: 'Global Expansion',
    color: '#14b8a6',
    icon: '🌍',
    items: [
      { idea: 'Uzbekistan First: Tashkent landing page + UZS currency + local payment via Click/Payme', priority: 'P0', effort: 'Low', why: '35M population, no dominant local freelance platform. Closest market to KZ' },
      { idea: 'Turkey: Istanbul page + TRY currency + Turkish language. 85M + gateway to EU', priority: 'P1', effort: 'Medium', why: 'Istanbul is CIS/EU bridge. Strong freelance culture. Large dev community' },
      { idea: 'UAE: Dubai + Abu Dhabi pages + AED + Arabic language. Tax-free earning = huge draw', priority: 'P1', effort: 'Medium', why: 'Highest-paying market in our region. 200K+ tech expats from CIS live in UAE' },
      { idea: 'India: Mumbai/Bangalore pages + INR. World\'s largest freelance market by volume', priority: 'P2', effort: 'High', why: '15M+ freelancers. Massive supply side. Language: English. Competes with Upwork/Fiverr' },
      { idea: 'Nigeria: Lagos page + NGN. Fastest-growing tech freelance market in Africa', priority: 'P2', effort: 'Medium', why: '200M population. 500K+ tech freelancers. No dominant local platform. WhatsApp-first' },
      { idea: 'Southeast Asia: Manila + Jakarta + Ho Chi Minh. 650M people + huge English-speaking freelance scene', priority: 'P3', effort: 'High', why: 'Phase 3 expansion. Need local payment rails (GCash, GoPay, MoMo)' },
    ],
  },
  {
    category: 'Design Ideas',
    color: '#f97316',
    icon: '🎨',
    items: [
      { idea: 'Profile "Power Score" widget: radar chart of 6 skills — visible + shareable', priority: 'P1', effort: 'Low', why: 'Visual differentiation. Freelancers share their power score = organic social content' },
      { idea: 'Animated order feed: new orders slide in from top. Live feeling. No refresh needed', priority: 'P1', effort: 'Medium', why: 'Airbnb-style real-time feed creates urgency. "Apply before 3 others do"' },
      { idea: '"Dark Mode Pro": ultra-dark premium mode for power users — deeper blacks, neon accents', priority: 'P2', effort: 'Low', why: 'Dark mode loyalty is high. Pro version = status symbol. Screenshot-worthy' },
      { idea: 'Mobile app shell: PWA with native app feel — bottom tabs, haptic feedback, push', priority: 'P1', effort: 'High', why: '70% of CIS users are mobile-first. PWA = app store + no download barrier' },
      { idea: 'Order card micro-animations: hover = card lifts + shows quick-apply overlay', priority: 'P2', effort: 'Low', why: 'Delight. Makes platform feel alive. Higher CTR on cards' },
      { idea: '"Trust ribbon": diagonal banner on profile card — "Top Rated", "Rising Star", "New"', priority: 'P1', effort: 'Low', why: 'Ribbon = instant status signal. Amazon-style social proof at glance' },
      { idea: 'Earnings dashboard: beautiful chart showing freelancer income over time. LinkedIn-shareable', priority: 'P1', effort: 'Medium', why: 'Freelancers love tracking income. Shareable = viral. "I made 1M₸ this year on FreelanceHub"' },
    ],
  },
]

// ── COLORS & HELPERS ──────────────────────────────────────────────────────────
const FIT_COLOR: Record<string, string>     = { perfect: '#22c55e', high: '#f59e0b', medium: '#3b82f6' }
const FIT_LABEL: Record<string, string>     = { perfect: 'Perfect Fit', high: 'High Fit', medium: 'Good Fit' }
const IMPACT_COLOR: Record<string, string>  = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6' }
const PRIORITY_COLOR: Record<string, string> = { P0: '#ef4444', P1: '#f59e0b', P2: '#3b82f6', P3: '#6b7280' }

// ════════════════════════════════════════════════════════════════════════════

export default function WarRoom() {
  const [activeTab, setActiveTab]   = useState<TabId>('funding')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [ideaCat, setIdeaCat]       = useState<string>('all')

  const TABS: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'funding',  label: 'Funding Hunt',     icon: <DollarSign size={15} />,   count: FUNDS.length },
    { id: 'pr',       label: 'PR & Media',       icon: <Radio size={15} />,        count: PR_CHANNELS.length },
    { id: 'social',   label: 'Social Media',     icon: <Share2 size={15} />,       count: SOCIAL.length },
    { id: 'ideas',    label: 'Ideas Board',      icon: <Lightbulb size={15} />,    count: IDEAS.reduce((s, c) => s + c.items.length, 0) },
    { id: 'design',   label: 'Design Backlog',   icon: <Star size={15} /> },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e2e2ff', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── HEADER ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%)', borderBottom: '1px solid #1e1e3a', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Target size={22} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>War Room</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#ef444422', color: '#ef4444', fontWeight: 700 }}>COMMAND CENTER</span>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
              Funding · PR · Social Media · 1000 Ideas · Design Backlog — все в одном месте
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#4b5563' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{FUNDS.length}</div>
              <div>Funds</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{PR_CHANNELS.length}</div>
              <div>PR Channels</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#7170ff' }}>{IDEAS.reduce((s, c) => s + c.items.length, 0)}</div>
              <div>Ideas</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ borderBottom: '1px solid #1e1e3a', background: '#0a0a14' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 20px', fontSize: 13, fontWeight: 590, border: 'none', cursor: 'pointer',
                background: 'transparent', whiteSpace: 'nowrap',
                color: activeTab === tab.id ? '#7170ff' : '#6b7280',
                borderBottom: activeTab === tab.id ? '2px solid #7170ff' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.count && (
                <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: '#1e1e3a', color: '#6b7280' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px' }}>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* FUNDING TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'funding' && (
          <div>
            <div style={{ marginBottom: 24, padding: '16px 20px', background: '#0f1f2f', border: '1px solid #1e3a5f', borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#93c5fd', lineHeight: 1.8 }}>
                <strong style={{ color: '#fff' }}>Strategy:</strong> Start with tech grants (Vercel + Supabase + Anthropic) this week = free infra.
                Apply to QazTech (government, no equity). Then Startup Wise Guys (best CIS accelerator).
                Only approach US VCs after 1K users + first revenue. Always use our <strong style={{ color: '#fff' }}>5-language pitch deck</strong> at /admin/pitch.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {FUNDS.map(fund => (
                <div
                  key={fund.name}
                  style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 12, overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setExpanded(expanded === fund.name ? null : fund.name)}
                    style={{
                      width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'center',
                      gap: 14, background: 'transparent', border: 'none', cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e2ff', flex: 1, textAlign: 'left' }}>{fund.name}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{fund.country}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600, background: '#1e1e3a', color: '#9ca3af' }}>{fund.type}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', minWidth: 90, textAlign: 'right' }}>{fund.check}</span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                      background: `${FIT_COLOR[fund.fit]}22`, color: FIT_COLOR[fund.fit],
                    }}>{FIT_LABEL[fund.fit]}</span>
                    {expanded === fund.name ? <ChevronUp size={14} style={{ color: '#6b7280', flexShrink: 0 }} /> : <ChevronDown size={14} style={{ color: '#6b7280', flexShrink: 0 }} />}
                  </button>

                  {expanded === fund.name && (
                    <div style={{ padding: '0 22px 20px', borderTop: '1px solid #1e1e3a' }}>
                      <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Focus / Portfolio</p>
                          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{fund.focus}</p>
                          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#1e1e3a', color: '#9ca3af' }}>Stage: {fund.stage}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Action This Week</p>
                          <p style={{ fontSize: 13, color: '#e2e2ff', lineHeight: 1.7, margin: 0 }}>{fund.action}</p>
                          <p style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>💡 {fund.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PR TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pr' && (
          <div>
            <div style={{ marginBottom: 24, padding: '16px 20px', background: '#0f1f2f', border: '1px solid #1e3a5f', borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#93c5fd', lineHeight: 1.8 }}>
                <strong style={{ color: '#fff' }}>Week 1 Plan:</strong>
                {' '}Telegram CIS channels (free, highest CIS reach) → Habr.com article → Product Hunt schedule.
                Every Monday: new post. Every feature = Telegram post + LinkedIn post. Goal: 1 piece of content per day, forever.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PR_CHANNELS.map(ch => (
                <div key={ch.channel} style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 12, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpanded(expanded === ch.channel ? null : ch.channel)}
                    style={{ width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: '#e2e2ff', textAlign: 'left' }}>{ch.channel}</span>
                    <span style={{ fontSize: 11, color: '#6b7280' }}>{ch.category}</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#1e1e3a', color: '#9ca3af' }}>{ch.effort} effort</span>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
                      background: `${IMPACT_COLOR[ch.impact]}22`, color: IMPACT_COLOR[ch.impact],
                    }}>{ch.impact.toUpperCase()}</span>
                    {expanded === ch.channel ? <ChevronUp size={14} style={{ color: '#6b7280' }} /> : <ChevronDown size={14} style={{ color: '#6b7280' }} />}
                  </button>
                  {expanded === ch.channel && (
                    <div style={{ padding: '0 22px 20px', borderTop: '1px solid #1e1e3a' }}>
                      <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Audience</p>
                          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{ch.audience}</p>
                          <p style={{ fontSize: 11, color: '#4b5563', marginTop: 8 }}>⏰ Best time: {ch.timing}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Action + Template</p>
                          <p style={{ fontSize: 13, color: '#e2e2ff', lineHeight: 1.7, margin: 0 }}>{ch.action}</p>
                          <div style={{ marginTop: 12, background: '#1e1e3a', borderRadius: 8, padding: '10px 14px' }}>
                            <p style={{ fontSize: 12, color: '#7170ff', margin: 0, fontStyle: 'italic' }}>{ch.template}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SOCIAL TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'social' && (
          <div>
            <div style={{ marginBottom: 24, padding: '16px 20px', background: '#0f1f2f', border: '1px solid #1e3a5f', borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#93c5fd', lineHeight: 1.8 }}>
                <strong style={{ color: '#fff' }}>Golden Rule:</strong> Each platform has different language.
                Telegram = announcements + new orders. Instagram = beautiful stories. TikTok = emotion + tips.
                LinkedIn = data + milestones. Never cross-post the same content to all platforms — adapt each time.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {SOCIAL.map(s => (
                <div key={s.platform} style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: '#1e1e3a', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: '#7170ff',
                    }}>
                      #{s.priority}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{s.platform}</span>
                        <span style={{ fontSize: 12, color: '#7170ff' }}>{s.handle}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#1e1e3a', color: '#9ca3af' }}>{s.frequency}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px' }}>{s.audience}</p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                        {s.contentTypes.map((ct, i) => (
                          <div key={i} style={{ fontSize: 12, color: '#9ca3af', padding: '6px 10px', background: '#1a1a2e', borderRadius: 6 }}>{ct}</div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: '#22c55e' }}>🎯 KPI: {s.kpi}</span>
                        <span style={{ fontSize: 11, color: '#6b7280' }}>🛠 {s.tools}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* IDEAS TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'ideas' && (
          <div>
            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              <button
                onClick={() => setIdeaCat('all')}
                style={{
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 590,
                  background: ideaCat === 'all' ? '#7170ff' : 'transparent',
                  border: `1px solid ${ideaCat === 'all' ? '#7170ff' : '#1e1e3a'}`,
                  color: ideaCat === 'all' ? '#fff' : '#6b7280', cursor: 'pointer',
                }}
              >All ({IDEAS.reduce((s, c) => s + c.items.length, 0)})</button>
              {IDEAS.map(cat => (
                <button
                  key={cat.category}
                  onClick={() => setIdeaCat(cat.category)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 590,
                    background: ideaCat === cat.category ? cat.color : 'transparent',
                    border: `1px solid ${ideaCat === cat.category ? cat.color : '#1e1e3a'}`,
                    color: ideaCat === cat.category ? '#fff' : '#6b7280', cursor: 'pointer',
                  }}
                >
                  {cat.icon} {cat.category} ({cat.items.length})
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {IDEAS.filter(c => ideaCat === 'all' || c.category === ideaCat).map(cat => (
                <div key={cat.category}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.category}</span>
                    <span style={{ fontSize: 11, color: '#4b5563' }}>{cat.items.length} ideas</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {cat.items.map((item, i) => (
                      <div
                        key={i}
                        style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 10, padding: '14px 18px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <span style={{
                            fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 700, flexShrink: 0,
                            background: `${PRIORITY_COLOR[item.priority]}22`, color: PRIORITY_COLOR[item.priority],
                            marginTop: 2,
                          }}>{item.priority}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff', margin: '0 0 4px' }}>{item.idea}</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>💡 {item.why}</p>
                          </div>
                          <span style={{
                            fontSize: 10, color: '#4b5563', flexShrink: 0, padding: '2px 8px',
                            background: '#1e1e3a', borderRadius: 4,
                          }}>{item.effort}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* DESIGN TAB */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'design' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            <div style={{ padding: '16px 20px', background: '#0f1f2f', border: '1px solid #1e3a5f', borderRadius: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#93c5fd', lineHeight: 1.8 }}>
                <strong style={{ color: '#fff' }}>Design Philosophy:</strong> FreelanceHub feels like Notion met Stripe met Linear.
                Minimal, data-dense, dark-first. Every pixel earns its place.
                Reference: <strong style={{ color: '#e2e2ff' }}>Linear.app</strong> (precision + speed feeling),
                <strong style={{ color: '#e2e2ff' }}> Vercel dashboard</strong> (dark mode authority),
                <strong style={{ color: '#e2e2ff' }}> Stripe billing</strong> (trust through polish).
              </p>
            </div>

            {/* Design components backlog */}
            {[
              {
                section: 'Components to Build',
                color: '#7170ff',
                items: [
                  { name: 'PowerScoreWidget', desc: 'Radar chart: 6 axes (reliability, speed, quality, communication, price, innovation). Shareable as image.', status: 'roadmap' },
                  { name: 'EarningsDashboard', desc: 'Area chart: monthly earnings + projected. Animated on load. LinkedIn-shareable card.', status: 'roadmap' },
                  { name: 'AnimatedOrderFeed', desc: 'Real-time feed. New orders slide in from top. WebSocket or SSE. Urgency timer.', status: 'in_progress' },
                  { name: 'PWA Shell', desc: 'Bottom navigation for mobile. iOS-style transitions. Add to Home Screen prompt. Push notifications.', status: 'roadmap' },
                  { name: 'VideoIntro', desc: 'Record/upload 60s video on profile. Thumbnail + play button. Wistia or Mux embed.', status: 'roadmap' },
                  { name: 'TrustRibbon', desc: 'Diagonal ribbon on profile cards: "Top Rated" / "Rising Star" / "New". CSS clip-path.', status: 'design' },
                  { name: 'QuickApplyOverlay', desc: 'On order card hover: slide-up panel. Pre-fill bid amount + saved template. 2-click apply.', status: 'design' },
                  { name: 'ProfileStrengthBar', desc: 'Linear-style progress bar: 0–100. Checklist: photo, bio, skills, portfolio, first review.', status: 'design' },
                ],
              },
              {
                section: 'Page Redesigns',
                color: '#f59e0b',
                items: [
                  { name: 'Homepage (/) Redesign', desc: 'Hero: live counter of orders, earnings, countries. "AI finds your perfect match" demo GIF. Social proof wall.', status: 'design' },
                  { name: 'Freelancer Profile 2.0', desc: 'Left: sticky profile card. Right: portfolio masonry, reviews, availability. Full-width video header option.', status: 'roadmap' },
                  { name: 'Order Detail 2.0', desc: 'Progress timeline vertical. Milestone tracker sidebar. Escrow status pill. Attached files section.', status: 'in_progress' },
                  { name: 'Mobile Orders Page', desc: 'Card-first layout. Filter bottom sheet. Swipe to save order. Pull to refresh.', status: 'design' },
                  { name: 'Onboarding Flow', desc: '4 screens. Animated skill chip selection. Role choice (client/freelancer). Profile photo AI crop.', status: 'roadmap' },
                ],
              },
              {
                section: 'Design System',
                color: '#06b6d4',
                items: [
                  { name: 'Token Audit', desc: 'All --fh-* CSS variables documented. Light/dark mode parity check. Export to Figma tokens.', status: 'in_progress' },
                  { name: 'Animation Library', desc: 'Standardized easing curves. Micro-interaction patterns. Performance budget: max 100ms transition.', status: 'roadmap' },
                  { name: 'Icon System', desc: 'Lucide as base. Custom icons for KZT, escrow shield, AI spark, CIS map. SVG sprite.', status: 'design' },
                  { name: 'Typography Scale', desc: 'Current: system-ui. Target: Inter (already subset). Display: Geist Mono for numbers.', status: 'design' },
                  { name: 'Figma Design System', desc: 'Full component library in Figma. Auto-layout, variants, dark/light, interactive prototypes.', status: 'roadmap' },
                ],
              },
              {
                section: 'Brand Identity',
                color: '#e879f9',
                items: [
                  { name: 'Logo Variants', desc: 'Horizontal, vertical, icon-only. Dark background + light background. Telegram sticker pack.', status: 'design' },
                  { name: 'Social Media Templates', desc: '9:16 Reels template. 1:1 Instagram post. LinkedIn 1200×627. Canva shareable.', status: 'design' },
                  { name: 'Email Templates', desc: 'Transactional emails styled. Welcome, new bid, payment received, review received. MJML base.', status: 'in_progress' },
                  { name: 'Brand Voice', desc: 'Tone: Confident + Warm + Clear. Not corporate. Not startup-bro. "We got you" energy. RU/KK/EN variants.', status: 'design' },
                ],
              },
            ].map(section => (
              <div key={section.section}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 3, height: 16, borderRadius: 2, background: section.color }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: section.color }}>{section.section}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {section.items.map(item => (
                    <div
                      key={item.name}
                      style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 10, padding: '14px 16px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff' }}>{item.name}</span>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                          background: item.status === 'in_progress' ? '#f59e0b22' : item.status === 'design' ? '#7170ff22' : '#1e1e3a',
                          color: item.status === 'in_progress' ? '#f59e0b' : item.status === 'design' ? '#7170ff' : '#4b5563',
                        }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
