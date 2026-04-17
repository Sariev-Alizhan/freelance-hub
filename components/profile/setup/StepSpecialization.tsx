'use client'
import { motion } from 'framer-motion'
import {
  Check, Briefcase, Star, Clock, Globe, Sparkles, Wand2, Loader2,
} from 'lucide-react'
import type { CategorySlug } from '@/lib/supabase/types'
import { CATEGORIES, LEVELS, RESPONSE_TIMES, LANGUAGES, slide, type FormData } from './types'

export default function StepSpecialization({
  form, onSet, onToggleLanguage, onGenerateBio, aiLoading,
}: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  onToggleLanguage: (lang: string) => void
  onGenerateBio: () => void
  aiLoading: boolean
}) {
  return (
    <motion.div key="s1" {...slide} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Specialization</h2>
        <p className="text-sm text-muted-foreground">Choose your main area of work</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Category *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon
            const sel = form.category === cat.slug
            return (
              <button
                key={cat.slug}
                onClick={() => onSet('category', cat.slug as CategorySlug)}
                className={`group flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                  sel ? 'border-primary bg-primary/8' : 'border-subtle hover:border-white/20 hover:bg-subtle'
                }`}
              >
                <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${cat.color}18` }}>
                  <Icon className="h-4 w-4" style={{ color: cat.color }} />
                </div>
                <span className={`text-xs font-medium ${sel ? 'text-primary' : ''}`}>{cat.label}</span>
                {sel && <Check className="h-3 w-3 text-primary ml-auto" />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          Job title / specialization *
        </label>
        <input
          value={form.title}
          onChange={e => onSet('title', e.target.value)}
          placeholder="Full-stack developer, SMM specialist, UI/UX designer..."
          className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
          <Star className="h-3.5 w-3.5 text-muted-foreground" />
          Experience level
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LEVELS.map(lv => (
            <button
              key={lv.value}
              onClick={() => onSet('level', lv.value)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                form.level === lv.value ? 'border-primary bg-primary/8' : 'border-subtle hover:border-white/20'
              }`}
            >
              <span className="text-base">{lv.icon}</span>
              <div>
                <div className={`text-xs font-semibold ${form.level === lv.value ? 'text-primary' : ''}`}>{lv.label}</div>
                <div className="text-xs text-muted-foreground">{lv.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          Response time
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RESPONSE_TIMES.map(rt => (
            <button
              key={rt.value}
              onClick={() => onSet('responseTime', rt.value)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                form.responseTime === rt.value ? 'border-primary bg-primary/8 text-primary' : 'border-subtle hover:border-white/20 text-muted-foreground'
              }`}
            >
              <span>{rt.icon}</span>
              <span className="text-sm font-medium">{rt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          Communication languages
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => onToggleLanguage(lang)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                form.languages.includes(lang)
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'border-subtle text-muted-foreground hover:border-white/20 hover:text-foreground'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {form.title && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI description</span>
            </div>
            <button
              onClick={onGenerateBio}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
              Generate
            </button>
          </div>
          {form.bio ? (
            <p className="text-xs text-muted-foreground leading-relaxed">{form.bio}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              AI will write your &apos;About me&apos; based on your specialization and skills
            </p>
          )}
          {form.bio && (
            <button
              onClick={() => onSet('bio', '')}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}
