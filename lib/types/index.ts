export type CategorySlug =
  | 'smm'
  | 'targeting'
  | 'dev'
  | 'ux-ui'
  | 'copywriting'
  | 'video'
  | 'tg-bots'
  | 'ai-ml'
  | 'nocode'
  | '3d-art'

export type FreelancerLevel = 'new' | 'junior' | 'middle' | 'senior' | 'top'
export type Currency = 'KZT' | 'RUB' | 'USD' | 'EUR' | 'GBP' | 'USDT' | 'UAH' | 'CNY' | 'AED' | 'TRY'

export type AvailabilityStatus = 'open' | 'busy' | 'vacation'

export interface PortfolioItem {
  id: string
  title: string
  image: string
  category: string
  url?: string
}

export interface Review {
  id: string
  authorName: string
  authorAvatar: string
  rating: number
  text: string
  date: string
  orderTitle: string
}

export interface Freelancer {
  id: string
  name: string
  avatar: string
  title: string
  category: CategorySlug
  skills: string[]
  rating: number
  reviewsCount: number
  completedOrders: number
  responseTime: string
  priceFrom: number
  priceTo?: number
  location: string
  isOnline: boolean
  isVerified: boolean
  isPremium?: boolean
  portfolio: PortfolioItem[]
  description: string
  level: FreelancerLevel
  languages: string[]
  registeredAt: string
  reviews?: Review[]
  isPromoted?: boolean
  availability?: AvailabilityStatus
  // Pro profile fields
  portfolioWebsite?: string | null
  githubUrl?:        string | null
  linkedinUrl?:      string | null
  resumeUrl?:        string | null
  resumeFilename?:   string | null
  headline?:         string | null
  // Social links
  telegramUrl?:      string | null
  instagramUrl?:     string | null
  twitterUrl?:       string | null
  youtubeUrl?:       string | null
  tiktokUrl?:        string | null
}

export interface Order {
  id: string
  title: string
  description: string
  category: CategorySlug
  budget: {
    min: number
    max: number
    type: 'fixed' | 'hourly'
  }
  deadline: string
  skills: string[]
  client: {
    id?: string
    name: string
    avatar: string
    ordersPosted: number
    rating: number
  }
  postedAt: string
  responsesCount: number
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  isUrgent: boolean
  isPromoted?: boolean
  progressStatus?: string
}

export interface Category {
  slug: CategorySlug
  label: string
  /** i18n key in `t.createOrder` for the localized label. Falls back to `label`. */
  labelKey?: string
  icon: string
  color: string
  count: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  matchedFreelancers?: Freelancer[]
}
