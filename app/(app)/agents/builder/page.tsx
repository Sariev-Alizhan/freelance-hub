'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = [
  { value: 'smm', label: 'SMM & Marketing' },
  { value: 'copywriting', label: 'Copywriting' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'custom', label: 'Custom' },
]

const SUGGESTED_SKILLS = [
  'Content Creation', 'SEO', 'Social Media', 'Copywriting',
  'Data Analysis', 'Python', 'JavaScript', 'Market Research',
  'Email Marketing', 'Ad Campaigns', 'UX Writing', 'Translation',
]

export default function AgentBuilderPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    category: 'custom',
    skills: [] as string[],
    system_prompt: '',
    price_per_task: 10,
  })
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function addSkill(skill: string) {
    const s = skill.trim()
    if (!s || form.skills.includes(s)) return
    set('skills', [...form.skills, s])
    setSkillInput('')
  }

  function removeSkill(skill: string) {
    set('skills', form.skills.filter(s => s !== skill))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.tagline.trim() || !form.system_prompt.trim()) {
      setError('Name, tagline, and system prompt are required.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/agents/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create agent')
      router.push('/agents/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/agents/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-lg font-semibold">Agent Builder</h1>
          </div>
          <button
            onClick={() => setPreviewOpen(p => !p)}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {previewOpen ? 'Hide Preview' : 'Preview Card'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Agent Card Preview */}
        {previewOpen && (
          <div className="mb-8 p-4 rounded-2xl bg-gray-900/50 border border-white/10">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">Preview</p>
            <div className="bg-gray-800 rounded-xl p-5 flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0">
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{form.name || 'Agent Name'}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">{form.tagline || 'Short description of what this agent does'}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-400 flex-shrink-0">
                    {form.price_per_task.toLocaleString()} ₸/task
                  </span>
                </div>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {form.skills.map(s => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-300">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Basic Info</h2>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Agent Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. SEO Content Writer"
                maxLength={60}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Tagline *</label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => set('tagline', e.target.value)}
                placeholder="e.g. Creates SEO-optimized blog posts in seconds"
                maxLength={100}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe what your agent does, its capabilities, and ideal use cases..."
                rows={3}
                maxLength={500}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Price per Task (₸)</label>
                <input
                  type="number"
                  min={1000}
                  max={500000}
                  value={form.price_per_task}
                  onChange={e => set('price_per_task', parseInt(e.target.value) || 1)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Skills & Tags</h2>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }}
                placeholder="Add a skill..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => addSkill(skillInput)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                Add
              </button>
            </div>

            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills.map(s => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="text-purple-400 hover:text-white transition-colors leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-2">Suggested:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter(s => !form.skills.includes(s)).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => addSkill(s)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* System Prompt */}
          <section className="bg-gray-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-white">System Prompt *</h2>
              <p className="text-xs text-gray-500 mt-1">
                This is the instruction set Claude will follow when running your agent. Be specific about tone, format, and behavior.
              </p>
            </div>

            <textarea
              value={form.system_prompt}
              onChange={e => set('system_prompt', e.target.value)}
              placeholder={`You are a professional SEO content writer specializing in long-form articles.\n\nWhen given a topic:\n1. Write an engaging introduction\n2. Structure content with clear H2/H3 headings\n3. Include relevant keywords naturally\n4. Add a compelling call-to-action\n\nAlways write in a professional yet accessible tone. Target word count: 800-1200 words.`}
              rows={10}
              className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-purple-500 transition-colors resize-y"
            />

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
              <strong>Tips for a great system prompt:</strong>
              <ul className="mt-1 space-y-0.5 list-disc list-inside text-amber-400/80">
                <li>Define the agent&apos;s role clearly in the first sentence</li>
                <li>Specify output format (JSON, markdown, plain text)</li>
                <li>Include examples of good vs bad responses if needed</li>
                <li>Set tone, length, and language expectations</li>
              </ul>
            </div>
          </section>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/agents/dashboard')}
              className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
