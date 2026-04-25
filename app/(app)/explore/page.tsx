import Link from 'next/link'
import Image from 'next/image'
import { Briefcase, Package, Sparkles, Star, ArrowRight } from 'lucide-react'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'

export const runtime = 'nodejs'
export const revalidate = 300 // 5 min ISR — fresh enough for a public landing feed

export const metadata: Metadata = {
  title: 'Explore — FreelanceHub',
  description: 'Короткие видео, услуги и посты от фрилансеров СНГ. Найдите специалиста или закажите работу за минуты.',
  openGraph: {
    title: 'FreelanceHub Explore',
    description: 'Трендовые видео, услуги и посты от фрилансеров СНГ',
    type: 'website',
  },
}

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface ServiceRow {
  id: string; freelancer_id: string; title: string
  category: string | null; cover_image: string | null
  purchases_count: number | null
}
interface PostRow {
  id: string; user_id: string; content: string
  tags: string[] | null; created_at: string
}
interface OrderRow {
  id: string; title: string; category: string | null
  budget_min: number | null; budget_max: number | null; created_at: string
}
interface ProfileRow {
  id: string; username: string | null; full_name: string | null
  avatar_url: string | null; is_verified: boolean | null
}

export default async function ExplorePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = serviceClient() as any

  const [servicesRes, postsRes, ordersRes] = await Promise.all([
    db.from('services')
      .select('id, freelancer_id, title, category, cover_image, purchases_count')
      .eq('is_active', true)
      .order('purchases_count', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(6),
    db.from('feed_posts')
      .select('id, user_id, content, tags, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    db.from('orders')
      .select('id, title, category, budget_min, budget_max, created_at')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6),
  ])

  const services = (servicesRes.data ?? []) as ServiceRow[]
  const posts = (postsRes.data ?? []) as PostRow[]
  const orders = (ordersRes.data ?? []) as OrderRow[]

  const authorIds = new Set<string>()
  services.forEach(s => authorIds.add(s.freelancer_id))
  posts.forEach(p => authorIds.add(p.user_id))

  let profMap: Record<string, ProfileRow> = {}
  if (authorIds.size) {
    const { data: profs } = await db
      .from('profiles')
      .select('id, username, full_name, avatar_url, is_verified')
      .in('id', [...authorIds])
    profMap = Object.fromEntries(((profs ?? []) as ProfileRow[]).map(p => [p.id, p]))
  }

  return (
    <div className="page-shell page-shell--wide">
      <section
        className="rounded-3xl mb-8 px-6 py-10 sm:px-10 sm:py-14 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in oklab, var(--fh-primary) 18%, transparent), color-mix(in oklab, var(--fh-primary) 2%, transparent))',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4" style={{ color: 'var(--fh-primary)' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--fh-primary)' }}>
            Explore
          </span>
        </div>
        <h1 style={{
          fontSize: 'clamp(24px, 4.5vw, 40px)', fontWeight: 600, letterSpacing: '-0.03em',
          marginBottom: 8, lineHeight: 1.15,
        }}>
          Лучшее в FreelanceHub сегодня
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mb-5">
          Видео, услуги и посты от фрилансеров СНГ. Найдите специалиста, закажите работу или вдохновитесь.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/auth/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--fh-primary)' }}
          >
            Начать бесплатно
          </Link>
          <Link
            href="/freelancers"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-subtle hover:bg-subtle transition-colors"
          >
            Каталог фрилансеров
          </Link>
        </div>
      </section>

      {services.length > 0 && (
        <SectionHeader icon={Package} title="Популярные услуги" href="/freelancers" />
      )}
      {services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {services.map(s => {
            const prof = profMap[s.freelancer_id]
            return (
              <Link
                key={s.id}
                href={prof?.username ? `/u/${prof.username}#service-${s.id}` : `/freelancers/${s.freelancer_id}`}
                className="block rounded-xl border border-subtle overflow-hidden hover:bg-subtle transition-colors"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: '16 / 9', background: 'var(--fh-surface-2)' }}
                >
                  {s.cover_image ? (
                    <Image src={s.cover_image} alt={s.title} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium line-clamp-2 mb-1">{s.title}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {prof?.full_name ?? prof?.username ?? ''}
                    {s.category && <><span>·</span><span>{s.category}</span></>}
                    {(s.purchases_count ?? 0) > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5" style={{ color: 'var(--fh-primary)' }}>
                          <Star className="h-3 w-3" style={{ fill: 'var(--fh-primary)' }} />
                          {s.purchases_count}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {orders.length > 0 && (
        <SectionHeader icon={Briefcase} title="Свежие заказы" href="/orders" />
      )}
      {orders.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {orders.map(o => {
            const budget = o.budget_min && o.budget_max
              ? `${o.budget_min.toLocaleString()}–${o.budget_max.toLocaleString()} ₸`
              : o.budget_min ? `от ${o.budget_min.toLocaleString()} ₸` : null
            return (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="block p-4 rounded-xl border border-subtle hover:bg-subtle transition-colors"
              >
                <div className="font-medium text-sm line-clamp-2 mb-1.5">{o.title}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {o.category && <span>{o.category}</span>}
                  {budget && <span style={{ color: 'var(--fh-primary)', fontWeight: 600 }}>{budget}</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {posts.length > 0 && (
        <SectionHeader icon={Sparkles} title="Из ленты" href="/feed" />
      )}
      {posts.length > 0 && (
        <div className="space-y-3 mb-10">
          {posts.map(p => {
            const prof = profMap[p.user_id]
            return (
              <Link
                key={p.id}
                href={`/posts/${p.id}`}
                className="block p-4 rounded-xl border border-subtle hover:bg-subtle transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-7 w-7 rounded-full overflow-hidden"
                    style={{ background: 'var(--fh-surface-2)' }}
                  >
                    {prof?.avatar_url && (
                      <Image src={prof.avatar_url} alt="" width={28} height={28} className="h-full w-full object-cover" unoptimized />
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {prof?.full_name ?? prof?.username ?? 'user'}
                  </span>
                </div>
                <div className="text-sm line-clamp-3">{p.content}</div>
              </Link>
            )
          })}
        </div>
      )}

      <section
        className="rounded-2xl p-6 sm:p-10 text-center mb-8"
        style={{ background: 'var(--fh-primary-muted)' }}
      >
        <h2 style={{
          fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 600,
          letterSpacing: '-0.02em', marginBottom: 8,
        }}>
          Готовы присоединиться?
        </h2>
        <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">
          Создайте профиль за 2 минуты, загрузите портфолио и начните принимать заказы.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Link
            href="/auth/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--fh-primary)' }}
          >
            Создать аккаунт
          </Link>
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-subtle hover:bg-subtle transition-colors"
          >
            Войти
          </Link>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, href }: {
  icon: typeof Sparkles; title: string; href: string
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: 'var(--fh-primary)' }} />
        <h2 className="font-semibold text-base">{title}</h2>
      </div>
      <Link
        href={href}
        className="text-sm flex items-center gap-1"
        style={{ color: 'var(--fh-primary)' }}
      >
        Смотреть все <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
