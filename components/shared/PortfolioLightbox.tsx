'use client'
import { useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { PortfolioItem } from '@/lib/types'

interface Props {
  items: PortfolioItem[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function PortfolioLightbox({ items, index, onClose, onPrev, onNext }: Props) {
  const item = items[index]

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onPrev()
    if (e.key === 'ArrowRight') onNext()
  }, [onClose, onPrev, onNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center max-w-5xl w-full max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '14px', fontWeight: 510, color: '#f7f8f8' }}>{item.title}</span>
            {item.category && (
              <span style={{
                fontSize: '11px', color: '#8a8f98',
                padding: '2px 8px', borderRadius: '4px',
                background: 'rgba(255,255,255,0.07)',
              }}>
                {item.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                style={{
                  fontSize: '12px', color: '#7170ff', fontWeight: 510,
                  padding: '5px 10px', borderRadius: '6px',
                  background: 'rgba(113,112,255,0.12)',
                  border: '1px solid rgba(113,112,255,0.25)',
                }}
              >
                <ExternalLink className="h-3 w-3" /> Open project
              </a>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center transition-opacity hover:opacity-70"
              style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.08)',
                color: '#f7f8f8',
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="relative w-full rounded-xl overflow-hidden" style={{ maxHeight: '72vh' }}>
          {item.image ? (
            <Image
              src={item.image}
              alt={item.title}
              width={1200}
              height={800}
              className="w-full h-auto object-contain"
              style={{ maxHeight: '72vh' }}
              unoptimized
            />
          ) : (
            <div
              className="w-full flex items-center justify-center"
              style={{ height: '400px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px' }}
            >
              <span style={{ color: '#62666d', fontSize: '14px' }}>No image</span>
            </div>
          )}
        </div>

        {/* Prev / Next */}
        {items.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all hover:opacity-80"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', color: '#f7f8f8',
                marginLeft: '-48px',
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center transition-all hover:opacity-80"
              style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)', color: '#f7f8f8',
                marginRight: '-48px',
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dots */}
        {items.length > 1 && (
          <div className="flex items-center gap-1.5 mt-4">
            {items.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? '20px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === index ? '#7170ff' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
