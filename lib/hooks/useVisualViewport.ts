import { useEffect } from 'react'

/**
 * iOS Safari keeps 100dvh at the original viewport height when the soft
 * keyboard opens — so a flush-to-bottom compose bar ends up covered by the
 * keyboard. This hook mirrors `window.visualViewport.height` into the CSS
 * custom property `--fh-vvh` so layouts can lock to the *actually visible*
 * area (`height: var(--fh-vvh, 100dvh)`).
 */
export function useVisualViewport() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement
    const update = () => {
      root.style.setProperty('--fh-vvh', `${vv.height}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      root.style.removeProperty('--fh-vvh')
    }
  }, [])
}
