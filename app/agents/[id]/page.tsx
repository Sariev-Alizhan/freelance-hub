'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import {
  Bot, Star, Zap, CheckCircle, Send, ArrowLeft,
  Loader2, Clock, DollarSign, Shield, Info
} from 'lucide-react'
import Link from 'next/link'
import { MOCK_AGENTS } from '@/lib/mock/agents'

interface ChatMsg { role: 'user' | 'agent'; text: string }

const DEMO_RESPONSES: Record<string, string[]> = {
  'smm-agent-1': [
    "Hi! I'm SocialPilot AI. To get started on your SMM campaign, I need a few things: your brand name, target audience (age, interests, platform), and posting frequency. Can you share those?",
    "Got it. Based on your brief, here's a 7-day Instagram content plan:\n\n**Day 1** – Behind-the-scenes reel 🎬\n**Day 2** – Product highlight carousel\n**Day 3** – Customer testimonial quote card\n**Day 4** – Industry tip (educational)\n**Day 5** – Interactive poll story\n**Day 6** – Weekend motivational post\n**Day 7** – Weekly wrap-up + CTA\n\nShall I write the captions for each?",
    "Here's Day 1 caption draft:\n\n*\"Every great product starts in a messy workspace 🛠️ Here's where the magic happens behind the scenes. What does YOUR workspace look like? Drop it in the comments 👇\"\n\n#[YourBrand] #BehindTheScenes #Startup #Authentic*\n\nEngagement hooks: question + CTA. Estimated reach boost: +23% vs. static posts.",
  ],
  'landing-agent-1': [
    "Hello! I'm LandingForge AI. To generate your landing page, tell me: what's the product, who's it for, and what's the main action you want visitors to take?",
    "Perfect. Here's your landing page structure:\n\n**HERO**: Bold headline + 1-line sub + CTA button\n**PROBLEM**: 3 pain points your audience faces\n**SOLUTION**: How your product solves each one\n**SOCIAL PROOF**: 3 testimonials + key metrics\n**FEATURES**: 4-6 cards with icons\n**FAQ**: 5 most common objections\n**FINAL CTA**: Strong closing with urgency element\n\nWant me to write the full copy now?",
    "Here's your HERO section:\n\n**Headline**: *Stop Losing Clients to a Broken First Impression*\n**Sub**: The landing page that converts visitors into paying customers — built in 48 hours, not 3 months.\n**CTA**: → Get Your Page Built\n**Trust signal**: Trusted by 200+ founders · Average 3.4× conversion lift\n\nAdjust the numbers and let me know your actual metrics. Ready for PROBLEM section?",
  ],
  'code-review-agent-1': [
    "Hello! I'm CodeReview AI. Paste your code or describe what you'd like reviewed and I'll analyse it for security, performance, and code quality.",
    "I've scanned the snippet. Here's the report:\n\n🔴 **Critical** – SQL injection risk on line 12: user input concatenated directly into query. Use parameterized statements.\n\n🟡 **Warning** – N+1 query pattern in the loop (lines 28-35). Batch the DB calls with a single JOIN or `.in()` filter.\n\n🟢 **Info** – Variable name `data` is too generic. Consider `userRecords` for clarity.\n\nFix priority: 1 → 3. Want the corrected code snippets?",
    "Here's the fixed version of the critical SQL issue:\n\n```typescript\n// Before (vulnerable)\nconst result = await db.query(`SELECT * FROM users WHERE id = ${userId}`)\n\n// After (safe)\nconst result = await db.query('SELECT * FROM users WHERE id = $1', [userId])\n```\n\nThis eliminates the injection vector. Shall I fix the N+1 issue next?",
  ],
  default: [
    "Hi! I'm ready to help. What task would you like me to work on?",
    "Great, I understand the requirements. Let me process that and provide a detailed response...\n\nBased on what you've described, here's my initial assessment and plan of action. I'll break this down into clear steps to ensure the best outcome.",
    "Here's my detailed output based on your requirements. Everything has been structured for clarity and immediate use. Would you like me to refine any specific section or continue to the next step?",
  ],
}

export default function AgentProfilePage() {
  const params = useParams()
  const id = params?.id as string
  const agent = MOCK_AGENTS.find(a => a.id === id)

  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [demoIdx, setDemoIdx]   = useState(0)
  const [started, setStarted]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!agent) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <Bot className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--fh-t4)', opacity: 0.4 }} />
        <p style={{ fontSize: '18px', fontWeight: 510, color: 'var(--fh-t1)', marginBottom: '8px' }}>Agent not found</p>
        <Link href="/agents" style={{ fontSize: '13px', color: '#7170ff' }}>← Back to Agents</Link>
      </div>
    )
  }

  const demos = DEMO_RESPONSES[agent.id] ?? DEMO_RESPONSES.default

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')

    if (!started) setStarted(true)

    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    // Simulate agent "thinking" delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

    const response = demos[demoIdx % demos.length]
    setDemoIdx(i => i + 1)
    setMessages(prev => [...prev, { role: 'agent', text: response }])
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">

      {/* Back link */}
      <Link
        href="/agents"
        className="inline-flex items-center gap-1.5 mb-6 transition-colors"
        style={{ fontSize: '13px', color: 'var(--fh-t4)', fontWeight: 510 }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--fh-t2)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--fh-t4)' }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Profile info */}
        <div className="lg:col-span-2 space-y-4">

          {/* Avatar + name */}
          <div
            className="rounded-xl p-6"
            style={{ background: 'var(--fh-surface)', border: '1px solid rgba(113,112,255,0.2)', position: 'relative', overflow: 'hidden' }}
          >
            {/* Top glow */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(113,112,255,0.5), transparent)',
            }} />

            <div className="flex items-center gap-4 mb-4">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 56, height: 56,
                  background: 'linear-gradient(135deg, rgba(113,112,255,0.2), rgba(113,112,255,0.05))',
                  border: '1px solid rgba(113,112,255,0.3)',
                }}
              >
                <Bot className="h-7 w-7" style={{ color: '#7170ff' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.02em' }}>
                    {agent.name}
                  </h1>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                    padding: '2px 7px', borderRadius: '4px',
                    background: 'rgba(113,112,255,0.12)', border: '1px solid rgba(113,112,255,0.25)', color: '#7170ff',
                  }}>
                    🤖 AI Agent
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--fh-t3)', marginTop: '2px' }}>{agent.tagline}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Rating', value: agent.rating.toFixed(1), icon: Star },
                { label: 'Tasks', value: agent.tasksCompleted.toString(), icon: CheckCircle },
                { label: 'Speed', value: agent.responseTime, icon: Zap },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="text-center p-2 rounded-lg"
                  style={{ background: 'var(--fh-surface-2)', border: '1px solid var(--fh-border)' }}
                >
                  <Icon className="h-3.5 w-3.5 mx-auto mb-1" style={{ color: '#7170ff' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--fh-t1)' }}>{value}</p>
                  <p style={{ fontSize: '10px', color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: agent.isAvailable ? 'rgba(39,166,68,0.06)' : 'rgba(245,158,11,0.06)',
                border: agent.isAvailable ? '1px solid rgba(39,166,68,0.2)' : '1px solid rgba(245,158,11,0.2)',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 510, color: agent.isAvailable ? '#27a644' : '#f59e0b' }}>
                {agent.isAvailable ? '● Available now' : '● Currently busy'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>
                responds in {agent.responseTime}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
          >
            <h3 style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Pricing
            </h3>
            <div className="flex items-end gap-2 mb-2">
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--fh-t1)', letterSpacing: '-0.03em' }}>
                ${agent.pricePerTask}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--fh-t4)', paddingBottom: '4px' }}>per task</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--fh-t3)', lineHeight: 1.6, marginBottom: '12px' }}>
              Billed per completed task. No hourly tracking, no surprises.
            </p>
            <div className="space-y-2">
              {[
                'Unlimited revisions per task',
                'Result delivered async',
                'Money-back if unsatisfied',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0" style={{ color: '#27a644' }} />
                  <span style={{ fontSize: '12px', color: 'var(--fh-t3)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
          >
            <h3 style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {agent.skills.map(skill => (
                <span key={skill} style={{
                  fontSize: '12px', fontWeight: 510,
                  padding: '4px 10px', borderRadius: '6px',
                  background: 'var(--fh-skill-bg)',
                  border: '1px solid var(--fh-skill-bd)',
                  color: 'var(--fh-t3)',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tech info */}
          <div
            className="rounded-xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
          >
            <h3 style={{ fontSize: '12px', fontWeight: 590, color: 'var(--fh-t4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Technical Info
            </h3>
            <div className="space-y-2.5">
              {[
                { label: 'Model',   value: agent.model,   icon: Bot },
                { label: 'Creator', value: agent.creator, icon: Shield },
                { label: 'Latency', value: agent.responseTime, icon: Clock },
                { label: 'Price',   value: `$${agent.pricePerTask} / task`, icon: DollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2" style={{ color: 'var(--fh-t4)' }}>
                    <Icon className="h-3.5 w-3.5" />
                    <span style={{ fontSize: '12px' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 510, color: 'var(--fh-t2)' }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Chat demo */}
        <div className="lg:col-span-3 flex flex-col">
          <div
            className="rounded-xl flex flex-col"
            style={{
              background: 'var(--fh-surface)',
              border: '1px solid rgba(113,112,255,0.2)',
              height: '600px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Chat header */}
            <div
              className="flex items-center gap-3 px-4 py-3 shrink-0"
              style={{ borderBottom: '1px solid var(--fh-sep)', background: 'var(--fh-surface-2)' }}
            >
              <div
                className="flex items-center justify-center rounded-lg shrink-0"
                style={{
                  width: 32, height: 32,
                  background: 'rgba(113,112,255,0.1)',
                  border: '1px solid rgba(113,112,255,0.25)',
                }}
              >
                <Bot className="h-4 w-4" style={{ color: '#7170ff' }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)' }}>{agent.name}</p>
                <p style={{ fontSize: '11px', color: agent.isAvailable ? '#27a644' : 'var(--fh-t4)' }}>
                  {agent.isAvailable ? '● Online · Demo mode' : '● Busy · Demo mode'}
                </p>
              </div>
              {/* Demo badge */}
              <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.2)',
                }}
              >
                <Info className="h-3 w-3" style={{ color: '#fbbf24' }} />
                <span style={{ fontSize: '10px', fontWeight: 590, color: '#fbbf24' }}>Demo · No payment</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-4 pb-10">
                  <div
                    className="flex items-center justify-center rounded-2xl"
                    style={{
                      width: 64, height: 64,
                      background: 'linear-gradient(135deg, rgba(113,112,255,0.15), rgba(113,112,255,0.05))',
                      border: '1px solid rgba(113,112,255,0.2)',
                    }}
                  >
                    <Bot className="h-8 w-8" style={{ color: '#7170ff' }} />
                  </div>
                  <div className="text-center max-w-xs">
                    <p style={{ fontSize: '15px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '6px' }}>
                      Start a conversation
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.6 }}>
                      {agent.description.slice(0, 120)}...
                    </p>
                  </div>
                  {/* Quick prompts */}
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {['Describe what you can do', 'I have a task for you', 'How much does a full project cost?'].map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => { setInput(prompt); }}
                        className="text-left px-3 py-2 rounded-lg transition-all"
                        style={{
                          fontSize: '13px', color: '#7170ff', fontWeight: 510,
                          background: 'rgba(113,112,255,0.06)',
                          border: '1px solid rgba(113,112,255,0.15)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.12)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(113,112,255,0.06)' }}
                      >
                        {prompt} →
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'agent' && (
                    <div
                      className="flex items-center justify-center rounded-lg shrink-0 mr-2 mt-0.5"
                      style={{
                        width: 24, height: 24,
                        background: 'rgba(113,112,255,0.1)',
                        border: '1px solid rgba(113,112,255,0.2)',
                      }}
                    >
                      <Bot className="h-3 w-3" style={{ color: '#7170ff' }} />
                    </div>
                  )}
                  <div
                    className="max-w-[78%] px-3 py-2.5 rounded-xl"
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      background: msg.role === 'user'
                        ? '#5e6ad2'
                        : 'var(--fh-surface-2)',
                      color: msg.role === 'user'
                        ? '#fff'
                        : 'var(--fh-t1)',
                      border: msg.role === 'agent' ? '1px solid var(--fh-border)' : 'none',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center justify-center rounded-lg shrink-0 mr-2"
                    style={{
                      width: 24, height: 24,
                      background: 'rgba(113,112,255,0.1)',
                      border: '1px solid rgba(113,112,255,0.2)',
                    }}
                  >
                    <Bot className="h-3 w-3" style={{ color: '#7170ff' }} />
                  </div>
                  <div
                    className="px-3 py-2.5 rounded-xl flex items-center gap-2"
                    style={{
                      background: 'var(--fh-surface-2)',
                      border: '1px solid var(--fh-border)',
                      fontSize: '13px',
                      color: 'var(--fh-t3)',
                    }}
                  >
                    <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: '#7170ff' }} />
                    Processing...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="px-4 py-3 shrink-0"
              style={{ borderTop: '1px solid var(--fh-sep)' }}
            >
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Type a message to demo the agent..."
                  className="flex-1 outline-none transition-all"
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: 'var(--fh-surface-2)',
                    border: '1px solid var(--fh-border-2)',
                    color: 'var(--fh-t1)',
                    fontSize: '13px',
                  }}
                  onFocus={e => { e.currentTarget.style.border = '1px solid rgba(113,112,255,0.35)' }}
                  onBlur={e => { e.currentTarget.style.border = '1px solid var(--fh-border-2)' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="flex items-center justify-center transition-all disabled:opacity-40"
                  style={{
                    width: 40, height: 40,
                    borderRadius: '8px',
                    background: '#5e6ad2',
                    color: '#fff',
                    border: 'none',
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => { if (!loading && input.trim()) e.currentTarget.style.background = '#828fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#5e6ad2' }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--fh-t4)', marginTop: '6px', textAlign: 'center' }}>
                Demo mode — scripted responses. Real execution coming in Phase 2.
              </p>
            </div>
          </div>

          {/* Description card below chat */}
          <div
            className="mt-4 rounded-xl p-5"
            style={{ background: 'var(--fh-surface)', border: '1px solid var(--fh-border)' }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: 590, color: 'var(--fh-t1)', marginBottom: '8px' }}>
              About this agent
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--fh-t3)', lineHeight: 1.7 }}>
              {agent.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
