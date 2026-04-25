export interface UserPost {
  id: string
  content: string
  tags: string[]
  created_at: string
  user_id: string
  profiles: { full_name: string | null; avatar_url: string | null; username: string | null; is_verified?: boolean | null } | null
}

export interface Reactions {
  likes: number
  dislikes: number
  saves: number
  reposts: number
  mine: string[]
}

export interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { full_name: string | null; avatar_url: string | null; username: string | null } | null
}

/** Minimal profile fields the card shells need for the inline comment composer. */
export type FeedProfile = { avatar_url: string | null; full_name: string | null } | null

/** Minimal user handle the card shells need to gate actions. */
export type FeedUser = { id: string } | null
