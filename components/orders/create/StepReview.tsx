'use client'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { CATEGORIES, slide, type FormData } from './types'

export default function StepReview({ form, user }: {
  form: FormData
  user: SupabaseUser | null
}) {
  const cat = CATEGORIES.find(c => c.slug === form.category)
  const Icon = cat?.icon ?? Sparkles

  return (
    <motion.div key="step3" {...slide} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-1">Review your order</h2>
        <p className="text-sm text-muted-foreground">Everything correct? Click &quot;Publish&quot;</p>
      </div>

      <div className="rounded-xl border border-subtle bg-background divide-y divide-white/6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${cat?.color}20` }}>
              <Icon className="h-3.5 w-3.5" style={{ color: cat?.color }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{cat?.label}</span>
            {form.isUrgent && (
              <span className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                <Zap className="h-3 w-3" /> Urgent
              </span>
            )}
          </div>
          <h3 className="font-semibold">{form.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{form.description}</p>
        </div>

        {form.skills.length > 0 && (
          <div className="px-4 py-3">
            <div className="text-xs text-muted-foreground mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {form.skills.map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-3 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Budget</div>
            <div className="font-semibold text-primary">
              {form.budgetMin && form.budgetMax && parseInt(form.budgetMax) > 0
                ? `${parseInt(form.budgetMin).toLocaleString()} – ${parseInt(form.budgetMax).toLocaleString()} ₸`
                : form.budgetMin ? `from ${parseInt(form.budgetMin).toLocaleString()} ₸`
                : 'Negotiable'
              }
            </div>
            <div className="text-xs text-muted-foreground">{form.budgetType === 'fixed' ? 'fixed price' : 'hourly rate'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Timeline</div>
            <div className="font-semibold">{form.deadline}</div>
          </div>
        </div>
      </div>

      {!user && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
          To publish you need to{' '}
          <a href="/auth/login" className="underline font-medium">sign in</a>
        </div>
      )}
    </motion.div>
  )
}
