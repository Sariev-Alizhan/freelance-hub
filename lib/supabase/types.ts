export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type UserRole = 'client' | 'freelancer'
export type FreelancerLevel = 'new' | 'junior' | 'middle' | 'senior' | 'top'
export type OrderStatus = 'open' | 'in_progress' | 'completed' | 'cancelled'
export type BudgetType = 'fixed' | 'hourly'
export type CategorySlug =
  | 'dev' | 'ux-ui' | 'smm' | 'targeting'
  | 'copywriting' | 'video' | 'tg-bots'
  | 'ai-ml' | 'nocode' | '3d-art'

export interface Database {
  public: {
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          location: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          location?: string | null
          bio?: string | null
        }
        Update: {
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          location?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      freelancer_profiles: {
        Row: {
          id: string
          user_id: string
          title: string
          category: CategorySlug
          skills: string[]
          price_from: number
          price_to: number | null
          level: FreelancerLevel
          response_time: string
          languages: string[]
          is_verified: boolean
          rating: number
          reviews_count: number
          completed_orders: number
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          category: CategorySlug
          skills?: string[]
          price_from: number
          price_to?: number | null
          level?: FreelancerLevel
          response_time?: string
          languages?: string[]
        }
        Update: {
          title?: string
          category?: CategorySlug
          skills?: string[]
          price_from?: number
          price_to?: number | null
          level?: FreelancerLevel
          response_time?: string
          languages?: string[]
        }
      }
      portfolio_items: {
        Row: {
          id: string
          freelancer_id: string
          title: string
          image_url: string | null
          category: string
          created_at: string
        }
        Insert: {
          freelancer_id: string
          title: string
          image_url?: string | null
          category: string
        }
        Update: {
          title?: string
          image_url?: string | null
          category?: string
        }
      }
      orders: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string
          category: CategorySlug
          budget_min: number
          budget_max: number
          budget_type: BudgetType
          deadline: string
          skills: string[]
          status: OrderStatus
          is_urgent: boolean
          responses_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          client_id: string
          title: string
          description: string
          category: CategorySlug
          budget_min: number
          budget_max: number
          budget_type?: BudgetType
          deadline: string
          skills?: string[]
          is_urgent?: boolean
        }
        Update: {
          title?: string
          description?: string
          category?: CategorySlug
          budget_min?: number
          budget_max?: number
          deadline?: string
          skills?: string[]
          status?: OrderStatus
          is_urgent?: boolean
        }
      }
      order_responses: {
        Row: {
          id: string
          order_id: string
          freelancer_id: string
          message: string
          proposed_price: number | null
          created_at: string
        }
        Insert: {
          order_id: string
          freelancer_id: string
          message: string
          proposed_price?: number | null
        }
        Update: {
          message?: string
          proposed_price?: number | null
        }
      }
      reviews: {
        Row: {
          id: string
          order_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          text: string
          created_at: string
        }
        Insert: {
          order_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          text: string
        }
        Update: {
          rating?: number
          text?: string
        }
      }
      freelancer_reviews: {
        Row: {
          id: string
          freelancer_id: string
          reviewer_id: string
          reviewer_name: string
          reviewer_avatar: string | null
          rating: number
          text: string
          created_at: string
        }
        Insert: {
          freelancer_id: string
          reviewer_id: string
          reviewer_name: string
          reviewer_avatar?: string | null
          rating: number
          text: string
        }
        Update: {
          rating?: number
          text?: string
        }
      }
    }
  }
}
