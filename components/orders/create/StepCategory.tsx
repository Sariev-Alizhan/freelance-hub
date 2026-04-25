'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { CategorySlug } from '@/lib/supabase/types'
import { useLang } from '@/lib/context/LanguageContext'
import { CATEGORIES, slide, type FormData } from './types'

export default function StepCategory({ form, onSet }: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
}) {
  const { t } = useLang()
  const tc = t.createOrder
  return (
    <motion.div key="step0" {...slide}>
      <h2 className="text-lg font-bold mb-1">{tc.catTitle}</h2>
      <p className="text-sm text-muted-foreground mb-5">{tc.catSub}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon
          const selected = form.category === cat.slug
          return (
            <button
              key={cat.slug}
              onClick={() => onSet('category', cat.slug as CategorySlug)}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-subtle hover:border-white/20 hover:bg-subtle'
              }`}
            >
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ background: `${cat.color}18` }}
              >
                <Icon className="h-5 w-5" style={{ color: cat.color }} />
              </div>
              <div className="text-sm font-semibold">{tc[cat.labelKey]}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{tc[cat.descKey]}</div>
              {selected && (
                <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
