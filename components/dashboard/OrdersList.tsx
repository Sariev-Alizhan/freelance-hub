import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import EmptyState from './EmptyState'
import { STATUS_CONFIG, type MyOrder } from './types'

export default function OrdersList({ orders }: { orders: MyOrder[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        emoji="📋" title="No orders yet"
        sub="Post your first job and start receiving proposals"
        href="/orders/new" cta="Create order"
      />
    )
  }
  return (
    <div className="space-y-3">
      {orders.map(order => {
        const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.open
        return (
          <Link key={order.id} href={`/orders/${order.id}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-subtle bg-card hover:bg-subtle transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{order.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {order.budget_min.toLocaleString()}–{order.budget_max.toLocaleString()} ₸
                </span>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{order.responses_count} responses</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.color} ${st.bg}`}>
                {st.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
