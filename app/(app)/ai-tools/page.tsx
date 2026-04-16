'use client'

import { useState, useMemo } from 'react'
import { Search, ExternalLink, Sparkles, Star, Zap, Code2, PenLine, Image, Video, Music, BarChart3, Globe, Brain } from 'lucide-react'
import type { Metadata } from 'next'

// ── Tool data ──────────────────────────────────────────────────────────────

type Category = 'all' | 'writing' | 'code' | 'design' | 'video' | 'audio' | 'productivity' | 'research' | 'marketing'

interface Tool {
  id: string
  name: string
  description: string
  category: Exclude<Category, 'all'>
  emoji: string
  tags: string[]
  featured?: boolean
  free?: boolean
}

const TOOLS: Tool[] = [
  // Writing
  { id: 'claude', name: 'Claude', description: 'Advanced AI for writing, analysis, coding, and complex reasoning. Best for long-form content and nuanced tasks.', category: 'writing', emoji: '🤖', tags: ['chat', 'writing', 'code'], featured: true },
  { id: 'chatgpt', name: 'ChatGPT', description: 'OpenAI\'s flagship model. Great for drafting, brainstorming, summarizing, and general tasks.', category: 'writing', emoji: '💬', tags: ['chat', 'writing', 'general'], featured: true },
  { id: 'gemini', name: 'Gemini', description: 'Google\'s multimodal AI — handles text, images, and documents natively. Strong for research.', category: 'writing', emoji: '✨', tags: ['chat', 'multimodal', 'google'] },
  { id: 'notion-ai', name: 'Notion AI', description: 'AI writing assistant built into Notion. Summarize, translate, improve, and auto-fill documents.', category: 'writing', emoji: '📝', tags: ['documents', 'notes', 'productivity'] },
  { id: 'grammarly', name: 'Grammarly', description: 'AI grammar, style, and tone checker. Real-time writing suggestions across the web.', category: 'writing', emoji: '✍️', tags: ['grammar', 'proofreading', 'english'], free: true },
  { id: 'copy-ai', name: 'Copy.ai', description: 'Marketing copy generator. Ad copy, emails, product descriptions, social posts in seconds.', category: 'writing', emoji: '📢', tags: ['marketing', 'copywriting', 'ads'] },
  { id: 'jasper', name: 'Jasper', description: 'AI content platform for marketing teams. Blog posts, SEO content, brand voice consistency.', category: 'writing', emoji: '🖊️', tags: ['content', 'seo', 'blog'] },

  // Code
  { id: 'github-copilot', name: 'GitHub Copilot', description: 'AI pair programmer in your editor. Autocomplete, multi-file edits, and chat in VS Code.', category: 'code', emoji: '🐙', tags: ['autocomplete', 'vscode', 'github'], featured: true },
  { id: 'cursor', name: 'Cursor', description: 'AI-first code editor. Ask questions about your codebase, apply diffs, and generate entire features.', category: 'code', emoji: '⚡', tags: ['editor', 'ai-native', 'codebase'], featured: true },
  { id: 'v0', name: 'v0 by Vercel', description: 'Generate React + Tailwind UI components from natural language prompts. Instant deployable code.', category: 'code', emoji: '🎯', tags: ['ui', 'react', 'vercel'] },
  { id: 'codeium', name: 'Codeium', description: 'Free AI code completion and chat. Works in 70+ languages across 40+ editors.', category: 'code', emoji: '💻', tags: ['autocomplete', 'free', 'multi-language'], free: true },
  { id: 'replit-ai', name: 'Replit AI', description: 'Build and deploy apps in the browser with AI assistance. Great for prototyping.', category: 'code', emoji: '🔁', tags: ['browser', 'deploy', 'prototyping'] },

  // Design
  { id: 'midjourney', name: 'Midjourney', description: 'State-of-the-art image generation. Photorealistic renders, illustrations, concept art.', category: 'design', emoji: '🎨', tags: ['image-gen', 'art', 'illustration'], featured: true },
  { id: 'dalle3', name: 'DALL·E 3', description: 'OpenAI\'s image model — precise prompt following, accessible through ChatGPT Plus.', category: 'design', emoji: '🖼️', tags: ['image-gen', 'openai', 'creative'] },
  { id: 'stable-diffusion', name: 'Stable Diffusion', description: 'Open-source image generation model. Run locally or via services like Automatic1111.', category: 'design', emoji: '🌊', tags: ['image-gen', 'open-source', 'local'], free: true },
  { id: 'figma-ai', name: 'Figma AI', description: 'AI features in Figma: auto-name layers, generate UI from prompts, rename variables.', category: 'design', emoji: '🔷', tags: ['ui-design', 'figma', 'prototyping'] },
  { id: 'canva-ai', name: 'Canva Magic Studio', description: 'AI suite in Canva: text-to-image, background remover, Magic Write, AI presentations.', category: 'design', emoji: '🪄', tags: ['graphics', 'presentations', 'marketing'] },
  { id: 'looka', name: 'Looka', description: 'AI logo and brand identity generator. Get a full brand kit in minutes.', category: 'design', emoji: '💎', tags: ['logo', 'branding', 'identity'] },

  // Video
  { id: 'runway', name: 'Runway Gen-3', description: 'Professional AI video generation and editing. Text-to-video, image-to-video, motion brush.', category: 'video', emoji: '🎬', tags: ['video-gen', 'editing', 'creative'], featured: true },
  { id: 'sora', name: 'Sora (OpenAI)', description: 'OpenAI\'s text-to-video model. Cinematic quality, complex scenes, consistent characters.', category: 'video', emoji: '🎥', tags: ['video-gen', 'openai', 'cinematic'] },
  { id: 'heygen', name: 'HeyGen', description: 'AI avatar video creator. Turn text scripts into talking head videos in 100+ languages.', category: 'video', emoji: '👤', tags: ['avatar', 'translation', 'marketing'] },
  { id: 'descript', name: 'Descript', description: 'Edit video by editing the transcript. AI overdub, filler word removal, screen recording.', category: 'video', emoji: '✂️', tags: ['editing', 'transcript', 'podcast'] },

  // Audio
  { id: 'elevenlabs', name: 'ElevenLabs', description: 'Ultra-realistic AI voice cloning and text-to-speech. 29 languages, voice library.', category: 'audio', emoji: '🎙️', tags: ['tts', 'voice-clone', 'narration'], featured: true },
  { id: 'suno', name: 'Suno', description: 'AI music generation from text prompts. Full songs with vocals and instrumentation.', category: 'audio', emoji: '🎵', tags: ['music', 'generation', 'songs'] },
  { id: 'udio', name: 'Udio', description: 'High-quality AI music creation. Custom genre, tempo, mood, and lyrics.', category: 'audio', emoji: '🎶', tags: ['music', 'generation', 'custom'] },
  { id: 'whisper', name: 'Whisper (OpenAI)', description: 'Open-source speech-to-text. Highly accurate transcription for 50+ languages.', category: 'audio', emoji: '📻', tags: ['transcription', 'stt', 'open-source'], free: true },

  // Productivity
  { id: 'perplexity', name: 'Perplexity', description: 'AI search engine with real-time web citations. Best for research and fact-checking.', category: 'productivity', emoji: '🔍', tags: ['search', 'research', 'citations'], featured: true },
  { id: 'otter-ai', name: 'Otter.ai', description: 'Real-time meeting transcription and summarization. Integrates with Zoom, Teams, Meet.', category: 'productivity', emoji: '🦦', tags: ['meetings', 'transcription', 'notes'] },
  { id: 'mem-ai', name: 'Mem', description: 'AI-organized workspace. Surfaces relevant notes automatically based on what you\'re working on.', category: 'productivity', emoji: '🧠', tags: ['notes', 'knowledge', 'organization'] },
  { id: 'clickup-ai', name: 'ClickUp AI', description: 'AI project management: write tasks, generate summaries, automate workflows.', category: 'productivity', emoji: '✅', tags: ['project-management', 'tasks', 'automation'] },

  // Research
  { id: 'elicit', name: 'Elicit', description: 'AI research assistant that finds and summarizes academic papers. Great for literature reviews.', category: 'research', emoji: '📚', tags: ['academic', 'papers', 'literature'], free: true },
  { id: 'consensus', name: 'Consensus', description: 'Search engine for scientific evidence. Ask research questions, get answers from papers.', category: 'research', emoji: '🔬', tags: ['scientific', 'evidence', 'papers'] },
  { id: 'scite', name: 'Scite', description: 'Citation analysis tool. See how papers are cited and if findings were supported or disputed.', category: 'research', emoji: '📊', tags: ['citations', 'analysis', 'academic'] },

  // Marketing
  { id: 'surfer-seo', name: 'Surfer SEO', description: 'AI content optimization for search rankings. NLP-based scoring, SERP analysis.', category: 'marketing', emoji: '🏄', tags: ['seo', 'content', 'rankings'] },
  { id: 'phrasee', name: 'Phrasee', description: 'AI-powered email subject lines and push notification copy with brand voice control.', category: 'marketing', emoji: '📧', tags: ['email', 'push', 'copy'] },
  { id: 'albert-ai', name: 'Albert.ai', description: 'Autonomous digital marketing AI. Manages paid ads across channels, self-optimizing.', category: 'marketing', emoji: '📈', tags: ['ads', 'paid-media', 'automation'] },
]

const CATEGORIES: { id: Category; label: string; icon: React.ElementType }[] = [
  { id: 'all',          label: 'All tools',    icon: Sparkles  },
  { id: 'writing',      label: 'Writing',      icon: PenLine   },
  { id: 'code',         label: 'Code',         icon: Code2     },
  { id: 'design',       label: 'Design',       icon: Image     },
  { id: 'video',        label: 'Video',        icon: Video     },
  { id: 'audio',        label: 'Audio',        icon: Music     },
  { id: 'productivity', label: 'Productivity', icon: Zap       },
  { id: 'research',     label: 'Research',     icon: Brain     },
  { id: 'marketing',    label: 'Marketing',    icon: BarChart3 },
]

const CATEGORY_COLORS: Record<Exclude<Category, 'all'>, string> = {
  writing:      'bg-blue-500/10 text-blue-400',
  code:         'bg-emerald-500/10 text-emerald-400',
  design:       'bg-purple-500/10 text-purple-400',
  video:        'bg-red-500/10 text-red-400',
  audio:        'bg-pink-500/10 text-pink-400',
  productivity: 'bg-amber-500/10 text-amber-400',
  research:     'bg-cyan-500/10 text-cyan-400',
  marketing:    'bg-orange-500/10 text-orange-400',
}

// Tool URLs — kept separate so they're not rendered in the static list
const TOOL_URLS: Record<string, string> = {
  'claude':           'https://claude.ai',
  'chatgpt':          'https://chatgpt.com',
  'gemini':           'https://gemini.google.com',
  'notion-ai':        'https://notion.so',
  'grammarly':        'https://grammarly.com',
  'copy-ai':          'https://copy.ai',
  'jasper':           'https://jasper.ai',
  'github-copilot':   'https://github.com/features/copilot',
  'cursor':           'https://cursor.com',
  'v0':               'https://v0.dev',
  'codeium':          'https://codeium.com',
  'replit-ai':        'https://replit.com',
  'midjourney':       'https://midjourney.com',
  'dalle3':           'https://chatgpt.com',
  'stable-diffusion': 'https://stability.ai',
  'figma-ai':         'https://figma.com',
  'canva-ai':         'https://canva.com',
  'looka':            'https://looka.com',
  'runway':           'https://runwayml.com',
  'sora':             'https://sora.com',
  'heygen':           'https://heygen.com',
  'descript':         'https://descript.com',
  'elevenlabs':       'https://elevenlabs.io',
  'suno':             'https://suno.com',
  'udio':             'https://udio.com',
  'whisper':          'https://github.com/openai/whisper',
  'perplexity':       'https://perplexity.ai',
  'otter-ai':         'https://otter.ai',
  'mem-ai':           'https://mem.ai',
  'clickup-ai':       'https://clickup.com',
  'elicit':           'https://elicit.org',
  'consensus':        'https://consensus.app',
  'scite':            'https://scite.ai',
  'surfer-seo':       'https://surferseo.com',
  'phrasee':          'https://phrasee.co',
  'albert-ai':        'https://albert.ai',
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AIToolsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let list = TOOLS
    if (activeCategory !== 'all') list = list.filter(t => t.category === activeCategory)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.includes(q))
      )
    }
    // Featured first, then alphabetical
    return [...list].sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return a.name.localeCompare(b.name)
    })
  }, [activeCategory, query])

  const featured = TOOLS.filter(t => t.featured)

  return (
    <div className="page-shell page-shell--wide">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          {TOOLS.length} tools curated for freelancers
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Tools Marketplace</h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
          The best AI tools for freelancers — writing, coding, design, video, audio, research, and more.
        </p>
      </div>

      {/* Featured row */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold">Featured</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(tool => (
            <a
              key={tool.id}
              href={TOOL_URLS[tool.id]}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-primary/20 bg-primary/5 p-5 hover:border-primary/40 hover:bg-primary/8 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{tool.emoji}</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="font-semibold text-sm mb-1">{tool.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search tools..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-subtle bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const active = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'border-subtle bg-surface text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-4">
        {filtered.length} {filtered.length === 1 ? 'tool' : 'tools'}
        {activeCategory !== 'all' && ` in ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
        {query && ` matching "${query}"`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p>No tools found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(tool => (
            <a
              key={tool.id}
              href={TOOL_URLS[tool.id]}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-subtle bg-card p-5 hover:border-primary/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tool.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{tool.name}</span>
                      {tool.free && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">
                          FREE
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[tool.category]}`}>
                      {CATEGORIES.find(c => c.id === tool.category)?.label}
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{tool.description}</p>

              <div className="flex flex-wrap gap-1">
                {tool.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-surface text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Submit CTA */}
      <div className="mt-12 rounded-2xl border border-subtle bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold mb-1">Know a tool we missed?</p>
          <p className="text-sm text-muted-foreground">
            The AI landscape moves fast. Suggest a tool and we&apos;ll review it for inclusion.
          </p>
        </div>
        <a
          href="mailto:support@freelance-hub.kz?subject=AI Tool Suggestion"
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          Suggest a tool
        </a>
      </div>

    </div>
  )
}
