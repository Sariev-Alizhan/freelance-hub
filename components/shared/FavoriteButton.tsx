'use client'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useUser } from '@/lib/hooks/useUser'

interface Props {
  type: 'order' | 'freelancer'
  targetId: string
  className?: string
}

export default function FavoriteButton({ type, targetId, className = '' }: Props) {
  const { user } = useUser()
  const { isFavorite, toggle } = useFavorites()

  if (!user) return null

  const faved = isFavorite(type, targetId)

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(type, targetId)
      }}
      className={`flex items-center justify-center h-7 w-7 rounded-full transition-all duration-200 ${
        faved
          ? 'bg-red-500/20 text-red-400'
          : 'bg-black/40 backdrop-blur-sm text-white/50 hover:text-red-400 hover:bg-red-500/20'
      } ${className}`}
      aria-label={faved ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <Heart
        className={`h-3.5 w-3.5 transition-all duration-200 ${faved ? 'fill-red-400 stroke-red-400' : ''}`}
      />
    </motion.button>
  )
}
