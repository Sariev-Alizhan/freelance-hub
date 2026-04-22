import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, ArrowRight, Zap, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Subscription Modules — FreelanceHub AI Tools',
  description: 'Specialized AI modules for freelancers: Legal contracts, RP game dev, SMM content, mobile development and more. Subscribe to unlock domain-specific AI tools.',
}

const MODULES = [
  {
    slug:       'legal',
    name:       'Legal & Contracts',
    tagline:    'AI lawyer in your pocket',
    price:      19,
    color:      '#22c55e',
    emoji:      '⚖️',
    popular:    false,
    features: [
      'Generate NDA, service agreements, freelance contracts',
      'Explain any clause in plain language (RU/EN/KK)',
      'KZ, RU, EU law knowledge base',
      'Red-flag detector for risky contract terms',
      'Unlimited document generation',
    ],
    audience: 'Every freelancer who signs contracts',
  },
  {
    slug:       'rp-dev',
    name:       'RP Game Dev',
    tagline:    'AI trained on PAWN, Lua, FiveM',
    price:      29,
    color:      '#27a644',
    emoji:      '🎮',
    popular:    true,
    features: [
      'PAWN code generation for SA:MP / CRMP',
      'Lua & C# for FiveM / RageMP',
      'Unity C# for mobile RP (GrandMobile style)',
      'Bug detector — paste .pwn file, get fixes',
      'MySQL schema optimizer for RP databases',
      'Auto-documentation generator',
    ],
    audience: 'SA:MP, FiveM, mobile RP developers',
  },
  {
    slug:       'smm',
    name:       'SMM & Content',
    tagline:    'AI content calendar & captions',
    price:      19,
    color:      '#f59e0b',
    emoji:      '📣',
    popular:    false,
    features: [
      'Content calendar generator (30 days)',
      'Caption writer in RU / EN / KK / AR',
      'Hashtag strategy for CIS platforms (VK, TG, IG)',
      'Competitor analysis summaries',
      'Reels / TikTok script generator',
      'Tone of voice customizer',
    ],
    audience: 'SMM managers, content creators',
  },
  {
    slug:       'mobile-dev',
    name:       'Mobile Dev',
    tagline:    'Flutter & React Native AI',
    price:      39,
    color:      '#06b6d4',
    emoji:      '📱',
    popular:    false,
    features: [
      'Flutter widget & screen code generation',
      'React Native component builder',
      'App Store & Play Store listing optimizer',
      'Deep link & push notification setup guide',
      'Architecture review (MVVM, BLoC, Riverpod)',
      'Performance profiling recommendations',
    ],
    audience: 'Mobile app developers',
  },
  {
    slug:       'ecommerce',
    name:       'E-commerce Dev',
    tagline:    'Shopify, WooCommerce & 1C-Bitrix',
    price:      29,
    color:      '#e879f9',
    emoji:      '🛒',
    popular:    false,
    features: [
      '1C-Bitrix template & module development AI',
      'Shopify Liquid template generator',
      'WooCommerce hooks & plugin development',
      'Product description generator (SEO-optimized)',
      'Conversion rate optimization suggestions',
    ],
    audience: 'E-commerce developers (CIS market)',
  },
  {
    slug:       'blockchain',
    name:       'Web3 & Blockchain',
    tagline:    'Solidity, smart contracts, DeFi',
    price:      49,
    color:      '#f97316',
    emoji:      '🔗',
    popular:    false,
    features: [
      'Solidity smart contract generator',
      'Security audit AI (reentrancy, overflow checks)',
      'ERC-20 / ERC-721 / ERC-1155 templates',
      'DeFi protocol architecture assistant',
      'Gas optimization recommendations',
      'Multi-chain deployment guide (ETH, Polygon, BSC)',
    ],
    audience: 'Blockchain & Web3 developers',
  },
]

const BUNDLE = {
  name: 'Pro Studio',
  tagline: 'All 6 modules + priority AI',
  price: 89,
  saving: 94, // 6 × avg $30 = $180, save $91
  features: [
    'All 6 AI modules unlocked',
    'Priority AI response (no queue)',
    'Early access to new modules',
    'Dedicated support chat',
    'Team seat sharing (up to 3 users)',
    'Monthly usage analytics report',
  ],
}

export default function ModulesPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'var(--fh-surface)', borderBottom: '1px solid var(--fh-border)', padding: 'clamp(48px, 8vw, 80px) 24px clamp(32px, 5vw, 56px)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, padding: '3px 12px', borderRadius: 20, background: 'var(--fh-primary-faint)', color: 'var(--fh-primary)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 16 }}>
            AI MODULES
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 5vw, 46px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--fh-t1)', margin: '0 0 14px', lineHeight: 1.1 }}>
            Specialized AI tools<br />for every niche
          </h1>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--fh-t3)', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Each module is AI trained on a specific domain. Pick only what you need.
            Cancel anytime. Start with a 7-day free trial.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--fh-t4)' }}>
            <span>✓ 7-day free trial</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Used by 5,000+ freelancers</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 24px' }}>

        {/* ── MODULE CARDS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 56 }}>
          {MODULES.map(mod => (
            <div
              key={mod.slug}
              style={{
                position: 'relative', background: 'var(--fh-surface)',
                border: `1px solid ${mod.popular ? mod.color + '60' : 'var(--fh-border)'}`,
                borderRadius: 16, overflow: 'hidden',
                boxShadow: mod.popular ? `0 0 0 1px ${mod.color}30, 0 8px 32px ${mod.color}10` : undefined,
              }}
            >
              {mod.popular && (
                <div style={{ background: mod.color, color: '#fff', fontSize: 10, fontWeight: 800, textAlign: 'center', padding: '5px 0', letterSpacing: '0.08em' }}>
                  ★ MOST POPULAR
                </div>
              )}
              <div style={{ padding: '24px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32, lineHeight: 1 }}>{mod.emoji}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>{mod.name}</h3>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--fh-t4)' }}>{mod.tagline}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: mod.color, lineHeight: 1 }}>${mod.price}</div>
                    <div style={{ fontSize: 10, color: 'var(--fh-t4)' }}>/month</div>
                  </div>
                </div>

                <ul style={{ margin: '0 0 20px', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {mod.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.5 }}>
                      <Check size={13} style={{ color: mod.color, flexShrink: 0, marginTop: 2 }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--fh-surface-2)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--fh-t4)' }}>Best for: </span>
                  <span style={{ fontSize: 11, color: 'var(--fh-t2)', fontWeight: 510 }}>{mod.audience}</span>
                </div>

                <Link
                  href={`/premium?module=${mod.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '11px 0', borderRadius: 10, width: '100%',
                    background: mod.popular ? mod.color : 'transparent',
                    border: `1px solid ${mod.popular ? mod.color : 'var(--fh-border)'}`,
                    color: mod.popular ? '#fff' : 'var(--fh-t2)',
                    fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  Start free trial <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── BUNDLE ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--fh-surface) 0%, var(--fh-surface-2) 100%)',
          border: '1px solid #27a64450',
          borderRadius: 20, padding: 'clamp(28px, 4vw, 44px)',
          boxShadow: '0 0 0 1px #27a64420, 0 16px 48px #27a6440a',
          marginBottom: 56,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Zap size={18} style={{ color: '#27a644' }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#27a644', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Best Value</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#22c55e18', color: '#22c55e', fontWeight: 700 }}>
                  Save ${BUNDLE.saving}/mo
                </span>
              </div>
              <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                {BUNDLE.name}
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, color: 'var(--fh-t3)' }}>{BUNDLE.tagline}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {BUNDLE.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--fh-t2)', alignItems: 'flex-start' }}>
                    <Star size={12} style={{ color: '#27a644', flexShrink: 0, marginTop: 3 }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 180 }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#27a644', lineHeight: 1, letterSpacing: '-0.04em' }}>${BUNDLE.price}</div>
              <div style={{ fontSize: 13, color: 'var(--fh-t4)', marginBottom: 20 }}>per month · all modules</div>
              <Link
                href="/premium?module=studio"
                style={{
                  display: 'block', padding: '14px 32px', borderRadius: 12,
                  background: '#27a644', color: '#fff',
                  fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  marginBottom: 8,
                }}
              >
                Get Pro Studio
              </Link>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--fh-t4)' }}>7-day trial · Cancel anytime</p>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em', marginBottom: 20, textAlign: 'center' }}>
            Common questions
          </h2>
          {[
            { q: 'Can I try before paying?', a: 'Yes — every module comes with a 7-day free trial. No credit card required to start.' },
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your dashboard. You keep access until the end of the billing period.' },
            { q: 'Do modules work alongside the main platform?', a: 'Yes. Modules add AI tools to your existing FreelanceHub account. You still post orders, respond to jobs, and use escrow as normal.' },
            { q: 'Are modules available in Russian and Kazakh?', a: 'All modules respond in the language you write in: RU, KK, EN, AR, ZH.' },
            { q: 'What if my industry is not listed?', a: 'Vote for it at freelance-hub.kz/vote — the community decides which modules we build next.' },
          ].map(item => (
            <div key={item.q} style={{ padding: '18px 0', borderBottom: '1px solid var(--fh-border)' }}>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 600, color: 'var(--fh-t1)' }}>{item.q}</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--fh-t3)', lineHeight: 1.7 }}>{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
