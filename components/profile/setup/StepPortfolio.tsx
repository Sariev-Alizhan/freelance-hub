'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { slide, type FormData, type PortfolioItem } from './types'

export default function StepPortfolio({ form, onSet }: {
  form: FormData
  onSet: <K extends keyof FormData>(key: K, value: FormData[K]) => void
}) {
  const [portfolioForm, setPortfolioForm] = useState<PortfolioItem>({ title: '', imageUrl: '', category: '', url: '' })
  const [showPortfolioAdd, setShowPortfolioAdd] = useState(false)

  function addPortfolioItem() {
    if (!portfolioForm.title.trim()) return
    onSet('portfolio', [...form.portfolio, { ...portfolioForm }])
    setPortfolioForm({ title: '', imageUrl: '', category: '', url: '' })
    setShowPortfolioAdd(false)
  }

  return (
    <motion.div key="s3" {...slide} className="space-y-5">
      <div>
        <h2 className="text-lg font-bold mb-1">Portfolio</h2>
        <p className="text-sm text-muted-foreground">Show your best work (optional)</p>
      </div>

      {form.portfolio.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {form.portfolio.map((item, i) => (
            <div key={i} className="relative rounded-xl border border-subtle overflow-hidden group bg-background">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-subtle flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.category && <p className="text-xs text-muted-foreground">{item.category}</p>}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-primary hover:underline truncate"
                    >
                      Открыть ↗
                    </a>
                  )}
                </div>
              </div>
              <button
                onClick={() => onSet('portfolio', form.portfolio.filter((_, idx) => idx !== i))}
                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
              >
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showPortfolioAdd ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden"
          >
            <div className="p-4 space-y-3">
              <p className="text-sm font-medium text-primary">New project</p>
              <input
                value={portfolioForm.title}
                onChange={e => setPortfolioForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Project name *"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input
                value={portfolioForm.imageUrl}
                onChange={e => setPortfolioForm(p => ({ ...p, imageUrl: e.target.value }))}
                placeholder="Image URL"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input
                value={portfolioForm.category}
                onChange={e => setPortfolioForm(p => ({ ...p, category: e.target.value }))}
                placeholder="Category (e.g., Landing page, Mobile app)"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <input
                value={portfolioForm.url}
                onChange={e => setPortfolioForm(p => ({ ...p, url: e.target.value }))}
                placeholder="Project link (optional)"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-subtle text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowPortfolioAdd(false); setPortfolioForm({ title: '', imageUrl: '', category: '', url: '' }) }}
                  className="flex-1 py-2.5 rounded-xl border border-subtle text-sm font-medium hover:bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addPortfolioItem}
                  disabled={!portfolioForm.title.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowPortfolioAdd(true)}
            disabled={form.portfolio.length >= 8}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/15 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">
              {form.portfolio.length >= 8 ? 'Maximum 8 projects' : 'Add project'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {form.portfolio.length === 0 && !showPortfolioAdd && (
        <p className="text-center text-xs text-muted-foreground">
          Portfolio is optional, but increases your chance of getting hired 3x
        </p>
      )}
    </motion.div>
  )
}
