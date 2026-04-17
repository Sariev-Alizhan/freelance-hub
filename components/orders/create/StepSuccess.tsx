'use client'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function StepSuccess({ orderId }: { orderId: string | null }) {
  const router = useRouter()
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <div className="h-20 w-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
        <Check className="h-10 w-10 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Order published!</h2>
      <p className="text-muted-foreground mb-8">
        Specialists can already see your order and will start responding soon
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
          >
            View order
          </button>
        )}
        <button
          onClick={() => router.push('/orders')}
          className="px-6 py-3 rounded-xl border border-subtle font-semibold hover:bg-subtle transition-colors"
        >
          All orders
        </button>
      </div>
    </motion.div>
  )
}
