'use client'
import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Globe } from 'lucide-react'
import { PortfolioItem } from '@/lib/types'

/** Instagram-style highlights row. Uses portfolio items as source.
 *  Renders gradient-ringed circles; tapping opens a lightbox with details. */
export default function ProfileHighlights({ items }: { items: PortfolioItem[] }) {
  const [active, setActive] = useState<PortfolioItem | null>(null)

  if (!items || items.length === 0) return null
  const list = items.slice(0, 12)

  return (
    <>
      <div style={{
        display: 'flex', gap: 14, overflowX: 'auto',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        padding: '2px 2px 6px',
      }}>
        {list.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setActive(item)}
            style={{
              flexShrink: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 6, width: 72,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 68, height: 68, borderRadius: '50%', padding: 2,
              background: ringGradient(i),
            }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                border: '2px solid var(--fh-canvas)', overflow: 'hidden',
                background: 'var(--fh-surface-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.image ? (
                  <Image src={item.image} alt={item.title} width={60} height={60}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '50%' }} unoptimized />
                ) : (
                  <Globe style={{ width: 22, height: 22, color: 'var(--fh-t4)' }} />
                )}
              </div>
            </div>
            <span style={{
              fontSize: 11, color: 'var(--fh-t3)', fontWeight: 510,
              width: '100%', textAlign: 'center',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.title}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="bg"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
              }}
            />
            <motion.div
              key="card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed', zIndex: 201,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(92vw, 440px)',
                maxHeight: '88dvh', overflowY: 'auto',
                borderRadius: 20,
                background: 'var(--card)',
                border: '1px solid var(--fh-border-2)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
              }}
            >
              <button onClick={() => setActive(null)} aria-label="Close" style={{
                position: 'absolute', top: 12, right: 12, zIndex: 2,
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(0,0,0,0.35)', color: '#fff',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
              {active.image && (
                <div style={{
                  position: 'relative', width: '100%', aspectRatio: '4/3',
                  background: '#000',
                }}>
                  <Image src={active.image} alt={active.title} fill
                    style={{ objectFit: 'cover' }} unoptimized />
                </div>
              )}
              <div style={{ padding: 18 }}>
                <h3 style={{
                  fontSize: 18, fontWeight: 700, color: 'var(--fh-t1)',
                  letterSpacing: '-0.02em', margin: 0,
                }}>
                  {active.title}
                </h3>
                {active.category && (
                  <p style={{ fontSize: 13, color: 'var(--fh-t4)', margin: '6px 0 0' }}>
                    {active.category}
                  </p>
                )}
                {active.url && (
                  <a
                    href={active.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      marginTop: 14, padding: '10px 16px', borderRadius: 10,
                      background: 'var(--fh-primary)', color: '#fff',
                      fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    <ExternalLink style={{ width: 14, height: 14 }} />
                    View project
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function ringGradient(i: number): string {
  const palettes = [
    'linear-gradient(45deg, #feda75 0%, #d62976 50%, #4f5bd5 100%)',
    'linear-gradient(45deg, #5e6ad2 0%, #a855f7 50%, #ec4899 100%)',
    'linear-gradient(45deg, #27a644 0%, #5e6ad2 100%)',
    'linear-gradient(45deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(45deg, #06b6d4 0%, #8b5cf6 100%)',
  ]
  return palettes[i % palettes.length]
}
