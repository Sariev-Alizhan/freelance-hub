'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Wraps <main> so that /messages never gets pb-safe-mobile bottom padding
 * (the messenger has its own safe-area handling and no bottom nav) and
 * locks page-level scrolling while the messenger is open so the composer
 * stays pinned to the bottom of the viewport with no dead space below it.
 */
export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessages = pathname.startsWith('/messages')

  useEffect(() => {
    if (!isMessages) return
    document.documentElement.classList.add('messenger-locked')
    document.body.classList.add('messenger-locked')
    return () => {
      document.documentElement.classList.remove('messenger-locked')
      document.body.classList.remove('messenger-locked')
    }
  }, [isMessages])

  return (
    <main
      className={`flex-1 md:ml-[72px] ${isMessages ? 'messenger-height overflow-hidden flex flex-col' : 'pb-safe-mobile'}`}
      style={isMessages ? undefined : { minWidth: 0, overflowX: 'clip' }}
    >
      {children}
    </main>
  )
}
