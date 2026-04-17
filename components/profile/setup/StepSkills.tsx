'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Tag, DollarSign, X, Plus } from 'lucide-react'
import { slide, type FormData } from './types'

export default function StepSkills({
  form, onSet, skillInput, onSkillInputChange, onAddSkill,
}: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  skillInput: string
  onSkillInputChange: (v: string) => void
  onAddSkill: (s: string) => void
}) {
  const skillInputRef = useRef<HTMLInputElement>(null)

  return (
    <motion.div key="s2" {...slide} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Skills & rates</h2>
        <p className="text-sm text-muted-foreground">Show what you can do and how much your services cost</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          Skills *
          <span className="text-muted-foreground font-normal text-xs">minimum 2</span>
        </label>

        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {form.skills.map(skill => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20"
              >
                {skill}
                <button onClick={() => onSet('skills', form.skills.filter(s => s !== skill))} className="hover:text-white transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={skillInputRef}
            value={skillInput}
            onChange={e => onSkillInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); onAddSkill(skillInput) }
            }}
            placeholder="React, Figma, Python... (press Enter to add)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={() => onAddSkill(skillInput)}
            disabled={!skillInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          {form.skills.length}/15 skills added
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          Service rate ($/project)
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From * ($)</label>
            <input
              type="number"
              value={form.priceFrom}
              onChange={e => onSet('priceFrom', e.target.value)}
              placeholder="5 000"
              className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To ($)</label>
            <input
              type="number"
              value={form.priceTo}
              onChange={e => onSet('priceTo', e.target.value)}
              placeholder="50 000"
              className="w-full px-4 py-3 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {form.priceFrom && (
          <div className="mt-3 p-3 rounded-xl bg-green-500/5 border border-green-500/20 text-sm text-green-400">
            Clients will see: from ${parseInt(form.priceFrom).toLocaleString()}
            {form.priceTo ? ` – $${parseInt(form.priceTo).toLocaleString()}` : ''}
          </div>
        )}
      </div>
    </motion.div>
  )
}
