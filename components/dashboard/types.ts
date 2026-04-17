export interface Profile {
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  role: string
  username: string | null
}

export type AvailabilityStatus = 'open' | 'busy' | 'vacation'

export const AVAILABILITY_CONFIG: Record<AvailabilityStatus, { label: string; dot: string; border: string; bg: string }> = {
  open:     { label: 'Available',   dot: '#27a644', border: 'rgba(39,166,68,0.25)',    bg: 'rgba(39,166,68,0.06)'    },
  busy:     { label: 'Busy',        dot: '#f59e0b', border: 'rgba(245,158,11,0.25)',   bg: 'rgba(245,158,11,0.06)'   },
  vacation: { label: 'On vacation', dot: '#8a8f98', border: 'rgba(138,143,152,0.25)',  bg: 'rgba(138,143,152,0.06)'  },
}

export interface FreelancerProfile {
  title: string; category: string; skills: string[]
  price_from: number; price_to: number | null
  level: string; rating: number; reviews_count: number; completed_orders: number
  availability_status?: AvailabilityStatus
}

export interface MyOrder {
  id: string; title: string; status: string
  budget_min: number; budget_max: number
  responses_count: number; created_at: string; category: string
}

export interface MyResponse {
  id: string; proposed_price: number | null; created_at: string
  status: 'pending' | 'accepted' | 'rejected'
  message: string | null
  order: { id: string; title: string; status: string; budget_min: number; budget_max: number }
}

export interface DashboardAnalytics {
  views7: number
  views30: number
  responsesThisMonth: number
  responseLimit: number | null
  isPremium: boolean
  isVerified: boolean
  verificationRequested: boolean
  viewsByDay: { day: string; count: number }[]
}

export const LEVEL_LABELS: Record<string, string> = {
  new: '🌱 Newcomer', junior: '⚡ Junior', middle: '🔥 Middle', senior: '💎 Senior', top: '👑 Top',
}

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: 'text-green-400',        bg: 'bg-green-500/10' },
  in_progress: { label: 'In progress', color: 'text-blue-400',         bg: 'bg-blue-500/10'  },
  completed:   { label: 'Completed',   color: 'text-muted-foreground', bg: 'bg-subtle'       },
  cancelled:   { label: 'Cancelled',   color: 'text-red-400',          bg: 'bg-red-500/10'   },
}

export interface FavoriteItem {
  id: string
  target_type: 'order' | 'freelancer'
  target_id: string
}

export interface FavOrder      { id: string; title: string; budget_min: number; budget_max: number }
export interface FavFreelancer { id: string; name: string; avatar: string; title: string; rating: number }
