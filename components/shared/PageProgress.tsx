'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageProgress() {
  const pathname  = usePathname()
  const [width, setWidth]     = useState(0)
  const [visible, setVisible] = useState(false)
  const prevPath   = useRef(pathname)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef  = useRef(true)

  useEffect(() => { return () => { mountedRef.current = false } }, [])

  function startBar() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!mountedRef.current) return
    setVisible(true)
    let w = 0
    setWidth(0)
    intervalRef.current = setInterval(() => {
      if (!mountedRef.current) { clearInterval(intervalRef.current!); return }
      w += Math.random() * 10 + 4
      if (w >= 88) { clearInterval(intervalRef.current!); w = 88 }
      setWidth(w)
    }, 100)
  }

  function finishBar() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!mountedRef.current) return
    setWidth(100)
    setTimeout(() => {
      if (!mountedRef.current) return
      setVisible(false)
      setWidth(0)
    }, 380)
  }

  useEffect(() => {
    function onLinkClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      const href = a.getAttribute('href') ?? ''
      if (!href || href[0] === '#' || /^(https?:|mailto:|tel:)/.test(href) || a.target === '_blank') return
      if (href === pathname) return // same page
      startBar()
    }
    document.addEventListener('click', onLinkClick, true)
    return () => document.removeEventListener('click', onLinkClick, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname
      finishBar()
    }
  }, [pathname])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        height: 2, pointerEvents: 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'linear-gradient(90deg, #7170ff 0%, #a78bfa 40%, #38bdf8 70%, #7170ff 100%)',
          backgroundSize: '300% 100%',
          animation: visible ? 'pg-shimmer 1.8s linear infinite' : 'none',
          transition: width >= 100 ? 'width 0.22s ease-out' : 'width 0.09s linear',
          boxShadow: '0 0 14px rgba(113,112,255,0.9), 0 0 5px rgba(167,139,250,0.6)',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  )
}
