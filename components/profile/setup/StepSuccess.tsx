'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StepSuccess() {
  const router = useRouter()
  return (
    <motion.div
      key="s5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="h-24 w-24 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6"
      >
        <Check className="h-12 w-12 text-green-400" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">Profile ready! 🎉</h2>
      <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
        Your profile is published. Clients can now find you and offer projects
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          Find orders
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors"
        >
          My operations
        </button>
      </div>
    </motion.div>
  )
}
