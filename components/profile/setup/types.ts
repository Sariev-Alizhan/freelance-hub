import {
  Code2, PenSquare, BarChart2, Target, PenLine,
  Video, Bot, Brain, Blocks, Sparkles,
} from 'lucide-react'
import type { CategorySlug, FreelancerLevel } from '@/lib/supabase/types'

export const CATEGORIES = [
  { slug: 'dev',         label: 'Development',  icon: Code2,     color: '#27a644' },
  { slug: 'ux-ui',       label: 'UX/UI Design', icon: PenSquare, color: '#F24E1E' },
  { slug: 'smm',         label: 'SMM',           icon: BarChart2, color: '#E1306C' },
  { slug: 'targeting',   label: 'Targeting',     icon: Target,    color: '#1877F2' },
  { slug: 'copywriting', label: 'Copywriting',   icon: PenLine,   color: '#10B981' },
  { slug: 'video',       label: 'Video editing', icon: Video,     color: '#EF4444' },
  { slug: 'tg-bots',     label: 'Telegram bots', icon: Bot,       color: '#229ED9' },
  { slug: 'ai-ml',       label: 'AI / ML',       icon: Brain,     color: '#8B5CF6' },
  { slug: 'nocode',      label: 'No-code',        icon: Blocks,    color: '#F59E0B' },
  { slug: '3d-art',      label: '3D / AI art',   icon: Sparkles,  color: '#EC4899' },
] as const

export const LEVELS: { value: FreelancerLevel; label: string; sub: string; icon: string }[] = [
  { value: 'new',    label: 'Newcomer', sub: 'up to 1 year',    icon: '🌱' },
  { value: 'junior', label: 'Junior',   sub: '1–2 years',       icon: '⚡' },
  { value: 'middle', label: 'Middle',   sub: '2–4 years',       icon: '🔥' },
  { value: 'senior', label: 'Senior',   sub: '4+ years',        icon: '💎' },
  { value: 'top',    label: 'Top',      sub: 'industry expert', icon: '👑' },
]

export const RESPONSE_TIMES = [
  { value: 'within 1 hour',  label: '< 1 hour',  icon: '⚡' },
  { value: 'within 4 hours', label: '< 4 hours', icon: '🕐' },
  { value: 'within a day',   label: '< 1 day',   icon: '📅' },
  { value: 'within 2 days',  label: '2 days',    icon: '🗓️' },
]

export const LANGUAGES = ['Russian', 'Ukrainian', 'Kazakh', 'English', 'Deutsch', 'Español', '中文']

export const STEPS = ['Personal', 'Specialization', 'Skills & rates', 'Portfolio', 'Done']

export interface PortfolioItem {
  title: string
  imageUrl: string
  category: string
  url: string
}

export interface FormData {
  fullName: string
  location: string
  bio: string
  avatarFile: File | null
  avatarPreview: string
  title: string
  category: CategorySlug | ''
  level: FreelancerLevel
  responseTime: string
  languages: string[]
  skills: string[]
  priceFrom: string
  priceTo: string
  portfolio: PortfolioItem[]
}

export const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -30 },
  transition: { duration: 0.22 },
}
