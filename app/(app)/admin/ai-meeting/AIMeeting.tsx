'use client'

import { useState } from 'react'
import { Brain, Shield, Zap, Users, BarChart2, MessageSquare, ChevronDown, ChevronUp, CheckCircle2, Clock, Rocket, Vote } from 'lucide-react'

// ── Company "AI Strategy Meeting" — all top managers + AI models brainstorm
// This is the internal record of the decision to adopt open-source AI tools

interface Tool {
  name:        string
  category:    string
  description: string
  impact:      'critical' | 'high' | 'medium'
  effort:      'low' | 'medium' | 'high'
  status:      'approved' | 'in_review' | 'roadmap'
  votes:       number
  championed:  string  // which "department head" championed it
  notes:       string
}

interface Participant {
  role:    string
  avatar:  string
  opinion: string
  vote:    'for' | 'against' | 'neutral'
}

const TOOLS: Tool[] = [
  // ── Core AI ──────────────────────────────────────────────────────────────
  {
    name: 'Claude API (Anthropic)',
    category: 'LLM',
    description: 'Primary AI backbone. Powers AI assistant, job matching, contract generation, SMM agent, orchestrator. Already integrated.',
    impact: 'critical', effort: 'low', status: 'approved', votes: 12,
    championed: 'CTO', notes: 'Already in production. Model: claude-sonnet-4-6. Cost-effective at scale.',
  },
  {
    name: 'Whisper (OpenAI OSS)',
    category: 'Speech-to-Text',
    description: 'Local speech recognition for voice orders — client dictates what they need, AI transcribes + structures the order automatically.',
    impact: 'high', effort: 'medium', status: 'in_review', votes: 9,
    championed: 'Product', notes: 'Self-hosted via whisper.cpp on edge. Zero API cost after setup. Perfect for mobile-first CIS market.',
  },
  {
    name: 'LangChain / LangGraph',
    category: 'Agent Framework',
    description: 'Orchestration layer for multi-step AI agents. Chain: skill-gap analyzer → job recommender → response drafter → price advisor.',
    impact: 'high', effort: 'medium', status: 'approved', votes: 10,
    championed: 'AI Lead', notes: 'TypeScript SDK. Pairs with our existing orchestrator agent. Enables complex agentic workflows.',
  },
  {
    name: 'Ollama (Local LLM)',
    category: 'LLM (Local)',
    description: 'Run Llama 3.3, Mistral, Qwen2.5 locally for non-sensitive tasks. Zero API cost. Use for: bulk categorization, spam detection, content moderation.',
    impact: 'high', effort: 'medium', status: 'in_review', votes: 8,
    championed: 'Engineering', notes: 'Deploy on Hetzner GPU node. Dramatically reduces AI costs at 1M users.',
  },
  {
    name: 'Sentence Transformers (Hugging Face)',
    category: 'Embeddings',
    description: 'Semantic search: match clients to freelancers by meaning, not keywords. multilingual-e5-large covers 50+ languages including KK, RU, ZH, AR.',
    impact: 'critical', effort: 'medium', status: 'approved', votes: 11,
    championed: 'Search', notes: 'Store embeddings in pgvector (Supabase supports it). Powers AI-Search page.',
  },
  {
    name: 'pgvector (Supabase)',
    category: 'Vector Database',
    description: 'Store and query semantic embeddings directly in Supabase PostgreSQL. No separate vector DB needed. Scales to 100M vectors.',
    impact: 'critical', effort: 'low', status: 'approved', votes: 11,
    championed: 'CTO', notes: 'Already supported by Supabase. Enable extension: CREATE EXTENSION vector;',
  },

  // ── Content & Media ───────────────────────────────────────────────────────
  {
    name: 'Stable Diffusion (SDXL)',
    category: 'Image Generation',
    description: 'AI portfolio thumbnail generation: freelancer describes their work → AI generates professional preview image. Reduces barrier to entry for new freelancers.',
    impact: 'medium', effort: 'high', status: 'roadmap', votes: 6,
    championed: 'Design', notes: 'ComfyUI + SDXL. GPU-intensive. Phase 2 feature. Consider partnering with RunPod.',
  },
  {
    name: 'LanguageTool (OSS)',
    category: 'Text Quality',
    description: 'Grammar/style checker for proposals and order descriptions. Covers RU, KK, EN, AR, ZH. Helps non-native speakers write professional bids.',
    impact: 'medium', effort: 'low', status: 'approved', votes: 7,
    championed: 'Product', notes: 'Self-hosted Java service. Docker image available. Low resource usage.',
  },
  {
    name: 'DeepL API / LibreTranslate',
    category: 'Translation',
    description: 'Auto-translate orders between RU/EN/KK so global clients and local freelancers always understand each other.',
    impact: 'high', effort: 'low', status: 'in_review', votes: 9,
    championed: 'Marketing', notes: 'LibreTranslate for OSS self-hosted; DeepL API for quality-critical translations. Hybrid approach.',
  },

  // ── Trust & Safety ────────────────────────────────────────────────────────
  {
    name: 'Perspective API / Detoxify',
    category: 'Content Moderation',
    description: 'Detect toxic, fraudulent, or spam content in messages and order descriptions. OSS Detoxify runs locally.',
    impact: 'high', effort: 'low', status: 'approved', votes: 10,
    championed: 'Trust & Safety', notes: 'Run Detoxify on every message insert trigger. Flag for human review above threshold.',
  },
  {
    name: 'FingerprintJS OSS',
    category: 'Bot Detection',
    description: 'Browser fingerprinting to detect fake account farms, bot signups, and sybil attacks on the voting/rating system.',
    impact: 'high', effort: 'low', status: 'in_review', votes: 8,
    championed: 'Security', notes: 'OSS version is free. Pro version for advanced signals if needed.',
  },

  // ── Analytics ─────────────────────────────────────────────────────────────
  {
    name: 'PostHog (OSS)',
    category: 'Analytics',
    description: 'Product analytics: funnels, heatmaps, feature flags, A/B testing. Self-hosted → GDPR compliant. No Google Analytics data sharing.',
    impact: 'high', effort: 'low', status: 'approved', votes: 11,
    championed: 'Product', notes: 'Docker Compose deployment. Replaces Google Analytics entirely. EU data stays in EU.',
  },
  {
    name: 'Plausible Analytics',
    category: 'Analytics',
    description: 'Privacy-friendly web analytics for SEO tracking (city pages, category pages). Lightweight script (< 1KB).',
    impact: 'medium', effort: 'low', status: 'approved', votes: 8,
    championed: 'Marketing', notes: 'Simpler than PostHog. Use both: PostHog for product, Plausible for SEO traffic.',
  },
]

const PARTICIPANTS: Participant[] = [
  { role: 'CEO (Alizhan)', avatar: '👑', opinion: 'We need AI everywhere — but it must feel natural. Users should not know they\'re using AI. It should just work.', vote: 'for' },
  { role: 'CTO', avatar: '⚙️', opinion: 'pgvector + embeddings is the #1 priority. Semantic search is our moat. Implement in Sprint 1.', vote: 'for' },
  { role: 'AI Lead', avatar: '🧠', opinion: 'LangGraph for agent orchestration. We build the AI freelancer agent in parallel — it becomes our highest-earning "user".', vote: 'for' },
  { role: 'Head of Product', avatar: '📦', opinion: 'PostHog first. We\'re flying blind without analytics. Also: voice orders via Whisper — massive for mobile in CIS.', vote: 'for' },
  { role: 'Head of Security', avatar: '🛡️', opinion: 'Detoxify + FingerprintJS are non-negotiable. Fake reviews and rating manipulation will kill trust. Ship security before AI features.', vote: 'for' },
  { role: 'Head of Marketing', avatar: '📣', opinion: 'LibreTranslate + DeepL hybrid: global clients, local freelancers, no language barrier. This unlocks the $500B market.', vote: 'for' },
  { role: 'Head of Design', avatar: '🎨', opinion: 'SDXL for portfolio thumbnails is a Phase 2 win. For now — focus on AI that improves existing UX, not new features.', vote: 'neutral' },
  { role: 'Claude Sonnet 4.6 (AI)', avatar: '🤖', opinion: 'I recommend: implement pgvector embeddings and Detoxify this week. They have the highest impact-to-effort ratio. Everything else can be queued.', vote: 'for' },
  { role: 'Llama 3.3 (Local AI)', avatar: '🦙', opinion: 'My role: handle bulk tasks (categorization, spam detection) at zero marginal cost. Deploy me via Ollama. I\'ll reduce your AI bill by 60% at scale.', vote: 'for' },
]

const IMPACT_COLOR: Record<string, string> = { critical: '#ef4444', high: '#f59e0b', medium: '#3b82f6' }
const EFFORT_COLOR: Record<string, string> = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const STATUS_COLOR: Record<string, string> = { approved: '#22c55e', in_review: '#f59e0b', roadmap: '#7170ff' }
const STATUS_LABEL: Record<string, string> = { approved: 'Approved', in_review: 'In Review', roadmap: 'Roadmap' }
const CATEGORY_COLORS: Record<string, string> = {
  'LLM': '#7170ff', 'LLM (Local)': '#8b5cf6', 'Agent Framework': '#06b6d4',
  'Embeddings': '#10b981', 'Vector Database': '#10b981', 'Speech-to-Text': '#f59e0b',
  'Image Generation': '#ec4899', 'Text Quality': '#84cc16', 'Translation': '#14b8a6',
  'Content Moderation': '#ef4444', 'Bot Detection': '#f97316', 'Analytics': '#3b82f6',
}

export default function AIMeeting() {
  const [activeTab, setActiveTab]     = useState<'meeting' | 'tools' | 'roadmap'>('meeting')
  const [expandedTool, setExpanded]   = useState<string | null>(null)
  const [filter, setFilter]           = useState<'all' | 'approved' | 'in_review' | 'roadmap'>('all')

  const filtered = TOOLS.filter(t => filter === 'all' || t.status === filter)

  const approved  = TOOLS.filter(t => t.status === 'approved').length
  const inReview  = TOOLS.filter(t => t.status === 'in_review').length
  const roadmap   = TOOLS.filter(t => t.status === 'roadmap').length

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a14', color: '#e2e2ff', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e1e3a', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Brain style={{ color: '#7170ff' }} size={22} />
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.03em', color: '#fff' }}>AI Strategy Meeting</span>
            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: '#7170ff22', color: '#7170ff', fontWeight: 600 }}>ADMIN ONLY</span>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            FreelanceHub Executive Team + AI Models — Open Source AI Adoption Decision
          </p>
        </div>
        <div style={{ fontSize: 12, color: '#4b5563' }}>April 2026</div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 32px', borderBottom: '1px solid #1e1e3a', display: 'flex', gap: 0 }}>
        {(['meeting', 'tools', 'roadmap'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '14px 20px', fontSize: 13, fontWeight: 590, border: 'none', cursor: 'pointer',
              background: 'transparent', color: activeTab === tab ? '#7170ff' : '#6b7280',
              borderBottom: activeTab === tab ? '2px solid #7170ff' : '2px solid transparent',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'meeting' ? 'Team Meeting' : tab === 'tools' ? 'AI Tools (13)' : 'Sprint Roadmap'}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>

        {/* ── MEETING TAB ──────────────────────────────────────────────── */}
        {activeTab === 'meeting' && (
          <div>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
              {[
                { icon: <CheckCircle2 size={18} />, label: 'Tools Approved', value: approved,  color: '#22c55e' },
                { icon: <Clock size={18} />,        label: 'In Review',      value: inReview,  color: '#f59e0b' },
                { icon: <Rocket size={18} />,       label: 'On Roadmap',     value: roadmap,   color: '#7170ff' },
              ].map(c => (
                <div key={c.label} style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 12, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: c.color, marginBottom: 8 }}>{c.icon}<span style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</span></div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#fff' }}>{c.value}</div>
                </div>
              ))}
            </div>

            {/* Meeting transcript */}
            <div style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 16, padding: 28, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <MessageSquare size={16} style={{ color: '#7170ff' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Meeting Transcript — April 15, 2026</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {PARTICIPANTS.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: '#1e1e3a', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    }}>{p.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e2ff' }}>{p.role}</span>
                        <span style={{
                          fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 600,
                          background: p.vote === 'for' ? '#22c55e22' : p.vote === 'against' ? '#ef444422' : '#f59e0b22',
                          color: p.vote === 'for' ? '#22c55e' : p.vote === 'against' ? '#ef4444' : '#f59e0b',
                        }}>
                          {p.vote === 'for' ? '✓ FOR' : p.vote === 'against' ? '✗ AGAINST' : '○ NEUTRAL'}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>"{p.opinion}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision */}
            <div style={{ background: '#0f1f2f', border: '1px solid #1e3a5f', borderRadius: 16, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Vote size={16} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Final Vote: 8–0 in favor of OSS AI adoption</span>
              </div>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.8, margin: 0 }}>
                The executive team unanimously voted to adopt the open-source AI stack as described.
                Priority order: <strong style={{ color: '#e2e2ff' }}>pgvector embeddings → Detoxify → PostHog → LanguageTool → LangGraph orchestration</strong>.
                SDXL image generation deferred to Q3 2026 (requires GPU infrastructure).
                All tools to be evaluated in staging before production rollout.
              </p>
            </div>
          </div>
        )}

        {/* ── TOOLS TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'tools' && (
          <div>
            {/* Filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {(['all', 'approved', 'in_review', 'roadmap'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 590,
                    border: '1px solid', cursor: 'pointer',
                    background: filter === f ? '#7170ff' : 'transparent',
                    borderColor: filter === f ? '#7170ff' : '#1e1e3a',
                    color: filter === f ? '#fff' : '#6b7280',
                  }}
                >
                  {f === 'all' ? 'All' : f === 'in_review' ? 'In Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(tool => (
                <div
                  key={tool.name}
                  style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 12, overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setExpanded(expandedTool === tool.name ? null : tool.name)}
                    style={{
                      width: '100%', padding: '18px 22px', display: 'flex', alignItems: 'center',
                      gap: 14, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    {/* Category pill */}
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0,
                      background: `${CATEGORY_COLORS[tool.category] || '#7170ff'}22`,
                      color: CATEGORY_COLORS[tool.category] || '#7170ff',
                    }}>{tool.category}</span>

                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#e2e2ff' }}>{tool.name}</span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: IMPACT_COLOR[tool.impact], fontWeight: 600 }}>
                        {tool.impact.toUpperCase()} IMPACT
                      </span>
                      <span style={{ fontSize: 11, color: EFFORT_COLOR[tool.effort], fontWeight: 600 }}>
                        {tool.effort.toUpperCase()} EFFORT
                      </span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                        background: `${STATUS_COLOR[tool.status]}22`, color: STATUS_COLOR[tool.status],
                      }}>{STATUS_LABEL[tool.status]}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280' }}>
                        ▲ {tool.votes}
                      </span>
                      {expandedTool === tool.name
                        ? <ChevronUp size={14} style={{ color: '#6b7280' }} />
                        : <ChevronDown size={14} style={{ color: '#6b7280' }} />}
                    </div>
                  </button>

                  {expandedTool === tool.name && (
                    <div style={{ padding: '0 22px 20px', borderTop: '1px solid #1e1e3a' }}>
                      <div style={{ paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Description</p>
                          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{tool.description}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Engineering Notes</p>
                          <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.7, margin: 0 }}>{tool.notes}</p>
                          <p style={{ fontSize: 12, color: '#4b5563', marginTop: 8 }}>Championed by: <span style={{ color: '#7170ff' }}>{tool.championed}</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ──────────────────────────────────────────────── */}
        {activeTab === 'roadmap' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              {
                sprint: 'Sprint 1 (This Week)',
                color: '#22c55e',
                icon: <Zap size={16} />,
                items: [
                  { tool: 'pgvector', task: 'Enable pgvector in Supabase, store freelancer embeddings, power AI-Search', owner: 'CTO + AI Lead' },
                  { tool: 'Detoxify', task: 'Add content moderation on messages + order descriptions (Python microservice)', owner: 'Security + Engineering' },
                  { tool: 'PostHog', task: 'Install PostHog on frontend, configure funnels: signup → profile → first bid', owner: 'Product' },
                ],
              },
              {
                sprint: 'Sprint 2 (Next Week)',
                color: '#f59e0b',
                icon: <Clock size={16} />,
                items: [
                  { tool: 'LanguageTool', task: 'Self-host LanguageTool, add grammar check UI to bid textarea and order form', owner: 'Engineering + Design' },
                  { tool: 'LangGraph', task: 'Refactor AI orchestrator agent to use LangGraph for multi-step pipelines', owner: 'AI Lead' },
                  { tool: 'FingerprintJS', task: 'Add browser fingerprinting to registration, flag suspicious patterns', owner: 'Security' },
                ],
              },
              {
                sprint: 'Sprint 3 (2 Weeks)',
                color: '#3b82f6',
                icon: <BarChart2 size={16} />,
                items: [
                  { tool: 'LibreTranslate', task: 'Auto-translate order titles/descriptions for cross-language discovery', owner: 'Engineering' },
                  { tool: 'Whisper.cpp', task: 'Voice order creation: record 30s → transcribe → AI structures into order form', owner: 'Engineering + Product' },
                  { tool: 'Ollama (Llama 3.3)', task: 'Deploy local LLM on Hetzner for bulk: categorization, spam scoring, tag extraction', owner: 'Engineering' },
                ],
              },
              {
                sprint: 'Q3 2026 (Phase 2)',
                color: '#7170ff',
                icon: <Rocket size={16} />,
                items: [
                  { tool: 'SDXL', task: 'AI portfolio thumbnail generation: describe → generate professional cover image', owner: 'Design + Engineering' },
                  { tool: 'AI Freelancer Agent', task: 'Full autonomous AI agent that bids on jobs, delivers work, earns revenue', owner: 'AI Lead' },
                  { tool: 'Plausible SEO Dashboard', task: 'Track 137 SEO pages, city pages, category pages — connect to internal analytics', owner: 'Marketing' },
                ],
              },
            ].map(phase => (
              <div key={phase.sprint} style={{ background: '#12121f', border: '1px solid #1e1e3a', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e1e3a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: phase.color }}>{phase.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{phase.sprint}</span>
                </div>
                <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {phase.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: phase.color,
                        flexShrink: 0, marginTop: 6,
                      }} />
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: phase.color }}>{item.tool}</span>
                        <span style={{ fontSize: 13, color: '#9ca3af' }}> — {item.task}</span>
                        <p style={{ fontSize: 11, color: '#4b5563', margin: '2px 0 0' }}>Owner: {item.owner}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Impact summary */}
            <div style={{ background: '#0f1f2f', border: '1px solid #1e3a5f', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Users size={16} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Projected Impact at 1B Users</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: 'AI cost reduction (Ollama vs API-only)', value: '~60%' },
                  { label: 'Search relevance improvement (embeddings)', value: '+40%' },
                  { label: 'Fake review detection rate (Detoxify)', value: '~95%' },
                  { label: 'Cross-language order reach (translation)', value: '6× more' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#12121f', borderRadius: 8, padding: '12px 16px' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#22c55e' }}>{stat.value}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
