'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'

interface Favorite {
  id: string
  target_type: 'order' | 'freelancer'
  target_id: string
}

// Module-level cache so all hook instances share state
let _cache: Favorite[] | null = null
const _listeners = new Set<(favs: Favorite[]) => void>()

function notifyAll(favs: Favorite[]) {
  _listeners.forEach((fn) => fn(favs))
}

export function useFavorites() {
  const { user } = useUser()
  const [favorites, setFavorites] = useState<Favorite[]>(_cache ?? [])
  const loadedRef = useRef(false)

  // Subscribe to shared state changes
  useEffect(() => {
    const handler = (favs: Favorite[]) => setFavorites([...favs])
    _listeners.add(handler)
    return () => { _listeners.delete(handler) }
  }, [])

  // Load once per session
  useEffect(() => {
    if (!user || loadedRef.current || _cache !== null) {
      if (_cache !== null) setFavorites([..._cache])
      return
    }
    loadedRef.current = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = createClient() as any
    db.from('favorites')
      .select('id,target_type,target_id')
      .eq('user_id', user.id)
      .then(({ data }: { data: Favorite[] | null }) => {
        if (data) {
          _cache = data
          setFavorites(data)
          notifyAll(data)
        }
      })
  }, [user])

  const isFavorite = useCallback(
    (type: 'order' | 'freelancer', id: string) =>
      favorites.some((f) => f.target_type === type && f.target_id === id),
    [favorites]
  )

  const toggle = useCallback(
    async (type: 'order' | 'freelancer', targetId: string) => {
      if (!user) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = createClient() as any
      const existing = (_cache ?? []).find(
        (f) => f.target_type === type && f.target_id === targetId
      )

      if (existing) {
        // Optimistic remove
        const next = (_cache ?? []).filter((f) => f.id !== existing.id)
        _cache = next
        notifyAll(next)
        await db.from('favorites').delete().eq('id', existing.id)
      } else {
        // Optimistic add with temp id
        const temp: Favorite = {
          id: `temp-${Date.now()}`,
          target_type: type,
          target_id: targetId,
        }
        const next = [...(_cache ?? []), temp]
        _cache = next
        notifyAll(next)
        const { data } = await db
          .from('favorites')
          .insert({ user_id: user.id, target_type: type, target_id: targetId })
          .select('id,target_type,target_id')
          .single()
        if (data && _cache) {
          _cache = _cache.map((f) => (f.id === temp.id ? data : f))
          notifyAll([..._cache])
        }
      }
    },
    [user]
  )

  return { favorites, isFavorite, toggle }
}
