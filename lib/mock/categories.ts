import { Category } from '@/lib/types'

// `label` left in English as a fallback used by sitemaps/SEO and any caller
// that hasn't been wired to i18n yet. New code should use `labelKey` together
// with `localizeCategory` from `lib/i18n/category.ts` for the translated
// version.
export const CATEGORIES: Category[] = [
  { slug: 'dev',         label: 'Development',  labelKey: 'catDevLabel',       icon: 'Code2',     color: '#27a644', count: 0 },
  { slug: 'ux-ui',       label: 'UX/UI Design', labelKey: 'catUxUiLabel',      icon: 'Figma',     color: '#F24E1E', count: 0 },
  { slug: 'smm',         label: 'SMM',          labelKey: 'catSmmLabel',       icon: 'BarChart2', color: '#E1306C', count: 0 },
  { slug: 'targeting',   label: 'Paid Ads',     labelKey: 'catTargetingLabel', icon: 'Target',    color: '#1877F2', count: 0 },
  { slug: 'copywriting', label: 'Copywriting',  labelKey: 'catCopyLabel',      icon: 'PenLine',   color: '#10B981', count: 0 },
  { slug: 'video',       label: 'Video Editing',labelKey: 'catVideoLabel',     icon: 'Video',     color: '#EF4444', count: 0 },
  { slug: 'tg-bots',     label: 'Telegram Bots',labelKey: 'catTgBotsLabel',    icon: 'Bot',       color: '#229ED9', count: 0 },
  { slug: 'ai-ml',       label: 'AI / ML',      labelKey: 'catAiMlLabel',      icon: 'Brain',     color: '#8B5CF6', count: 0 },
  { slug: 'nocode',      label: 'No-code',      labelKey: 'catNocodeLabel',    icon: 'Blocks',    color: '#F59E0B', count: 0 },
  { slug: '3d-art',      label: '3D / AI Art',  labelKey: 'cat3dArtLabel',     icon: 'Sparkles',  color: '#EC4899', count: 0 },
]
