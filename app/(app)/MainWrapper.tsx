'use client'
import { usePathname } from 'next/navigation'

/**
 * Wraps <main> so that /messages never gets pb-safe-mobile bottom padding
 * (the messenger has its own safe-area handling and no bottom nav).
 * On all other routes the bottom nav padding is applied normally.
 */
export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isMessages = pathname.startsWith('/messages')
  return (
    <main
      className={`flex-1 md:ml-[72px] ${isMessages ? 'messenger-height overflow-hidden flex flex-col' : 'pb-safe-mobile'}`}
      style={isMessages ? undefined : { minWidth: 0, overflowX: 'clip' }}
    >
      {children}
    </main>
  )
}
