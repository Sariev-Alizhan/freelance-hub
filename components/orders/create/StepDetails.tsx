'use client'
import { motion } from 'framer-motion'
import { Tag, DollarSign, Clock, X, Loader2, Wand2, Zap, Check } from 'lucide-react'
import { BUDGET_RANGES, DEADLINES, slide, type FormData, type PriceAdvice } from './types'

export default function StepDetails({
  form, onSet, skillInput, onSkillInputChange, onAddSkill, onRemoveSkill,
  priceAdvice, priceAdviceLoading, onGetPriceAdvice, onApplyPriceAdvice,
}: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
  skillInput: string
  onSkillInputChange: (v: string) => void
  onAddSkill: (s: string) => void
  onRemoveSkill: (s: string) => void
  priceAdvice: PriceAdvice | null
  priceAdviceLoading: boolean
  onGetPriceAdvice: () => void
  onApplyPriceAdvice: () => void
}) {
  return (
    <motion.div key="step2" {...slide} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-1">Order details</h2>
        <p className="text-sm text-muted-foreground">Skills, budget and timeline</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-1.5 block">
          <Tag className="h-3.5 w-3.5 text-muted-foreground" />
          Required skills
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2 min-h-[36px] mb-2">
          {form.skills.map(skill => (
            <span key={skill} className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              {skill}
              <button onClick={() => onRemoveSkill(skill)} className="hover:text-white transition-colors">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={e => onSkillInputChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); onAddSkill(skillInput) }
            }}
            placeholder="React, Figma, Python... (Enter to add)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={() => onAddSkill(skillInput)}
            disabled={!skillInput.trim()}
            className="px-4 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
          <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
          Payment type
        </label>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(['fixed', 'hourly'] as const).map(type => (
            <button
              key={type}
              onClick={() => onSet('budgetType', type)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                form.budgetType === type
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-subtle text-muted-foreground hover:border-white/20'
              }`}
            >
              {type === 'fixed' ? '💰 Fixed price' : '⏱️ Hourly rate'}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <button
            type="button"
            onClick={onGetPriceAdvice}
            disabled={priceAdviceLoading || !form.description}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {priceAdviceLoading
              ? <Loader2 className="h-3 w-3 animate-spin" />
              : <Wand2 className="h-3 w-3" />
            }
            AI price suggestion
          </button>

          {priceAdvice && (
            <div className="mt-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-primary">
                  AI suggests: {priceAdvice.min.toLocaleString()} – {priceAdvice.max.toLocaleString()} ₸
                </span>
                <button
                  type="button"
                  onClick={onApplyPriceAdvice}
                  className="text-xs px-2 py-0.5 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                >
                  Use
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{priceAdvice.explanation}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {BUDGET_RANGES.map(range => (
            <button
              key={range.label}
              onClick={() => { onSet('budgetMin', range.min); onSet('budgetMax', range.max) }}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                form.budgetMin === range.min && form.budgetMax === range.max
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-subtle text-muted-foreground hover:border-white/20 hover:text-foreground'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">From (₸)</label>
            <input
              type="number"
              value={form.budgetMin}
              onChange={e => onSet('budgetMin', e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">To (₸)</label>
            <input
              type="number"
              value={form.budgetMax}
              onChange={e => onSet('budgetMax', e.target.value)}
              placeholder="50000"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-subtle text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 flex items-center gap-1.5 block">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          Timeline
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DEADLINES.map(d => (
            <button
              key={d.value}
              onClick={() => {
                onSet('deadline', d.value)
                onSet('isUrgent', d.value.includes('Urgent'))
              }}
              className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                form.deadline === d.value
                  ? 'border-primary bg-primary/10'
                  : 'border-subtle hover:border-white/20'
              }`}
            >
              <span className="text-lg">{d.icon}</span>
              <div>
                <div className={`text-xs font-semibold ${form.deadline === d.value ? 'text-primary' : ''}`}>{d.label}</div>
                <div className="text-xs text-muted-foreground">{d.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {!form.deadline.includes('Urgent') && (
        <button
          onClick={() => onSet('isUrgent', !form.isUrgent)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
            form.isUrgent
              ? 'border-red-500/50 bg-red-500/10'
              : 'border-subtle hover:border-white/20'
          }`}
        >
          <div className={`h-5 w-5 rounded flex items-center justify-center ${form.isUrgent ? 'bg-red-500' : 'border border-white/20'}`}>
            {form.isUrgent && <Check className="h-3 w-3 text-white" />}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className={`h-3.5 w-3.5 ${form.isUrgent ? 'text-red-400' : 'text-muted-foreground'}`} />
              Urgent order
            </div>
            <div className="text-xs text-muted-foreground">Get responses faster</div>
          </div>
        </button>
      )}
    </motion.div>
  )
}
