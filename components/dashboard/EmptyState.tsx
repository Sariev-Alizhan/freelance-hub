import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export default function EmptyState({ emoji, title, sub, href, cta }: {
  emoji: string; title: string; sub: string; href: string; cta: string
}) {
  return (
    <div className="rounded-xl border border-dashed border-subtle p-10 text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4">{sub}</p>
      <Link href={href} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
        {cta} <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
