'use client'
import { motion } from 'framer-motion'
import { Sparkles, Zap } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useLang } from '@/lib/context/LanguageContext'
import { CATEGORIES, DEADLINES, slide, type FormData } from './types'

export default function StepReview({ form, user }: {
  form: FormData
  user: SupabaseUser | null
}) {
  const { t } = useLang()
  const tc = t.createOrder
  const cat = CATEGORIES.find(c => c.slug === form.category)
  const Icon = cat?.icon ?? Sparkles
  const deadline = DEADLINES.find(d => d.value === form.deadline)

  return (
    <motion.div key="step3" {...slide} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-1">{tc.reviewTitle}</h2>
        <p className="text-sm text-muted-foreground">{tc.reviewSub}</p>
      </div>

      <div className="rounded-xl border border-subtle bg-background divide-y divide-white/6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg flex items-center justify-center" style={{ background: `${cat?.color}20` }}>
              <Icon className="h-3.5 w-3.5" style={{ color: cat?.color }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{cat ? tc[cat.labelKey] : ''}</span>
            {form.isUrgent && (
              <span className="ml-auto flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                <Zap className="h-3 w-3" /> {tc.urgentBadge}
              </span>
            )}
          </div>
          <h3 className="font-semibold">{form.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{form.description}</p>
        </div>

        {form.skills.length > 0 && (
          <div className="px-4 py-3">
            <div className="text-xs text-muted-foreground mb-2">{tc.reviewSkills}</div>
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
            <div className="text-xs text-muted-foreground mb-1">{tc.reviewBudget}</div>
            <div className="font-semibold text-primary">
              {form.budgetMin && form.budgetMax && parseInt(form.budgetMax) > 0
                ? `${parseInt(form.budgetMin).toLocaleString()} – ${parseInt(form.budgetMax).toLocaleString()} ₸`
                : form.budgetMin && parseInt(form.budgetMin) > 0
                  ? `${tc.fromPrice} ${parseInt(form.budgetMin).toLocaleString()} ₸`
                  : tc.negotiable
              }
            </div>
            <div className="text-xs text-muted-foreground">{form.budgetType === 'fixed' ? tc.fixedPriceLabel : tc.hourlyRateLabel}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">{tc.reviewTimeline}</div>
            <div className="font-semibold">{deadline ? tc[deadline.labelKey] : ''}</div>
          </div>
        </div>
      </div>

      {!user && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-400">
          {tc.needLogin}
          <a href="/auth/login" className="underline font-medium">{tc.signInLink}</a>
        </div>
      )}
    </motion.div>
  )
}
