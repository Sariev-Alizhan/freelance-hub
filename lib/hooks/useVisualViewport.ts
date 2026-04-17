import { useEffect } from 'react'

/**
 * Mirrors `window.visualViewport` into two CSS custom properties:
 *   --fh-vvh      → current visible viewport height
 *   --fh-kb-offset → keyboard height (0 when the soft keyboard is down)
 *
 * With `viewport interactiveWidget: 'overlays-content'`, iOS Safari leaves
 * `100dvh` at the full window height when the soft keyboard opens. We pin
 * the compose bar above the keyboard using `--fh-kb-offset`, and pad the
 * messages list by the same amount so the latest message stays visible.
 */
export function useVisualViewport() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      root.style.setProperty('--fh-vvh', `${vv.height}px`)
      root.style.setProperty('--fh-kb-offset', `${kb}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      root.style.removeProperty('--fh-vvh')
      root.style.removeProperty('--fh-kb-offset')
    }
  }, [])
}
