'use client'
import Link from 'next/link'
import { BookOpen, Zap, Shield, Users, CreditCard, Bot, Search, FileText, Star, MessageSquare, ArrowRight, CheckCircle, Globe } from 'lucide-react'

const SECTIONS = [
  {
    icon: Users,
    color: '#22c55e',
    title: 'Getting Started',
    id: 'getting-started',
    items: [
      { title: 'Creating an account', desc: 'Register as a freelancer or client via Google, GitHub, or email. Choose your role during onboarding.' },
      { title: 'Setting up your profile', desc: 'Add a photo, bio, location, skills, and portfolio. Freelancers should complete all fields to appear in search.' },
      { title: 'Dashboard overview', desc: 'Your personal hub: active orders, responses, analytics, portfolio management, and account settings.' },
      { title: 'Verification & Premium', desc: 'Verified badge is granted by admins after profile review. Premium unlocks unlimited responses and priority listing.' },
    ],
  },
  {
    icon: Search,
    color: '#7170ff',
    title: 'Finding Freelancers',
    id: 'find-freelancers',
    items: [
      { title: 'Browse & filter', desc: 'Go to /freelancers. Filter by category (Dev, Design, SMM, etc.), location, price range, and rating.' },
      { title: 'AI Search', desc: 'Use /ai-search to describe what you need in plain text — AI finds the best matches from our database.' },
      { title: 'AI Assistant', desc: '/ai-assistant helps you find the right specialist through a guided conversation. Describe your project and budget.' },
      { title: 'Freelancer profiles', desc: 'Each profile shows skills, portfolio, reviews, response time, and availability status (Available / Busy / On vacation).' },
      { title: 'Inline translation', desc: 'Every profile bio has a Translate button — translate descriptions into 10 languages instantly using Claude AI.' },
    ],
  },
  {
    icon: FileText,
    color: '#f59e0b',
    title: 'Orders',
    id: 'orders',
    items: [
      { title: 'Posting an order', desc: 'Go to /orders/new. Fill in: category, title (min 10 chars), description (min 30 chars), budget, and deadline.' },
      { title: 'Order visibility', desc: 'All published orders are visible on /orders. Freelancers can filter by category, budget, and urgency.' },
      { title: 'Responding to an order', desc: 'Freelancers click Apply → write a cover message and proposed price → submit. Free accounts: 5 responses/month.' },
      { title: 'Managing responses', desc: 'As a client, review all applicants in the order detail page. Accept or reject responses. Chat with candidates first.' },
      { title: 'Order status flow', desc: 'Open → In Progress → Review → Completed (or Cancelled). Update status from the order detail page.' },
      { title: 'Milestone tracking', desc: 'Orders in progress show a progress tracker (Not started / In progress / Review / Done).' },
    ],
  },
  {
    icon: Bot,
    color: '#06b6d4',
    title: 'AI Tools',
    id: 'ai-tools',
    items: [
      { title: 'AI Agents marketplace', desc: '/agents — browse and run AI agents built by the community. Custom agents can do anything: write content, analyze data, generate code.' },
      { title: 'Build your own agent', desc: '/agents/builder — create a custom AI agent with a name, description, system prompt, and category. Publish to marketplace.' },
      { title: 'AI Contract generator', desc: '/contracts — generate professional freelance contracts (NDA, service agreements) in RU/EN/KK. Powered by Claude AI.' },
      { title: 'AI Price advisor', desc: 'When creating an order, click Get AI Advice to get a budget recommendation based on your category and requirements.' },
      { title: 'AI Description writer', desc: 'In the order form, AI can write a detailed order description from your brief — saves 10+ minutes.' },
      { title: 'AI Resume builder', desc: '/ai-resume — paste your experience and AI formats a professional resume/CV.' },
      { title: 'SMM Agent', desc: 'Generates content calendars, captions, and hashtag strategies for CIS social platforms (VK, TG, IG).' },
      { title: 'Orchestrator agent', desc: 'Coordinates multiple AI agents to complete complex multi-step tasks autonomously.' },
    ],
  },
  {
    icon: MessageSquare,
    color: '#e879f9',
    title: 'Messaging',
    id: 'messaging',
    items: [
      { title: 'Starting a conversation', desc: 'Click Message on any freelancer profile or order response. All chats are in /messages.' },
      { title: 'Real-time chat', desc: 'Messages use Supabase Realtime — delivered instantly without page refresh. Unread badge shows on the header.' },
      { title: 'Push notifications', desc: 'Enable browser notifications to get alerted for new messages even when the tab is in the background.' },
      { title: 'Telegram notifications', desc: 'Connect your Telegram in /dashboard → Telegram tab. Get order and message alerts in Telegram.' },
    ],
  },
  {
    icon: CreditCard,
    color: '#22c55e',
    title: 'Payments',
    id: 'payments',
    items: [
      { title: 'Escrow system', desc: 'For large orders: client funds escrow → freelancer works → client approves → funds released. 8% platform fee.' },
      { title: 'Kaspi Pay', desc: 'Pay for Premium via Kaspi QR. Payment auto-confirmed via webhook.' },
      { title: 'Card transfer', desc: 'Transfer to Kaspi/Freedom card → upload screenshot → admin approves within 24h → Premium activated.' },
      { title: 'Premium plans', desc: 'Monthly ₸9,900 / Quarterly ₸24,900 / Annual ₸79,900. Unlocks unlimited responses, verified badge priority, advanced analytics.' },
    ],
  },
  {
    icon: Star,
    color: '#f97316',
    title: 'Premium & Modules',
    id: 'premium',
    items: [
      { title: 'Premium benefits', desc: 'Unlimited order responses (free: 5/month), profile promoted in search, verified badge priority, advanced analytics dashboard.' },
      { title: 'AI Modules', desc: '/modules — subscribe to domain-specific AI: Legal ($19/mo), RP Game Dev ($29), SMM ($19), Mobile Dev ($39), E-commerce ($29), Web3 ($49).' },
      { title: 'Pro Studio bundle', desc: 'All 6 AI modules + priority AI + team sharing (3 users) for $89/month. Save $94/mo vs individual.' },
      { title: 'RP Game Dev module', desc: 'AI trained on PAWN, Lua, FiveM, Unity C#. Write RP game code, debug .pwn files, optimize MySQL schemas for SA:MP/CRMP/GrandMobile.' },
    ],
  },
  {
    icon: Shield,
    color: '#e5484d',
    title: 'Security & Trust',
    id: 'security',
    items: [
      { title: 'Rate limiting', desc: 'All API routes are rate-limited. Sensitive endpoints (AI, payments, admin) allow max 30 requests/minute.' },
      { title: 'Input sanitization', desc: 'All user inputs are sanitized server-side before storage. XSS and SQL injection are prevented at the API layer.' },
      { title: 'Row-level security', desc: 'Supabase RLS ensures users can only read/write their own data. Service role is never exposed to the client.' },
      { title: 'CSP headers', desc: 'Strict Content Security Policy on all responses. frame-src: none, object-src: none, upgrade-insecure-requests.' },
      { title: 'Verified badge', desc: 'Admin-reviewed identity verification. Verified freelancers appear higher in search results.' },
      { title: 'Abuse protection', desc: 'Suspicious user agents (bots, scanners) are blocked at the proxy level. Path traversal attacks return 403.' },
    ],
  },
  {
    icon: Globe,
    color: '#7170ff',
    title: 'Localization',
    id: 'localization',
    items: [
      { title: 'Languages', desc: 'Platform UI available in English, Russian (RU), and Kazakh (KZ). Switch in the header — preference saved locally.' },
      { title: 'Currencies', desc: 'Prices can be displayed in 10 currencies: KZT, RUB, USD, EUR, GBP, USDT, UAH, CNY, AED, TRY. Rates auto-convert.' },
      { title: 'Inline translation', desc: 'Translate any profile bio or description into 10 languages instantly. Uses Claude AI — no external translation service needed.' },
      { title: 'Dark / Light mode', desc: 'Toggle in the header. Default is dark. Preference saved to localStorage and persists across sessions.' },
    ],
  },
]

export default function DocsPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'var(--fh-surface)', borderBottom: '1px solid var(--fh-border)', padding: 'clamp(40px, 6vw, 72px) 24px clamp(28px, 4vw, 48px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '4px 14px', borderRadius: 20, background: 'rgba(113,112,255,0.1)', border: '1px solid rgba(113,112,255,0.2)' }}>
            <BookOpen size={13} style={{ color: '#7170ff' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#7170ff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Documentation</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 800, color: 'var(--fh-t1)', letterSpacing: '-0.04em', margin: '0 0 14px', lineHeight: 1.1 }}>
            FreelanceHub Guide
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--fh-t3)', lineHeight: 1.7, margin: 0 }}>
            Everything you need to know about using FreelanceHub — from posting your first order to running AI agents.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40, alignItems: 'start' }}>

        {/* Sidebar nav */}
        <div style={{ position: 'sticky', top: 72 }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8,
                  fontSize: 13, fontWeight: 510, color: 'var(--fh-t3)', textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--fh-surface-2)'; e.currentTarget.style.color = 'var(--fh-t1)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fh-t3)' }}
              >
                <s.icon size={14} style={{ color: s.color, flexShrink: 0 }} />
                {s.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
          {SECTIONS.map(section => (
            <div key={section.id} id={section.id} style={{ scrollMarginTop: 80 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: section.color + '15', border: `1px solid ${section.color}30` }}>
                  <section.icon size={18} style={{ color: section.color }} />
                </div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                  {section.title}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '16px 20px', borderRadius: 12,
                      border: '1px solid var(--fh-border)', background: 'var(--fh-surface)',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = section.color + '40' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--fh-border)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckCircle size={14} style={{ color: section.color, flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)' }}>{item.title}</p>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.7 }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Quick links */}
          <div style={{ padding: 28, borderRadius: 16, background: 'linear-gradient(135deg, rgba(113,112,255,0.08), rgba(113,112,255,0.02))', border: '1px solid rgba(113,112,255,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Zap size={16} style={{ color: '#7170ff' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--fh-t1)' }}>Quick links</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
              {[
                { href: '/orders/new',    label: 'Post an order'     },
                { href: '/freelancers',   label: 'Find a freelancer' },
                { href: '/ai-search',     label: 'AI Search'         },
                { href: '/contracts',     label: 'AI Contracts'      },
                { href: '/agents',        label: 'AI Agents'         },
                { href: '/modules',       label: 'AI Modules'        },
                { href: '/premium',       label: 'Get Premium'       },
                { href: '/vote',          label: 'Vote on features'  },
                { href: '/play',          label: '🎮 Play Block Blast'},
              ].map(l => (
                <Link
                  key={l.href}
                  href={l.href}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
                    padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(113,112,255,0.2)',
                    fontSize: 13, fontWeight: 510, color: 'var(--fh-t2)', textDecoration: 'none',
                    background: 'rgba(113,112,255,0.04)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.1)'; e.currentTarget.style.color = '#7170ff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.04)'; e.currentTarget.style.color = 'var(--fh-t2)' }}
                >
                  {l.label} <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div style={{ textAlign: 'center', padding: '28px 20px', borderRadius: 16, border: '1px solid var(--fh-border)', background: 'var(--fh-surface-2)' }}>
            <p style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700, color: 'var(--fh-t1)' }}>Still have questions?</p>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--fh-t3)' }}>Reach us on Telegram or WhatsApp — we reply within 1 hour.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://t.me/zhanmate" target="_blank" rel="noopener noreferrer"
                style={{ padding: '8px 20px', borderRadius: 8, background: 'rgba(41,182,246,0.1)', border: '1px solid rgba(41,182,246,0.2)', color: '#29b6f6', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Telegram @zhanmate
              </a>
              <Link href="/vote" style={{ padding: '8px 20px', borderRadius: 8, background: 'rgba(113,112,255,0.08)', border: '1px solid rgba(113,112,255,0.2)', color: '#7170ff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Request a feature
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
