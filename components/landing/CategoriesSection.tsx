'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Code2, PenSquare, BarChart2, Target, PenLine, Video, Bot, Brain, Blocks, Sparkles } from 'lucide-react'
import { CATEGORIES } from '@/lib/mock/categories'

const ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Code2, Figma: PenSquare, BarChart2, Target, PenLine, Video, Bot, Brain, Blocks, Sparkles,
}

export default function CategoriesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: '#0f1011' }}>
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 510,
              letterSpacing: '-0.04em',
              color: '#f7f8f8',
              lineHeight: 1.1,
              marginBottom: '12px',
              fontFeatureSettings: '"cv01", "ss03"',
            }}
          >
            Современные профессии
          </h2>
          <p style={{ fontSize: '15px', color: '#8a8f98', fontWeight: 400, letterSpacing: '-0.01em', lineHeight: 1.6 }}>
            Найдите специалиста или разместите заказ в своей нише
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.icon] || Sparkles
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/freelancers?category=${cat.slug}`}>
                  <div
                    className="group flex flex-col items-center gap-3 p-4 rounded-xl text-center transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                      e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'
                    }}
                  >
                    <div
                      className="h-11 w-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: `${cat.color}14` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 510, color: '#d0d6e0', letterSpacing: '-0.01em' }}>
                      {cat.label}
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
