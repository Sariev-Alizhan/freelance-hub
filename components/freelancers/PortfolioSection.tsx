'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import PortfolioLightbox from '@/components/shared/PortfolioLightbox'
import { PortfolioItem } from '@/lib/types'

interface Props {
  portfolio: PortfolioItem[]
}

export default function PortfolioSection({ portfolio }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  if (portfolio.length === 0) return null

  return (
    <>
      <div className="rounded-2xl border border-subtle bg-card p-6">
        <h2 className="font-semibold mb-4">Портфолио</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portfolio.map((item, i) => (
            <div
              key={item.id}
              className="group rounded-xl overflow-hidden border border-subtle cursor-pointer"
              onClick={() => setLightboxIdx(i)}
            >
              <div className="relative h-32">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'var(--fh-surface-2)' }}
                  >
                    <span style={{ fontSize: '12px', color: 'var(--fh-t4)' }}>Нет фото</span>
                  </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                    Просмотр
                  </span>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate">{item.title}</p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-0.5 mt-0.5 hover:underline"
                    style={{ fontSize: '11px', color: '#7170ff' }}
                  >
                    <ExternalLink className="h-2.5 w-2.5" /> Проект
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIdx !== null && (
        <PortfolioLightbox
          items={portfolio}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => (i! - 1 + portfolio.length) % portfolio.length)}
          onNext={() => setLightboxIdx(i => (i! + 1) % portfolio.length)}
        />
      )}
    </>
  )
}
