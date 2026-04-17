export interface OtherUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  username: string | null
  is_verified?: boolean | null
}

export interface Conversation {
  id: string
  participant_1: string
  participant_2: string
  last_message: string | null
  last_message_at: string | null
  other_user: OtherUser
  unread: number
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  text: string
  is_read: boolean
  created_at: string
  attachment_url?: string | null
  attachment_type?: 'image' | 'file' | null
  attachment_name?: string | null
  reply_to_id?:   string | null
  reply_to_text?: string | null
  reply_to_name?: string | null
}

export type ReactionMap = Record<string, Record<string, { count: number; mine: boolean }>>
