import {
  Code2, PenSquare, BarChart2, Target, PenLine,
  Video, Bot, Brain, Blocks, Sparkles,
} from 'lucide-react'
import type { CategorySlug } from '@/lib/supabase/types'

export interface FormData {
  category: CategorySlug | ''
  title: string
  description: string
  skills: string[]
  budgetMin: string
  budgetMax: string
  budgetType: 'fixed' | 'hourly'
  deadline: string
  isUrgent: boolean
}

export interface PriceAdvice {
  min: number
  max: number
  explanation: string
}

export const CATEGORIES = [
  { slug: 'dev',         label: 'Development',    icon: Code2,     color: '#6366F1', desc: 'Websites, apps, bots' },
  { slug: 'ux-ui',       label: 'UX/UI Design',   icon: PenSquare, color: '#F24E1E', desc: 'Interfaces, prototypes' },
  { slug: 'smm',         label: 'SMM',             icon: BarChart2, color: '#E1306C', desc: 'Social media, content' },
  { slug: 'targeting',   label: 'Targeting',       icon: Target,    color: '#1877F2', desc: 'Ads, leads' },
  { slug: 'copywriting', label: 'Copywriting',     icon: PenLine,   color: '#10B981', desc: 'Text, SEO, email' },
  { slug: 'video',       label: 'Video editing',   icon: Video,     color: '#EF4444', desc: 'Videos, Reels, editing' },
  { slug: 'tg-bots',     label: 'Telegram bots',   icon: Bot,       color: '#229ED9', desc: 'Bots, mini-apps' },
  { slug: 'ai-ml',       label: 'AI / ML',         icon: Brain,     color: '#8B5CF6', desc: 'Neural nets, automation' },
  { slug: 'nocode',      label: 'No-code',         icon: Blocks,    color: '#F59E0B', desc: 'Bubble, Webflow, Make' },
  { slug: '3d-art',      label: '3D / AI art',     icon: Sparkles,  color: '#EC4899', desc: 'Illustrations, 3D' },
] as const

export const DEADLINES = [
  { value: 'Urgent (1-2 days)',  label: 'Urgent',   sub: '1–2 days',  icon: '⚡' },
  { value: 'Up to 1 week',       label: '1 week',   sub: 'up to 7d',  icon: '📅' },
  { value: 'Up to 2 weeks',      label: '2 weeks',  sub: '7–14 days', icon: '🗓️' },
  { value: 'Up to 1 month',      label: '1 month',  sub: '14–30 days',icon: '📆' },
  { value: 'Over a month',       label: 'Long-term',sub: '30+ days',  icon: '🔭' },
  { value: 'To be discussed',    label: 'Discuss',  sub: 'flexible',  icon: '💬' },
]

export const BUDGET_RANGES = [
  { label: 'up to ₸10 000', min: '0',     max: '10000'  },
  { label: '₸10–30 000',    min: '10000', max: '30000'  },
  { label: '₸30–60 000',    min: '30000', max: '60000'  },
  { label: '₸60–100 000',   min: '60000', max: '100000' },
  { label: '₸100 000+',     min: '100000',max: '500000' },
  { label: 'Negotiable',     min: '0',     max: '0'      },
]

export const STEPS = ['Category', 'Description', 'Details', 'Done']

export const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -30 },
  transition: { duration: 0.25 },
}
