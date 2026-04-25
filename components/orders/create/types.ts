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

// Slug + labelKey + descKey + visual props. Labels are looked up in i18n
// (t.createOrder[labelKey]) so the form is fully localized.
export const CATEGORIES = [
  { slug: 'dev',         icon: Code2,     color: '#27a644', labelKey: 'catDevLabel',        descKey: 'catDevDesc' },
  { slug: 'ux-ui',       icon: PenSquare, color: '#F24E1E', labelKey: 'catUxUiLabel',       descKey: 'catUxUiDesc' },
  { slug: 'smm',         icon: BarChart2, color: '#E1306C', labelKey: 'catSmmLabel',        descKey: 'catSmmDesc' },
  { slug: 'targeting',   icon: Target,    color: '#1877F2', labelKey: 'catTargetingLabel',  descKey: 'catTargetingDesc' },
  { slug: 'copywriting', icon: PenLine,   color: '#10B981', labelKey: 'catCopyLabel',       descKey: 'catCopyDesc' },
  { slug: 'video',       icon: Video,     color: '#EF4444', labelKey: 'catVideoLabel',      descKey: 'catVideoDesc' },
  { slug: 'tg-bots',     icon: Bot,       color: '#229ED9', labelKey: 'catTgBotsLabel',     descKey: 'catTgBotsDesc' },
  { slug: 'ai-ml',       icon: Brain,     color: '#8B5CF6', labelKey: 'catAiMlLabel',       descKey: 'catAiMlDesc' },
  { slug: 'nocode',      icon: Blocks,    color: '#F59E0B', labelKey: 'catNocodeLabel',     descKey: 'catNocodeDesc' },
  { slug: '3d-art',      icon: Sparkles,  color: '#EC4899', labelKey: 'cat3dArtLabel',      descKey: 'cat3dArtDesc' },
] as const

// `value` stays an English token so DB rows are lang-agnostic.
// The `urgent` flag derives from value === 'urgent' (was: value.includes('Urgent')).
export const DEADLINES = [
  { value: 'urgent',     labelKey: 'dlUrgentLabel',    subKey: 'dlUrgentSub',    icon: '⚡' },
  { value: 'week',       labelKey: 'dlWeekLabel',      subKey: 'dlWeekSub',      icon: '📅' },
  { value: 'twoWeeks',   labelKey: 'dlTwoWeeksLabel',  subKey: 'dlTwoWeeksSub',  icon: '🗓️' },
  { value: 'month',      labelKey: 'dlMonthLabel',     subKey: 'dlMonthSub',     icon: '📆' },
  { value: 'long',       labelKey: 'dlLongLabel',      subKey: 'dlLongSub',      icon: '🔭' },
  { value: 'discuss',    labelKey: 'dlDiscussLabel',   subKey: 'dlDiscussSub',   icon: '💬' },
] as const

export const BUDGET_RANGES = [
  { labelKey: 'brUpTo10',    min: '0',      max: '10000'  },
  { labelKey: 'br10to30',    min: '10000',  max: '30000'  },
  { labelKey: 'br30to60',    min: '30000',  max: '60000'  },
  { labelKey: 'br60to100',   min: '60000',  max: '100000' },
  { labelKey: 'br100plus',   min: '100000', max: '500000' },
  { labelKey: 'brNegotiable',min: '0',      max: '0'      },
] as const

export const STEP_KEYS = ['stepCategory', 'stepDescription', 'stepDetails', 'stepDone'] as const

export const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -30 },
  transition: { duration: 0.25 },
}
