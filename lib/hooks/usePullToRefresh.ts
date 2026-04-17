'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * Mobile pull-to-refresh gesture. Attaches to `window` and tracks a vertical
 * drag from `scrollY === 0`. When the pull exceeds `threshold`, fires
 * `onRefresh` on touchend and resets. Returns `pullY` so the caller can
 * animate a spinner whose opacity/height scales with the pull distance.
 */
export function usePullToRefresh({
  onRefresh,
  disabled = false,
  threshold = 72,
}: {
  onRefresh: () => void
  disabled?: boolean
  threshold?: number
}) {
  const [pullY, setPullY] = useState(0)
  const touchStart = useRef(0)

  useEffect(() => {
    function onStart(e: TouchEvent) {
      touchStart.current = window.scrollY === 0 ? e.touches[0].clientY : 0
    }
    function onMove(e: TouchEvent) {
      if (!touchStart.current) return
      const delta = e.touches[0].clientY - touchStart.current
      if (delta > 0) setPullY(Math.min(delta * 0.5, threshold + 12))
      else { setPullY(0); touchStart.current = 0 }
    }
    function onEnd() {
      if (pullY >= threshold && !disabled) onRefresh()
      setPullY(0); touchStart.current = 0
    }
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove',  onMove,  { passive: true })
    window.addEventListener('touchend',   onEnd,   { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove',  onMove)
      window.removeEventListener('touchend',   onEnd)
    }
  }, [pullY, disabled, threshold, onRefresh])

  return { pullY, threshold }
}
